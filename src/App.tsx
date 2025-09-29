import { useKV } from '@github/spark/hooks';
import { useState, useEffect } from 'react';
import { TableCircle } from './components/TableCircle';
import { GuestPanel } from './components/GuestPanel';
import { Button } from './components/ui/button';
import { ArrowClockwise } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';

interface Guest {
  id: string;
  name: string;
}

interface Table {
  id: number;
  guests: (Guest | null)[];
}

function App() {
  const [guests, setGuests] = useKV<Guest[]>("wedding-guests", []);
  const [tables, setTables] = useKV<Table[]>("wedding-tables", []);
  const [draggedGuest, setDraggedGuest] = useState<Guest | null>(null);

  const addGuest = (name: string) => {
    const newGuest: Guest = {
      id: Date.now().toString(),
      name: name
    };
    setGuests(currentGuests => [...(currentGuests || []), newGuest]);
    toast.success(`${name} agregado a la lista`);
  };

  const removeGuest = (guestId: string) => {
    setGuests(currentGuests => (currentGuests || []).filter(g => g.id !== guestId));
    
    // Remove from tables if assigned
    setTables(currentTables =>
      (currentTables || []).map(table => ({
        ...table,
        guests: table.guests.map(guest => 
          guest && guest.id === guestId ? null : guest
        )
      }))
    );
    toast.success("Invitado eliminado");
  };

  const generateTables = () => {
    const numberOfTables = Math.ceil((guests || []).length / 10);
    const newTables: Table[] = Array.from({ length: numberOfTables }, (_, index) => ({
      id: index + 1,
      guests: Array(10).fill(null)
    }));
    
    setTables(newTables);
    toast.success(`${numberOfTables} mesas generadas`);
  };

  const assignGuestToTable = (tableId: number, position: number, guest: Guest) => {
    // Remove guest from other tables first
    setTables(currentTables =>
      (currentTables || []).map(table => ({
        ...table,
        guests: table.guests.map(g => 
          g && g.id === guest.id ? null : g
        )
      }))
    );

    // Then assign to new position
    setTables(currentTables =>
      (currentTables || []).map(table =>
        table.id === tableId
          ? {
              ...table,
              guests: table.guests.map((g, i) =>
                i === position ? guest : g
              )
            }
          : table
      )
    );

    toast.success(`${guest.name} asignado a Mesa ${tableId}`);
  };

  const removeGuestFromTable = (tableId: number, position: number) => {
    setTables(currentTables =>
      (currentTables || []).map(table =>
        table.id === tableId
          ? {
              ...table,
              guests: table.guests.map((g, i) =>
                i === position ? null : g
              )
            }
          : table
      )
    );
  };

  const resetAll = () => {
    setGuests([]);
    setTables([]);
    toast.success("Todo reiniciado");
  };

  // Get unassigned guests
  const assignedGuestIds = new Set(
    (tables || []).flatMap(table => 
      table.guests.filter(g => g !== null).map(g => g!.id)
    )
  );
  const unassignedGuests = (guests || []).filter(guest => !assignedGuestIds.has(guest.id));

  // Get statistics
  const totalAssigned = (guests || []).length - unassignedGuests.length;
  const completeTables = (tables || []).filter(table => 
    table.guests.filter(g => g !== null).length === 10
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-playfair text-4xl font-semibold text-foreground mb-2">
            Planificador de Mesas
          </h1>
          <p className="text-muted-foreground">
            Organiza a tus invitados en mesas de 10 personas de manera visual y sencilla
          </p>
          
          {(guests || []).length > 0 && (
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <span className="text-muted-foreground">
                <strong className="text-foreground">{totalAssigned}</strong> asignados
              </span>
              <span className="text-muted-foreground">
                <strong className="text-foreground">{unassignedGuests.length}</strong> sin asignar
              </span>
              <span className="text-muted-foreground">
                <strong className="text-foreground">{completeTables}</strong> mesas completas
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-8 justify-center">
          {/* Guest Panel */}
          <GuestPanel
            unassignedGuests={unassignedGuests}
            onAddGuest={addGuest}
            onRemoveGuest={removeGuest}
            onGenerateTables={generateTables}
            totalGuests={(guests || []).length}
            totalTables={(tables || []).length}
          />

          {/* Tables Area */}
          <div className="flex-1 max-w-6xl">
            {(tables || []).length === 0 ? (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-3xl">🎊</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    ¡Comienza agregando invitados!
                  </h3>
                  <p className="text-muted-foreground">
                    Agrega los nombres de tus invitados y luego genera las mesas automáticamente.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-semibold text-foreground">
                    Distribución de Mesas
                  </h2>
                  <Button 
                    variant="outline" 
                    onClick={resetAll}
                    className="text-destructive hover:text-destructive"
                  >
                    <ArrowClockwise className="mr-2" size={16} />
                    Reiniciar Todo
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(tables || []).map((table) => (
                    <TableCircle
                      key={table.id}
                      tableNumber={table.id}
                      guests={table.guests}
                      onGuestAdd={(position, guest) => 
                        assignGuestToTable(table.id, position, guest)
                      }
                      onGuestRemove={(position) => 
                        removeGuestFromTable(table.id, position)
                      }
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default App;