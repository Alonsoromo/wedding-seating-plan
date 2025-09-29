import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Users } from "@phosphor-icons/react";
import { useState } from 'react';
import { GuestCard } from './GuestCard';

interface Guest {
  id: string;
  name: string;
}

interface GuestPanelProps {
  unassignedGuests: Guest[];
  onAddGuest: (name: string) => void;
  onRemoveGuest: (guestId: string) => void;
  onGenerateTables: () => void;
  totalGuests: number;
  totalTables: number;
}

export function GuestPanel({ 
  unassignedGuests, 
  onAddGuest, 
  onRemoveGuest, 
  onGenerateTables,
  totalGuests,
  totalTables 
}: GuestPanelProps) {
  const [newGuestName, setNewGuestName] = useState('');

  const handleAddGuest = () => {
    if (newGuestName.trim()) {
      onAddGuest(newGuestName.trim());
      setNewGuestName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddGuest();
    }
  };

  return (
    <Card className="w-80 h-full border-primary/20 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 font-playfair text-xl">
          <Users className="text-primary" />
          Invitados
        </CardTitle>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Total: {totalGuests}</span>
          <span>Mesas: {totalTables}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Add new guest */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Nombre del invitado"
              value={newGuestName}
              onChange={(e) => setNewGuestName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button 
              onClick={handleAddGuest}
              disabled={!newGuestName.trim()}
              size="icon"
            >
              <Plus />
            </Button>
          </div>
          
          {totalGuests > 0 && (
            <Button 
              onClick={onGenerateTables}
              className="w-full bg-accent hover:bg-accent/90"
              variant="default"
            >
              Generar Mesas ({Math.ceil(totalGuests / 10)})
            </Button>
          )}
        </div>

        <Separator />

        {/* Unassigned guests */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">
            Sin asignar ({unassignedGuests.length})
          </h4>
          
          {unassignedGuests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {totalGuests === 0 
                ? "Agrega invitados para comenzar" 
                : "Todos los invitados están asignados"}
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {unassignedGuests.map((guest) => (
                <GuestCard
                  key={guest.id}
                  guest={guest}
                  onRemove={() => onRemoveGuest(guest.id)}
                  showRemove
                />
              ))}
            </div>
          )}
        </div>

        {totalGuests > 0 && (
          <>
            <Separator />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>💡 Arrastra invitados a las mesas</p>
              <p>💡 Cada mesa tiene capacidad para 10 personas</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}