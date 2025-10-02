import { Toaster } from './components/ui/sonner';
import { GuestPanel } from './components/GuestPanel';
import { TableCircle } from './components/TableCircle';
import type { Guest, Table } from './types';
import { TABLE_CONSTANTS } from './constants';
import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';
import { useSyncedKV } from './hooks/use-synced-kv';

function App() {
  const [guests, setGuests] = useSyncedKV<Guest[]>("wedding-guests", []);
  const [tables, setTables] = useSyncedKV<Table[]>("wedding-tables", []);
  const [draggedGuest, setDraggedGuest] = useState<Guest | null>(null);

  // Get unassigned guests (not in any table)
  const unassignedGuests = guests.filter(guest => 
    !tables.some(table => table.guests.some(g => g?.id === guest.id))
  );

  const handleAddGuest = (name: string) => {
    const newGuest: Guest = {
      id: uuidv4(),
      name
    };
    setGuests([...guests, newGuest]);
  };

  const handleRemoveGuest = (guestId: string) => {
    // Remove from guests list
    setGuests(guests.filter(g => g.id !== guestId));
    
    // Remove from any table they're in
    setTables(tables.map(table => ({
      ...table,
      guests: table.guests.map(g => g?.id === guestId ? null : g)
    })));
  };

  const handleGenerateTables = () => {
    if (guests.length === 0) return;
    
    const numberOfTables = Math.ceil(guests.length / TABLE_CONSTANTS.SUGGESTED_GUESTS_PER_TABLE);
    const newTables: Table[] = Array.from({ length: numberOfTables }, (_, i) => ({
      id: i + 1,
      guests: Array(TABLE_CONSTANTS.SEATS_PER_TABLE).fill(null)
    }));
    
    setTables(newTables);
  };

  const handleAddTable = () => {
    const newTable: Table = {
      id: tables.length + 1,
      guests: Array(TABLE_CONSTANTS.SEATS_PER_TABLE).fill(null)
    };
    setTables([...tables, newTable]);
  };

  const handleGuestAdd = (tableId: number, position: number, guest: Guest) => {
    setTables(tables.map(table => {
      if (table.id === tableId) {
        const newGuests = [...table.guests];
        newGuests[position] = guest;
        return { ...table, guests: newGuests };
      }
      // Remove guest from other tables if they're being moved
      return {
        ...table,
        guests: table.guests.map(g => g?.id === guest.id ? null : g)
      };
    }));
  };

  const handleGuestRemove = (tableId: number, position: number) => {
    setTables(tables.map(table => {
      if (table.id === tableId) {
        const newGuests = [...table.guests];
        newGuests[position] = null;
        return { ...table, guests: newGuests };
      }
      return table;
    }));
  };

  const handleGuestDragStart = (guest: Guest) => {
    setDraggedGuest(guest);
  };

  const handleGuestDragEnd = () => {
    setDraggedGuest(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-playfair text-4xl font-semibold text-foreground mb-2">
            Planificador
          </h1>
          <p className="text-muted-foreground">
            Organiza a tus invitados en mesas de 10 personas de manera visual y sencilla
          </p>
        </div>

        {/* Main layout */}
        <div className="flex gap-6">
          {/* Left panel - Guest management */}
          <GuestPanel
            unassignedGuests={unassignedGuests}
            onAddGuest={handleAddGuest}
            onRemoveGuest={handleRemoveGuest}
            onGenerateTables={handleGenerateTables}
            onAddTable={handleAddTable}
            totalGuests={guests.length}
            totalTables={tables.length}
            tables={tables}
            allGuests={guests}
          />

          {/* Right area - Tables grid */}
          <div className="flex-1">
            {tables.length === 0 ? (
              <div className="flex items-center justify-center h-96 text-center">
                <div className="space-y-2">
                  <p className="text-lg text-muted-foreground">
                    Agrega invitados y genera mesas para comenzar
                  </p>
                  <p className="text-sm text-muted-foreground">
                    💡 Cada mesa tiene capacidad para {TABLE_CONSTANTS.SEATS_PER_TABLE} personas
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tables.map(table => (
                  <TableCircle
                    key={table.id}
                    tableNumber={table.id}
                    guests={table.guests}
                    onGuestAdd={(position, guest) => handleGuestAdd(table.id, position, guest)}
                    onGuestRemove={(position) => handleGuestRemove(table.id, position)}
                    onGuestDragStart={(_position, guest) => handleGuestDragStart(guest)}
                    onGuestDragEnd={handleGuestDragEnd}
                    draggedGuest={draggedGuest}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default App;