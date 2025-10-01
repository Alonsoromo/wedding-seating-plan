import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "@phosphor-icons/react";
import { useState } from 'react';
import type { Guest } from '@/types';
import { TABLE_CONSTANTS, DRAG_FEEDBACK } from '@/constants';

interface TableCircleProps {
  tableNumber: number;
  guests: (Guest | null)[];
  onGuestAdd: (position: number, guest: Guest) => void;
  onGuestRemove: (position: number) => void;
  onGuestDragStart?: (position: number, guest: Guest) => void;
  onGuestDragEnd?: () => void;
  draggedGuest?: Guest | null;
}

export function TableCircle({ 
  tableNumber, 
  guests, 
  onGuestAdd, 
  onGuestRemove, 
  onGuestDragStart,
  onGuestDragEnd,
  draggedGuest 
}: TableCircleProps) {
  const [dragOverPosition, setDragOverPosition] = useState<number | null>(null);
  const [isDragOverTable, setIsDragOverTable] = useState(false);
  
  const isComplete = guests.filter(g => g !== null).length === TABLE_CONSTANTS.SEATS_PER_TABLE;
  const guestCount = guests.filter(g => g !== null).length;
  const hasAvailableSeats = guests.some(g => g === null);

  const handleDragOver = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    if (guests[position] === null) { // Only allow drop on empty seats
      setDragOverPosition(position);
    }
  };

  const handleTableDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (hasAvailableSeats && draggedGuest) {
      setIsDragOverTable(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're actually leaving the table area
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverPosition(null);
      setIsDragOverTable(false);
    }
  };

  const handleDrop = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    setDragOverPosition(null);
    
    if (guests[position] !== null) return; // Position occupied
    
    try {
      const guestData = JSON.parse(e.dataTransfer.getData('text/plain'));
      onGuestAdd(position, guestData);
      onGuestDragEnd?.(); // Clear drag state on successful drop
    } catch (error) {
      console.error('Error parsing dropped guest data:', error);
    }
  };

  // Calculate positions for seats around a circle
  const getSeatPosition = (index: number) => {
    const angle = (index * TABLE_CONSTANTS.DEGREES_PER_SEAT) + TABLE_CONSTANTS.STARTING_ANGLE;
    const x = Math.cos(angle * Math.PI / 180) * TABLE_CONSTANTS.CIRCLE_RADIUS;
    const y = Math.sin(angle * Math.PI / 180) * TABLE_CONSTANTS.CIRCLE_RADIUS;
    return { x, y };
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-center">
        <h3 className="font-semibold text-lg text-foreground">Mesa {tableNumber}</h3>
        <p className="text-sm text-muted-foreground">{guestCount}/{TABLE_CONSTANTS.SEATS_PER_TABLE} invitados</p>
      </div>
      
      <div className="relative">
        {/* Table surface */}
        <div 
          className={`w-48 h-48 rounded-full border-4 transition-all duration-300 ${
            isComplete 
              ? 'table-complete border-primary' 
              : isDragOverTable && hasAvailableSeats
              ? 'table-incomplete border-accent border-dashed animate-pulse'
              : 'table-incomplete border-primary/30'
          } shadow-lg`}
          onDragOver={handleTableDragOver}
          onDragLeave={handleDragLeave}
        />
        
        {/* Table number in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
            <span className="font-semibold text-primary">{tableNumber}</span>
          </div>
        </div>
        
        {/* Guest seats */}
        {Array.from({ length: TABLE_CONSTANTS.SEATS_PER_TABLE }).map((_, index) => {
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
                    className={`bg-primary text-primary-foreground px-2 py-1 text-xs max-w-20 truncate cursor-move select-none transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                      draggedGuest && draggedGuest.id === guest.id ? `opacity-${DRAG_FEEDBACK.OPACITY_DRAGGING} scale-${DRAG_FEEDBACK.SCALE_DRAGGING}` : ''
                    }`}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', JSON.stringify(guest));
                      onGuestDragStart?.(index, guest);
                    }}
                    onDragEnd={() => {
                      onGuestDragEnd?.();
                    }}
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
                    isDragOverTable && hasAvailableSeats
                      ? 'border-accent bg-accent/20 animate-pulse'
                      : isDragOver 
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