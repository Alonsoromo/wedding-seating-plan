import { useKV } from '@github/spark/hooks';
import { useState } from 'react';
import { Button } from './components/ui/button';
import { ArrowClockwise } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import type { Guest, Table } from './types';

function App() {
  const [guests, setGuests] = useKV<Guest[]>("wedding-guests", []);
  const [tables, setTables] = useKV<Table[]>("wedding-tables", []);

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

        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => toast.success("¡Funcionando!")}
            className="text-primary hover:text-primary"
          >
            <ArrowClockwise className="mr-2" size={16} />
            Probar App
          </Button>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default App;