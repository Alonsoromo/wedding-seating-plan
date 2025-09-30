import { Button } from "./ui/button";
import { FileText, Download } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";

interface Guest {
  id: string;
  name: string;
}

interface Table {
  id: number;
  guests: (Guest | null)[];
}

interface ExportPDFProps {
  tables: Table[];
  guests: Guest[];
}

export function ExportPDF({ tables, guests }: ExportPDFProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    if (!tables.length) {
      toast.error("No hay mesas para exportar");
      return;
    }

    setIsExporting(true);
    
    try {
      // Dynamic imports for better bundle splitting
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);

      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Title
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(20);
      pdf.text("Planificación de Mesas - Evento", pageWidth / 2, 20, { align: "center" });
      
      // Date
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      const date = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      pdf.text(`Generado el ${date}`, pageWidth / 2, 30, { align: "center" });
      
      // Statistics
      const assignedGuests = tables.flatMap(table => 
        table.guests.filter(g => g !== null)
      ).length;
      const completeTables = tables.filter(table => 
        table.guests.filter(g => g !== null).length === 10
      ).length;
      
      pdf.setFontSize(12);
      let yPos = 45;
      pdf.text(`Total de invitados: ${guests.length}`, 20, yPos);
      yPos += 7;
      pdf.text(`Invitados asignados: ${assignedGuests}`, 20, yPos);
      yPos += 7;
      pdf.text(`Mesas completas: ${completeTables} de ${tables.length}`, 20, yPos);
      yPos += 15;
      
      // Tables information
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text("Distribución por Mesa:", 20, yPos);
      yPos += 10;
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      
      for (const table of tables) {
        // Check if we need a new page
        if (yPos > pageHeight - 40) {
          pdf.addPage();
          yPos = 20;
        }
        
        const occupiedSeats = table.guests.filter(g => g !== null);
        
        pdf.setFont("helvetica", "bold");
        pdf.text(`Mesa ${table.id} (${occupiedSeats.length}/10 personas):`, 20, yPos);
        yPos += 5;
        
        pdf.setFont("helvetica", "normal");
        
        if (occupiedSeats.length === 0) {
          pdf.text("  • Mesa vacía", 25, yPos);
          yPos += 5;
        } else {
          for (const guest of occupiedSeats) {
            if (guest) {
              pdf.text(`  • ${guest.name}`, 25, yPos);
              yPos += 5;
            }
          }
        }
        
        yPos += 5; // Extra space between tables
      }
      
      // Unassigned guests
      const assignedGuestIds = new Set(
        tables.flatMap(table => 
          table.guests.filter(g => g !== null).map(g => g!.id)
        )
      );
      const unassignedGuests = guests.filter(guest => !assignedGuestIds.has(guest.id));
      
      if (unassignedGuests.length > 0) {
        // Check if we need a new page
        if (yPos > pageHeight - 40) {
          pdf.addPage();
          yPos = 20;
        }
        
        pdf.setFont("helvetica", "bold");
        pdf.text(`Invitados sin asignar (${unassignedGuests.length}):`, 20, yPos);
        yPos += 7;
        
        pdf.setFont("helvetica", "normal");
        for (const guest of unassignedGuests) {
          if (yPos > pageHeight - 20) {
            pdf.addPage();
            yPos = 20;
          }
          pdf.text(`  • ${guest.name}`, 25, yPos);
          yPos += 5;
        }
      }
      
      // Save the PDF
      const fileName = `planificacion-mesas-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast.success("PDF exportado exitosamente");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Error al exportar PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={exportToPDF}
      disabled={isExporting || !tables.length}
      variant="default"
      className="flex items-center gap-2"
    >
      {isExporting ? (
        <>
          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          <Download size={16} />
          Exportar PDF
        </>
      )}
    </Button>
  );
}