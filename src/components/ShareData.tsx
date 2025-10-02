import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Share, Download, Copy } from '@phosphor-icons/react';
import { toast } from 'sonner';
import type { Guest, Table } from '@/types';
import { SHARE_CODE } from '@/constants';

interface ShareDataProps {
  guests: Guest[];
  tables: Table[];
  onLoadData: (guests: Guest[], tables: Table[]) => void;
}

export function ShareData({ guests, tables, onLoadData }: ShareDataProps) {
  const [shareCode, setShareCode] = useState('');
  const [loadCode, setLoadCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const generateShareCode = async () => {
    if (guests.length === 0 && tables.length === 0) {
      toast.error('No hay datos para compartir');
      return;
    }

    setIsGenerating(true);
    try {
      const data = {
        guests,
        tables,
        timestamp: Date.now()
      };
      
      // Generate a simple share code using a timestamp and basic encoding
      const dataString = JSON.stringify(data);
      const encoded = btoa(dataString);
      const shortCode = encoded.substring(0, SHARE_CODE.LENGTH).toUpperCase();
      
      // Store in KV with the share code as key
      await window.spark.kv.set(`${SHARE_CODE.PREFIX}${shortCode}`, data);
      
      setShareCode(shortCode);
      toast.success('Código de compartir generado');
    } catch (_error) {
      toast.error('Error generando código');
    } finally {
      setIsGenerating(false);
    }
  };

  const loadSharedData = async () => {
    if (!loadCode.trim()) {
      toast.error('Ingresa un código válido');
      return;
    }

    setIsLoading(true);
    try {
      const data = await window.spark.kv.get<{
        guests: Guest[];
        tables: Table[];
        timestamp: number;
      }>(`${SHARE_CODE.PREFIX}${loadCode.toUpperCase()}`);
      
      if (!data) {
        toast.error('Código no encontrado o expirado');
        return;
      }
      
      onLoadData(data.guests || [], data.tables || []);
      toast.success('Datos cargados exitosamente');
      setLoadCode('');
    } catch (_error) {
      toast.error('Error cargando datos');
    } finally {
      setIsLoading(false);
    }
  };

  const copyShareCode = () => {
    if (shareCode) {
      navigator.clipboard.writeText(shareCode);
      toast.success('Código copiado al portapapeles');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share className="mr-2" size={16} />
          Compartir
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartir Planificación</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Generate Share Code */}
          <div className="space-y-3">
            <h4 className="font-medium">Generar código para compartir</h4>
            <p className="text-sm text-muted-foreground">
              Comparte tu planificación con otros navegadores
            </p>
            <Button 
              onClick={generateShareCode} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? 'Generando...' : 'Generar Código'}
            </Button>
            
            {shareCode && (
              <div className="flex gap-2">
                <Input 
                  value={shareCode} 
                  readOnly 
                  className="font-mono text-center text-lg"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={copyShareCode}
                  title="Copiar código"
                >
                  <Copy size={16} />
                </Button>
              </div>
            )}
          </div>

          <div className="border-t pt-6">
            {/* Load Shared Code */}
            <div className="space-y-3">
              <h4 className="font-medium">Cargar planificación compartida</h4>
              <p className="text-sm text-muted-foreground">
                Ingresa el código para cargar datos de otro navegador
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Ingresa el código"
                  value={loadCode}
                  onChange={(e) => setLoadCode(e.target.value)}
                  className="font-mono text-center"
                />
                <Button 
                  onClick={loadSharedData} 
                  disabled={isLoading || !loadCode.trim()}
                >
                  <Download className="mr-2" size={16} />
                  {isLoading ? 'Cargando...' : 'Cargar'}
                </Button>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
            <strong>Nota:</strong> Los códigos son temporales y pueden expirar. 
            Úsalos lo antes posible después de generarlos.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}