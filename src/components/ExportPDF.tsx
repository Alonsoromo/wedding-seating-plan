import { Button } from "./ui/button";
import { Download } from "@phosphor-icons/react";
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
    setIsExporting(true);
    toast.info("Preparando descarga del PDF...");
    
    try {
      // Dynamic import to ensure jsPDF loads properly
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;
      
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Header with decorative elements
      pdf.setFillColor(200, 180, 120); // Gold color
      pdf.rect(0, 0, pageWidth, 35, 'F');
      
      // Title with better styling
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255);
      pdf.text("🎊 Planificación de Mesas 🎊", pageWidth / 2, 22, { align: "center" });
      
      // Date with styling
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(240, 240, 240);
      const date = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      pdf.text(`Generado el ${date}`, pageWidth / 2, 30, { align: "center" });

      let yPos = 55;
      pdf.setTextColor(0, 0, 0); // Reset to black

      if (!tables.length) {
        // Just show guest list if no tables
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.setTextColor(80, 80, 80);
        pdf.text(`📋 Lista de Invitados (${guests.length} total)`, 20, yPos);
        yPos += 15;
        
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        pdf.setTextColor(0, 0, 0);
        
        if (guests.length === 0) {
          pdf.text("No hay invitados agregados", 25, yPos);
        } else {
          let index = 1;
          for (const guest of guests) {
            if (yPos > pageHeight - 25) {
              pdf.addPage();
              yPos = 30;
            }
            pdf.text(`${index.toString().padStart(2, '0')}. ${guest.name}`, 25, yPos);
            yPos += 7;
            index++;
          }
        }
      } else {
        // Full table distribution with enhanced styling
        // Statistics box
        const assignedGuests = tables.flatMap(table => 
          table.guests.filter(g => g !== null)
        ).length;
        const completeTables = tables.filter(table => 
          table.guests.filter(g => g !== null).length === 10
        ).length;
        
        // Statistics section with background
        pdf.setFillColor(248, 249, 250);
        pdf.rect(15, yPos - 5, pageWidth - 30, 35, 'F');
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(15, yPos - 5, pageWidth - 30, 35, 'S');
        
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(60, 60, 60);
        pdf.text("📊 Resumen del Evento", 20, yPos + 5);
        
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        pdf.setTextColor(80, 80, 80);
        pdf.text(`• Total de invitados: ${guests.length}`, 20, yPos + 15);
        pdf.text(`• Invitados asignados: ${assignedGuests}`, 20, yPos + 22);
        pdf.text(`• Mesas completas: ${completeTables} de ${tables.length}`, 105, yPos + 15);
        pdf.text(`• Invitados sin asignar: ${guests.length - assignedGuests}`, 105, yPos + 22);
        
        yPos += 45;
        
        // Tables information with better design
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.setTextColor(80, 80, 80);
        pdf.text("🪑 Distribución por Mesa", 20, yPos);
        yPos += 15;
        
        for (const table of tables) {
          // Check if we need a new page
          if (yPos > pageHeight - 60) {
            pdf.addPage();
            yPos = 30;
          }
          
          const occupiedSeats = table.guests.filter(g => g !== null);
          const isComplete = occupiedSeats.length === 10;
          
          // Table header with colored background
          const tableColor = isComplete ? [144, 238, 144] : [255, 240, 240]; // Light green if complete, light red if not
          pdf.setFillColor(tableColor[0], tableColor[1], tableColor[2]);
          pdf.rect(15, yPos - 3, pageWidth - 30, 12, 'F');
          
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(12);
          pdf.setTextColor(0, 0, 0);
          const tableStatus = isComplete ? "✅" : occupiedSeats.length === 0 ? "⭕" : "🔄";
          pdf.text(`${tableStatus} Mesa ${table.id} - ${occupiedSeats.length}/10 personas`, 20, yPos + 5);
          yPos += 17;
          
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          pdf.setTextColor(60, 60, 60);
          
          if (occupiedSeats.length === 0) {
            pdf.text("   Mesa disponible para asignar invitados", 25, yPos);
            yPos += 7;
          } else {
            // Create two columns for guests
            const leftColumn = occupiedSeats.slice(0, Math.ceil(occupiedSeats.length / 2));
            const rightColumn = occupiedSeats.slice(Math.ceil(occupiedSeats.length / 2));
            
            const maxRows = Math.max(leftColumn.length, rightColumn.length);
            
            for (let i = 0; i < maxRows; i++) {
              if (leftColumn[i]) {
                pdf.text(`   • ${leftColumn[i].name}`, 25, yPos);
              }
              if (rightColumn[i]) {
                pdf.text(`   • ${rightColumn[i].name}`, 110, yPos);
              }
              yPos += 6;
            }
          }
          
          yPos += 8; // Extra space between tables
        }
        
        // Unassigned guests section
        const assignedGuestIds = new Set(
          tables.flatMap(table => 
            table.guests.filter(g => g !== null).map(g => g!.id)
          )
        );
        const unassignedGuests = guests.filter(guest => !assignedGuestIds.has(guest.id));
        
        if (unassignedGuests.length > 0) {
          // Check if we need a new page
          if (yPos > pageHeight - 50) {
            pdf.addPage();
            yPos = 30;
          }
          
          // Unassigned guests header with background
          pdf.setFillColor(255, 248, 220); // Light yellow
          pdf.rect(15, yPos - 3, pageWidth - 30, 12, 'F');
          
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(12);
          pdf.setTextColor(0, 0, 0);
          pdf.text(`⏳ Invitados Pendientes de Asignar (${unassignedGuests.length})`, 20, yPos + 5);
          yPos += 17;
          
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          pdf.setTextColor(60, 60, 60);
          
          // Two column layout for unassigned guests
          const leftCol = unassignedGuests.slice(0, Math.ceil(unassignedGuests.length / 2));
          const rightCol = unassignedGuests.slice(Math.ceil(unassignedGuests.length / 2));
          const maxUnassignedRows = Math.max(leftCol.length, rightCol.length);
          
          for (let i = 0; i < maxUnassignedRows; i++) {
            if (yPos > pageHeight - 25) {
              pdf.addPage();
              yPos = 30;
            }
            if (leftCol[i]) {
              pdf.text(`   • ${leftCol[i].name}`, 25, yPos);
            }
            if (rightCol[i]) {
              pdf.text(`   • ${rightCol[i].name}`, 110, yPos);
            }
            yPos += 6;
          }
        }
      }
      
      // Footer
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: "center" });
        pdf.text("Generado con ❤️ por Planificador de Mesas", pageWidth / 2, pageHeight - 5, { align: "center" });
      }
      
      // Save the PDF - this will trigger browser download
      const fileName = `planificacion-mesas-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast.success("¡PDF descargado! Revisa tu carpeta de Descargas");
      
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Error al generar el PDF. Inténtalo de nuevo.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={exportToPDF}
      disabled={isExporting}
      variant="default"
      className="flex items-center gap-2"
      title="Descarga un PDF con la distribución de mesas y lista de invitados"
    >
      {isExporting ? (
        <>
          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          Generando PDF...
        </>
      ) : (
        <>
          <Download size={16} />
          Descargar PDF
        </>
      )}
    </Button>
  );
}