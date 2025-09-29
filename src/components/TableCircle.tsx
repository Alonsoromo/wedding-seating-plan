import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "@phosphor-icons/react";
import { useState } from 'react';

interface Guest {
  id: string;
  name: string;
}

interface TableCircleProps {
  tableNumber: number;
  guests: (Guest | null)[];
  onGuestAdd: (position: number, guest: Guest) => void;
  onGuestRemove: (position: number) => void;
}

export function TableCircle({ tableNumber, guests, onGuestAdd, onGuestRemove }: TableCircleProps) {
  const [dragOverPosition, setDragOverPosition] = useState<number | null>(null);
  
  const isComplete = guests.filter(g => g !== null).length === 10;
  const guestCount = guests.filter(g => g !== null).length;

  const handleDragOver = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    setDragOverPosition(position);
  };

  const handleDragLeave = () => {
    setDragOverPosition(null);
  };

  const handleDrop = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    setDragOverPosition(null);
    
    if (guests[position] !== null) return; // Position occupied
    
    try {
      const guestData = JSON.parse(e.dataTransfer.getData('text/plain'));
      onGuestAdd(position, guestData);
    } catch (error) {
      console.error('Error parsing dropped guest data:', error);
    }
  };

  // Calculate positions for 10 seats around a circle
  const getSeatPosition = (index: number) => {
    const angle = (index * 36) - 90; // 360/10 = 36 degrees per seat, start at top
    const radius = 80;
    const x = Math.cos(angle * Math.PI / 180) * radius;
    const y = Math.sin(angle * Math.PI / 180) * radius;
    return { x, y };
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-center">
        <h3 className="font-semibold text-lg text-foreground">Mesa {tableNumber}</h3>
        <p className="text-sm text-muted-foreground">{guestCount}/10 invitados</p>
      </div>
      
      <div className="relative">
        {/* Table surface */}
        <div 
          className={`w-48 h-48 rounded-full border-4 ${
            isComplete 
              ? 'table-complete border-primary' 
              : 'table-incomplete border-primary/30'
          } shadow-lg transition-all duration-300`}
        />
        
        {/* Table number in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
            <span className="font-semibold text-primary">{tableNumber}</span>
          </div>
        </div>
        
        {/* Guest seats */}
        {Array.from({ length: 10 }).map((_, index) => {
          const position = getSeatPosition(index);
          const guest = guests[index];
          const isDragOver = dragOverPosition === index;
          
          return (
            <div
              key={index}
              className="absolute"
              style={{
                left: `calc(50% + ${position.x}px - 20px)`,
                top: `calc(50% + ${position.y}px - 16px)`,
              }}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
            >
              {guest ? (
                <div className="group relative">
                  <Badge 
                    variant="default" 
                    className="bg-primary text-primary-foreground px-2 py-1 text-xs max-w-20 truncate"
                  >
                    {guest.name}
                  </Badge>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onGuestRemove(index)}
                  >
                    <X size={8} />
                  </Button>
                </div>
              ) : (
                <div 
                  className={`w-10 h-8 rounded border-2 border-dashed transition-all duration-200 ${
                    isDragOver 
                      ? 'border-accent bg-accent/20 scale-110' 
                      : 'border-border bg-muted/50 hover:border-primary/50'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}