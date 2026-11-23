import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { formatoFecha } from "../../shared/formatoFecha";
import type { FilaReporte } from "./api";

export function diaReporte(fecha: string) {
  return new Date(`${fecha}T12:00:00`).toLocaleDateString("es-PE", { weekday: "long" }).toLocaleUpperCase("es-PE");
}

export function generarReportePdf(filas: FilaReporte[], desde: string, hasta: string, personal: string) {
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.text("Reporte de asistencia", 14, 15);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  const subtitulo: string[] = pdf.splitTextToSize(`${personal} · ${formatoFecha(desde)} al ${formatoFecha(hasta)}`, 265);
  pdf.text(subtitulo, 14, 22);
  autoTable(pdf, {
    startY: 25 + subtitulo.length * 4,
    head: [["Fecha", "Día", "Nombres", "Ingreso", "Salida refrigerio", "Retorno refrigerio", "Salida", "N.º tardanzas", "Asistencia", "Marcaciones"]],
    body: filas.map((fila) => [formatoFecha(fila.fecha), diaReporte(fila.fecha), fila.empleado, fila.entrada || "-", fila.salidaRefrigerio || "-", fila.retornoRefrigerio || "-", fila.salida || "-", String(fila.tardanzas ?? "-"), fila.estado || "-", fila.estadoMarcacion || "-"]),
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2.5, overflow: "linebreak" },
    headStyles: { fillColor: [178, 54, 54] },
    margin: { left: 14, right: 14, bottom: 15 },
    showHead: "everyPage",
    didDrawPage: () => {
      pdf.setFontSize(8);
      pdf.setTextColor(100);
      pdf.text(`Página ${pdf.getNumberOfPages()}`, pdf.internal.pageSize.getWidth() - 14, pdf.internal.pageSize.getHeight() - 7, { align: "right" });
    },
  });
  return pdf;
}
