import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "@phosphor-icons/react";

interface GuestCardProps {
  guest: {
    id: string;
    name: string;
  };
  onRemove?: () => void;
  isDragging?: boolean;
  showRemove?: boolean;
}

export function GuestCard({ guest, onRemove, isDragging = false, showRemove = false }: GuestCardProps) {
  return (
    <div
      className={`group relative transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : 'hover:scale-105'
      }`}
    >
      <Badge 
        variant="secondary" 
        className="cursor-pointer select-none px-3 py-2 text-sm font-medium bg-card border-2 border-primary/20 hover:border-primary/40 transition-colors"
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', JSON.stringify(guest));
        }}
      >
        {guest.name}
      </Badge>
      {showRemove && onRemove && (
        <Button
          size="sm"
          variant="destructive"
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onRemove}
        >
          <X size={12} />
        </Button>
      )}
    </div>
  );
}