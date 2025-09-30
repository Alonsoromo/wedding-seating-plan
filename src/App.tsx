import { useKV } from '@github/spark/hooks';
import { useState, useEffect } from 'react';
import { TableCircle } from './components/TableCircle';
import { GuestPanel } from './components/GuestPanel';
import { ExportPDF } from './components/ExportPDF';
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
  const [draggedFromTable, setDraggedFromTable] = useState<{tableId: number, position: number} | null>(null);

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
    const guestCount = (guests || []).length;
    // Always generate at least 2 tables if there are guests, or 1 if no guests
    const suggestedTables = guestCount === 0 ? 1 : Math.max(2, Math.ceil(guestCount / 10));
    const newTables: Table[] = Array.from({ length: suggestedTables }, (_, index) => ({
      id: index + 1,
      guests: Array(10).fill(null)
    }));
    
    setTables(newTables);
    toast.success(`${suggestedTables} mesa${suggestedTables === 1 ? '' : 's'} generada${suggestedTables === 1 ? '' : 's'}`);
  };

  const addSingleTable = () => {
    const nextTableId = Math.max(0, ...(tables || []).map(t => t.id)) + 1;
    const newTable: Table = {
      id: nextTableId,
      guests: Array(10).fill(null)
    };
    
    setTables(currentTables => [...(currentTables || []), newTable]);
    toast.success(`Mesa ${nextTableId} agregada`);
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

  const handleGuestDragStart = (tableId: number, position: number, guest: Guest) => {
    setDraggedGuest(guest);
    setDraggedFromTable({ tableId, position });
  };

  const handleGuestDragEnd = () => {
    setDraggedGuest(null);
    setDraggedFromTable(null);
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
          {/* Drag indicator */}
          {draggedGuest && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-accent text-accent-foreground px-4 py-2 rounded-lg shadow-lg border-2 border-accent animate-bounce">
              <span className="text-sm font-medium">Arrastrando: {draggedGuest.name}</span>
            </div>
          )}
          
          {/* Guest Panel */}
          <GuestPanel
            unassignedGuests={unassignedGuests}
            onAddGuest={addGuest}
            onRemoveGuest={removeGuest}
            onGenerateTables={generateTables}
            onAddTable={addSingleTable}
            totalGuests={(guests || []).length}
            totalTables={(tables || []).length}
            tables={tables || []}
            allGuests={guests || []}
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
                  <div className="flex gap-3">
                    <ExportPDF tables={tables || []} guests={guests || []} />
                    <Button 
                      variant="outline" 
                      onClick={resetAll}
                      className="text-destructive hover:text-destructive"
                    >
                      <ArrowClockwise className="mr-2" size={16} />
                      Reiniciar Todo
                    </Button>
                  </div>
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
                      onGuestDragStart={(position, guest) =>
                        handleGuestDragStart(table.id, position, guest)
                      }
                      onGuestDragEnd={handleGuestDragEnd}
                      draggedGuest={draggedGuest}
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