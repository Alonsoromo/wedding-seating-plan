import { Button } from "./ui/button";
import { Download } from "@phosphor-icons/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { TABLE_CONSTANTS } from "@/constants";
import type { Guest, Table } from "@/types";

const FALLBACK_GUEST_NAME = "Invitado sin nombre";
const PDF_MARGIN = 15;
const HEADER_HEIGHT = 35;
const FOOTER_MARGIN = 10;

interface ExportPDFProps {
  tables: Table[];
  guests: Guest[];
}

export function ExportPDF({ tables, guests }: ExportPDFProps) {
  const [isExporting, setIsExporting] = useState(false);

  const cleanTextForPDF = useCallback((text: string): string => {
    const normalized = text.normalize("NFKC");
    const cleaned = normalized
      .replace(/[^\w\sáéíóúüñÁÉÍÓÚÜÑ\-.,()]/g, "")
      .trim();

    return cleaned.length > 0 ? cleaned : FALLBACK_GUEST_NAME;
  }, []);

  const sanitizedGuestNames = useMemo(() => {
    const names = new Map<string, string>();

    guests.forEach(guest => {
      names.set(guest.id, cleanTextForPDF(guest.name));
    });

    tables.forEach(table => {
      table.guests.forEach(guest => {
        if (guest) {
          names.set(guest.id, cleanTextForPDF(guest.name));
        }
      });
    });

    return names;
  }, [cleanTextForPDF, guests, tables]);

  const getSafeGuestName = useCallback(
    (guest: Guest) => sanitizedGuestNames.get(guest.id) ?? cleanTextForPDF(guest.name),
    [cleanTextForPDF, sanitizedGuestNames]
  );

  const exportToPDF = useCallback(async () => {
    setIsExporting(true);
    const toastId = toast.loading("Preparando descarga del PDF...");

    try {
      const { default: JsPDF } = await import("jspdf");
      const pdf = new JsPDF();

      pdf.setFont("helvetica", "normal");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.setFillColor(200, 180, 120);
      pdf.rect(0, 0, pageWidth, HEADER_HEIGHT, "F");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255);
      pdf.text("PLANIFICACION DE MESAS", pageWidth / 2, 22, { align: "center" });

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(240, 240, 240);
      const date = new Date().toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      pdf.text(`Generado el ${date}`, pageWidth / 2, 30, { align: "center" });

      let yPos = HEADER_HEIGHT + 20;
      pdf.setTextColor(0, 0, 0);

      if (!tables.length) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.setTextColor(80, 80, 80);
        pdf.text(`LISTA DE INVITADOS (${guests.length} total)`, PDF_MARGIN + 5, yPos);
        yPos += 15;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        pdf.setTextColor(0, 0, 0);

        if (guests.length === 0) {
          pdf.text("No hay invitados agregados", PDF_MARGIN + 10, yPos);
        } else {
          let index = 1;
          for (const guest of guests) {
            if (yPos > pageHeight - 25) {
              pdf.addPage();
              yPos = 30;
            }
            pdf.text(`${index.toString().padStart(2, "0")}. ${getSafeGuestName(guest)}`, PDF_MARGIN + 10, yPos);
            yPos += 7;
            index++;
          }
        }
      } else {
        const assignedGuests = tables.reduce((total, table) => {
          return (
            total + table.guests.filter((guest): guest is Guest => guest !== null).length
          );
        }, 0);
        const completeTables = tables.filter(table =>
          table.guests.filter(guest => guest !== null).length === TABLE_CONSTANTS.SEATS_PER_TABLE
        ).length;

        pdf.setFillColor(248, 249, 250);
        pdf.rect(PDF_MARGIN, yPos - 5, pageWidth - PDF_MARGIN * 2, 35, "F");
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(PDF_MARGIN, yPos - 5, pageWidth - PDF_MARGIN * 2, 35, "S");

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(60, 60, 60);
        pdf.text("RESUMEN DEL EVENTO", PDF_MARGIN + 5, yPos + 5);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        pdf.setTextColor(80, 80, 80);
        pdf.text(`Total de invitados: ${guests.length}`, PDF_MARGIN + 5, yPos + 15);
        pdf.text(`Invitados asignados: ${assignedGuests}`, PDF_MARGIN + 5, yPos + 22);
        pdf.text(
          `Mesas completas: ${completeTables} de ${tables.length}`,
          pageWidth / 2 + PDF_MARGIN - 5,
          yPos + 15
        );
        pdf.text(
          `Invitados sin asignar: ${guests.length - assignedGuests}`,
          pageWidth / 2 + PDF_MARGIN - 5,
          yPos + 22
        );

        yPos += 45;

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.setTextColor(80, 80, 80);
        pdf.text("DISTRIBUCION POR MESA", PDF_MARGIN + 5, yPos);
        yPos += 15;

        for (const table of tables) {
          if (yPos > pageHeight - 60) {
            pdf.addPage();
            yPos = 30;
          }

          const occupiedSeats = table.guests.filter((guest): guest is Guest => guest !== null);
          const isComplete = occupiedSeats.length === TABLE_CONSTANTS.SEATS_PER_TABLE;

          const tableColor = isComplete ? [144, 238, 144] : [255, 240, 240];
          pdf.setFillColor(tableColor[0], tableColor[1], tableColor[2]);
          pdf.rect(PDF_MARGIN, yPos - 3, pageWidth - PDF_MARGIN * 2, 12, "F");

          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(12);
          pdf.setTextColor(0, 0, 0);
          const tableStatus = isComplete ? "[COMPLETA]" : occupiedSeats.length === 0 ? "[VACIA]" : "[INCOMPLETA]";
          pdf.text(
            `${tableStatus} Mesa ${table.id} - ${occupiedSeats.length}/${TABLE_CONSTANTS.SEATS_PER_TABLE} personas`,
            PDF_MARGIN + 5,
            yPos + 5
          );
          yPos += 17;

          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          pdf.setTextColor(60, 60, 60);

          if (occupiedSeats.length === 0) {
            pdf.text("   Mesa disponible para asignar invitados", PDF_MARGIN + 10, yPos);
            yPos += 7;
          } else {
            const leftColumn = occupiedSeats.slice(0, Math.ceil(occupiedSeats.length / 2));
            const rightColumn = occupiedSeats.slice(Math.ceil(occupiedSeats.length / 2));
            const maxRows = Math.max(leftColumn.length, rightColumn.length);

            for (let i = 0; i < maxRows; i++) {
              if (leftColumn[i]) {
                pdf.text(`- ${getSafeGuestName(leftColumn[i])}`, PDF_MARGIN + 10, yPos);
              }
              if (rightColumn[i]) {
                pdf.text(`- ${getSafeGuestName(rightColumn[i])}`, pageWidth / 2 + PDF_MARGIN, yPos);
              }
              yPos += 6;
            }
          }

          yPos += 8;
        }

        const assignedGuestIds = new Set(
          tables.flatMap(table =>
            table.guests.filter((guest): guest is Guest => guest !== null).map(guest => guest.id)
          )
        );
        const unassignedGuests = guests.filter(guest => !assignedGuestIds.has(guest.id));

        if (unassignedGuests.length > 0) {
          if (yPos > pageHeight - 50) {
            pdf.addPage();
            yPos = 30;
          }

          pdf.setFillColor(255, 248, 220);
          pdf.rect(PDF_MARGIN, yPos - 3, pageWidth - PDF_MARGIN * 2, 12, "F");

          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(12);
          pdf.setTextColor(0, 0, 0);
          pdf.text(`INVITADOS PENDIENTES DE ASIGNAR (${unassignedGuests.length})`, PDF_MARGIN + 5, yPos + 5);
          yPos += 17;

          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          pdf.setTextColor(60, 60, 60);

          const leftCol = unassignedGuests.slice(0, Math.ceil(unassignedGuests.length / 2));
          const rightCol = unassignedGuests.slice(Math.ceil(unassignedGuests.length / 2));
          const maxUnassignedRows = Math.max(leftCol.length, rightCol.length);

          for (let i = 0; i < maxUnassignedRows; i++) {
            if (yPos > pageHeight - 25) {
              pdf.addPage();
              yPos = 30;
            }
            if (leftCol[i]) {
              pdf.text(`- ${getSafeGuestName(leftCol[i])}`, PDF_MARGIN + 10, yPos);
            }
            if (rightCol[i]) {
              pdf.text(`- ${getSafeGuestName(rightCol[i])}`, pageWidth / 2 + PDF_MARGIN, yPos);
            }
            yPos += 6;
          }
        }
      }

      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - FOOTER_MARGIN, { align: "center" });
        pdf.text("Generado con Planificador de Mesas", pageWidth / 2, pageHeight - FOOTER_MARGIN + 5, {
          align: "center"
        });
      }

      const fileName = `planificacion-mesas-${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);

      toast.success("¡PDF descargado! Revisa tu carpeta de Descargas", { id: toastId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      toast.error(`Error al generar el PDF: ${errorMessage}`, { id: toastId });
    } finally {
      setIsExporting(false);
    }
  }, [getSafeGuestName, guests, tables]);

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
