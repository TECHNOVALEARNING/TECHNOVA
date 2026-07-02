import jsPDF from "jspdf";

interface InvoiceData {
  orderId: string;
  date: string;
  customerName: string;
  customerEmail: string;
  productTitle: string;
  amount: number;
  storeName: string;
  storeContact?: string | null;
}

export const generateInvoicePDF = (data: InvoiceData) => {
  // A6 format (105 x 148 mm), portrait
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [105, 148],
  });

  // Page background (Light gray/blue)
  doc.setFillColor(243, 244, 246); // gray-100
  doc.rect(0, 0, 105, 148, "F");

  // Ticket background (White)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(5, 5, 95, 138, 3, 3, "F");

  // Cutouts at Y = 78
  doc.setFillColor(243, 244, 246);
  doc.circle(5, 78, 4, "F"); // left
  doc.circle(100, 78, 4, "F"); // right

  // Success Circle (Green)
  doc.setFillColor(220, 252, 231); // green-100
  doc.circle(52.5, 25, 8, "F");

  // Checkmark inside circle
  doc.setDrawColor(22, 163, 74); // green-600
  doc.setLineWidth(1.2);
  doc.line(50, 25, 52, 27);
  doc.line(52, 27, 56, 22);

  // Title & Subtitle
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(17, 24, 39); // gray-900
  doc.text("Paiement réussi", 52.5, 42, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128); // gray-500
  doc.text("Merci ! Votre commande est confirmée.", 52.5, 47, { align: "center" });

  // Fields Part 1
  const leftX = 15;
  const rightX = 90;

  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text("N° Commande :", leftX, 60);
  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.text(data.orderId.slice(0, 12).toUpperCase(), rightX, 60, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text("Date et heure :", leftX, 66);
  doc.setTextColor(17, 24, 39);
  const dateStr = new Date(data.date).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(dateStr, rightX, 66, { align: "right" });

  doc.setTextColor(107, 114, 128);
  doc.text("Client :", leftX, 72);
  doc.setTextColor(17, 24, 39);
  doc.text(data.customerName.slice(0, 25), rightX, 72, { align: "right" });

  // Dashed separator line
  doc.setDrawColor(229, 231, 235); // gray-200
  doc.setLineWidth(0.5);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(15, 78, 90, 78);
  doc.setLineDashPattern([], 0); // reset

  // Fields Part 2
  doc.setTextColor(107, 114, 128);
  doc.text("Produit :", leftX, 88);
  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.text(data.productTitle.slice(0, 25), rightX, 88, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text("Vendeur :", leftX, 94);
  doc.setTextColor(17, 24, 39);
  doc.text(data.storeName.slice(0, 25), rightX, 94, { align: "right" });

  doc.setTextColor(107, 114, 128);
  doc.text("Montant payé :", leftX, 102);
  doc.setTextColor(30, 58, 138); // deep blue
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`${data.amount.toLocaleString("fr-FR")} FCFA`, rightX, 102, { align: "right" });

  // Payment Block
  doc.setFillColor(243, 244, 246); // gray-100
  doc.roundedRect(15, 112, 75, 20, 2, 2, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text("Moyen de paiement :", 20, 118);

  doc.setFillColor(30, 58, 138); // badge color
  doc.roundedRect(20, 121, 14, 6, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(255, 255, 255);
  doc.text("TECH", 27, 125, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(17, 24, 39);
  doc.text("Paiement sécurisé via TECHNOVA", 37, 125);

  doc.save(`facture-${data.orderId.slice(0, 8)}.pdf`);
};
