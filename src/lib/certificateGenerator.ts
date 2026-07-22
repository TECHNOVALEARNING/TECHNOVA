import { jsPDF } from "jspdf";

export interface CertificateData {
  studentName: string;
  courseTitle: string;
  completionDate?: string;
  storeName?: string;
  certificateId?: string;
}

const getQRCodeDataUrl = async (text: string): Promise<string> => {
  try {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error("Error generating QR code:", e);
    return "";
  }
};

/**
 * Génère et déclenche le téléchargement automatique du certificat de réussite au format PDF
 */
export const generateCertificatePDF = async (data: CertificateData) => {
  // Format A4 Paysage (Landscape)
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Fond de page ivoire doux
  doc.setFillColor(250, 249, 246);
  doc.rect(0, 0, width, height, "F");

  // Cadre extérieur Doré (#D4AF37)
  doc.setLineWidth(2.5);
  doc.setDrawColor(212, 175, 55);
  doc.rect(10, 10, width - 20, height - 20, "S");

  // Cadre intérieur Bleu Marine Royal (#1A1F36)
  doc.setLineWidth(0.8);
  doc.setDrawColor(26, 31, 54);
  doc.rect(14, 14, width - 28, height - 28, "S");

  // Entête - Logo & Titre Organisme
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(26, 31, 54);
  doc.text("TECHNOVA LEARNING ACADEMY", width / 2, 35, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("PLATEFORME D'ENSEIGNEMENT ET DE CERTIFICATION NUMÉRIQUE", width / 2, 42, {
    align: "center",
  });

  // Ligne de séparation dorée
  doc.setLineWidth(0.5);
  doc.setDrawColor(212, 175, 55);
  doc.line(70, 48, width - 70, 48);

  // Titre du Certificat
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(212, 175, 55);
  doc.text("CERTIFICAT NUMÉRIQUE DE FIN DE FORMATION", width / 2, 65, { align: "center" });

  // Sous-titre
  doc.setFont("helvetica", "italic");
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  doc.text("Ce document numérique atteste que", width / 2, 78, { align: "center" });

  // Nom de l'étudiant
  const nameText = (data.studentName || "Étudiant TECHNOVA").toUpperCase();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(26, 31, 54);
  doc.text(nameText, width / 2, 93, { align: "center" });

  // Soulignement du nom
  const nameWidth = doc.getTextWidth(nameText);
  doc.setLineWidth(0.5);
  doc.setDrawColor(212, 175, 55);
  doc.line((width - nameWidth) / 2 - 5, 96, (width + nameWidth) / 2 + 5, 96);

  // Texte explicatif
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(
    "a complété avec succès l'intégralité du programme d'évaluation et de compétences de la formation",
    width / 2,
    110,
    { align: "center" }
  );

  // Titre de la Formation
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(26, 31, 54);
  doc.text(`« ${data.courseTitle} »`, width / 2, 123, { align: "center" });

  if (data.storeName) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Dispensée par : ${data.storeName}`, width / 2, 133, { align: "center" });
  }

  // Pied de certificat : Métadonnées & Tampon
  const certId =
    data.certificateId || `TECH-CERT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const dateStr =
    data.completionDate ||
    new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });

  // Sceau doré circulaire
  doc.setFillColor(212, 175, 55);
  doc.circle(45, 168, 14, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("VERIFIED", 45, 166, { align: "center" });
  doc.text("CERTIFICATE", 45, 171, { align: "center" });

  // Informations de vérification
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Délivré le : ${dateStr}`, 70, 169);

  // QR Code à la place de la Signature
  const qrCodeUrl = await getQRCodeDataUrl(`https://www.technovalearning.com/formations`);
  if (qrCodeUrl) {
    doc.addImage(qrCodeUrl, "PNG", width - 60, 147, 28, 28);
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(26, 31, 54);
  doc.text("VERIFICATION ACADEMIQUE", width - 46, 180, { align: "center" });
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text("Scannez pour valider l'attestation", width - 46, 185, { align: "center" });

  // Téléchargement automatique
  const filename = `Attestation_TECHNOVA_${data.courseTitle.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
  doc.save(filename);
};
