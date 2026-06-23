import { useState, useEffect } from "react";
import { Header } from "@/components/site/shared";
import { Footer } from "@/components/site/shared";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";

const Privacy = () => {
  const [lang, setLang] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem("technova_lang") || "fr") : "fr");

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const sections = [
    {
      title: lang === "fr" ? "1. Responsable du traitement" : "1. Data Controller",
      content: lang === "fr"
        ? "Le responsable du traitement des données personnelles est Dolapo ECOM LLC, société enregistrée au Nouveau-Mexique, États-Unis, dont le siège social est situé au 1209 Mountain Rd PL NE, Ste R, Albuquerque, NM 87110, USA. Contact : contact@technova.com."
        : "The data controller for personal data is Dolapo ECOM LLC, a company registered in New Mexico, USA, with its registered office at 1209 Mountain Rd PL NE, Ste R, Albuquerque, NM 87110, USA. Contact: contact@technova.com."
    },
    {
      title: lang === "fr" ? "2. Données collectées" : "2. Collected Data",
      content: lang === "fr"
        ? "Nous collectons les données suivantes : informations d'identification (nom, prénom, adresse email, numéro de téléphone), données de paiement (traitées par nos partenaires de paiement sécurisés), données de navigation (adresse IP, type de navigateur, pages visitées), et données relatives aux transactions (historique d'achats, produits consultés)."
        : "We collect the following data: identification details (first name, last name, email address, phone number), payment details (processed by our secure payment partners), browsing data (IP address, browser type, visited pages), and transaction history (purchased products, viewed items)."
    },
    {
      title: lang === "fr" ? "3. Finalités du traitement" : "3. Purposes of Processing",
      content: lang === "fr"
        ? "Vos données sont utilisées pour : la création et la gestion de votre compte, le traitement de vos commandes et paiements, l'amélioration de nos services et de l'expérience utilisateur, l'envoi de communications marketing (avec votre consentement), la prévention de la fraude et la sécurité de la plateforme, et le respect de nos obligations légales."
        : "Your data is used for: account creation and management, processing orders and payments, improving our services and user experience, sending marketing communications (with your consent), fraud prevention, platform security, and compliance with our legal obligations."
    },
    {
      title: lang === "fr" ? "4. Base légale du traitement" : "4. Legal Basis of Processing",
      content: lang === "fr"
        ? "Le traitement de vos données repose sur : l'exécution du contrat (pour la gestion de votre compte et vos commandes), votre consentement (pour les communications marketing), nos intérêts légitimes (pour l'amélioration de nos services et la sécurité), et nos obligations légales (conservation des données de facturation)."
        : "The processing of your data is based on: contract performance (for account management and order processing), your consent (for marketing communications), our legitimate interests (for platform security and service improvements), and our legal obligations (retention of billing data)."
    },
    {
      title: lang === "fr" ? "5. Partage des données" : "5. Data Sharing",
      content: lang === "fr"
        ? "Vos données peuvent être partagées avec : nos prestataires de paiement (pour le traitement des transactions), nos partenaires techniques (hébergement, analyse), et les autorités compétentes (en cas d'obligation légale). Nous ne vendons jamais vos données personnelles à des tiers."
        : "Your data may be shared with: our payment providers (to process transactions), our technical partners (hosting, analytics), and competent authorities (when legally required). We never sell your personal data to third parties."
    },
    {
      title: lang === "fr" ? "6. Durée de conservation" : "6. Retention Period",
      content: lang === "fr"
        ? "Vos données personnelles sont conservées pendant la durée de votre compte actif, puis archivées pendant une durée maximale de 5 ans après la dernière activité, conformément aux obligations légales de conservation des données comptables et fiscales."
        : "Your personal data is retained for the duration of your active account, then archived for a maximum of 5 years following your last activity, in compliance with statutory records retention requirements for accounting and tax purposes."
    },
    {
      title: lang === "fr" ? "7. Vos droits" : "7. Your Rights",
      content: lang === "fr"
        ? "Conformément à la réglementation applicable, vous disposez des droits suivants : droit d'accès, de rectification, de suppression, de portabilité de vos données, droit d'opposition et de limitation du traitement. Pour exercer ces droits, contactez-nous à contact@technova.com."
        : "In accordance with applicable regulations, you have the following rights: access, rectification, erasure, portability of your data, objection, and restriction of processing. To exercise these rights, please contact us at contact@technova.com."
    },
    {
      title: lang === "fr" ? "8. Cookies" : "8. Cookies",
      content: lang === "fr"
        ? "Notre plateforme utilise des cookies essentiels au fonctionnement du site, des cookies de performance pour analyser l'utilisation du site, et des cookies de marketing (avec votre consentement) pour personnaliser votre expérience. Vous pouvez gérer vos préférences de cookies à tout moment via les paramètres de votre navigateur."
        : "Our platform uses essential cookies for site functionality, performance cookies to analyze usage, and marketing cookies (with your consent) to personalize your experience. You can manage your cookie preferences at any time through your browser settings."
    },
    {
      title: lang === "fr" ? "9. Sécurité de la plateforme" : "9. Platform Security",
      content: lang === "fr"
        ? "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles : chiffrement TLS de bout en bout, isolation des données par Row-Level Security (RLS) au niveau base de données, hébergement chiffré et infrastructure surveillée 24/7. Les transactions de paiement sont chiffrées et traitées par nos partenaires de paiement agréés (tels que Stripe, Moneroo, Fedapay, etc.) conformes aux normes de sécurité (PCI-DSS) — TECHNOVA ne stocke aucune donnée bancaire."
        : "We implement appropriate technical and organizational measures to protect your personal data: end-to-end TLS encryption, database-level Row-Level Security (RLS) isolation, encrypted hosting, and 24/7 monitored infrastructure. Payment transactions are encrypted and processed by our certified payment partners (such as Stripe, Moneroo, Fedapay, etc.) compliant with safety standards (PCI-DSS) — TECHNOVA does not store any banking credentials on its servers."
    },
    {
      title: lang === "fr" ? "10. Vérification d'identité (KYC)" : "10. Identity Verification (KYC)",
      content: lang === "fr"
        ? "Tout vendeur souhaitant retirer des fonds doit valider son identité via notre partenaire Didit.me (vérification biométrique de pièce d'identité officielle). Les données KYC (numéro de document, nom, pays, type de pièce) sont conservées de manière sécurisée à des fins légales (LCB-FT, KYC, anti-fraude). Un même document d'identité ne peut servir à valider qu'un seul compte TECHNOVA. Vous pouvez demander la suppression de vos données KYC à l'expiration de vos obligations légales."
        : "Any seller wishing to withdraw funds must verify their identity via our partner Didit.me (biometric government-issued ID verification). KYC data (document number, name, country, document type) is securely stored for legal purposes (AML-CFT, KYC, anti-fraud). A single identity document can only be used to validate one TECHNOVA account. You can request deletion of your KYC data once your legal obligations expire."
    },
    {
      title: lang === "fr" ? "11. Anti-fraude et modération" : "11. Anti-fraud and Moderation",
      content: lang === "fr"
        ? "Pour protéger acheteurs et vendeurs, nous utilisons une combinaison d'intelligence artificielle et de contrôles humains pour analyser les boutiques, produits et demandes de retrait. Tous les fonds sont placés en quarantaine pendant 72 heures après chaque vente afin de bloquer les tentatives de fraude au remboursement."
        : "To protect buyers and sellers, we use a combination of artificial intelligence and human reviews to analyze storefronts, products, and withdrawal requests. All funds are held in escrow for 72 hours following each sale to mitigate potential refund fraud."
    },
    {
      title: lang === "fr" ? "12. Contact" : "12. Contact Us",
      content: lang === "fr"
        ? "Pour toute question relative à cette politique de confidentialité ou au traitement de vos données personnelles, contactez-nous à contact@technova.com ou par courrier à Dolapo ECOM LLC, 1209 Mountain Rd PL NE, Ste R, Albuquerque, NM 87110, USA."
        : "For any questions regarding this privacy policy or the processing of your personal data, contact us at contact@technova.com or by mail at Dolapo ECOM LLC, 1209 Mountain Rd PL NE, Ste R, Albuquerque, NM 87110, USA."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={lang === "fr" ? "Politique de confidentialité · TECHNOVA" : "Privacy Policy · TECHNOVA"} 
        description={lang === "fr" ? "Politique de confidentialité d'TECHNOVA. Découvrez comment nous collectons, utilisons et protégeons vos données personnelles." : "Privacy Policy of TECHNOVA. Discover how we collect, use and protect your personal data."} 
        canonicalPath="/privacy" 
        noindex 
      />
      <Header />
      <section className="py-24 md:py-32 bg-mesh relative">
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {lang === "fr" ? (
                <>Politique de <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">confidentialité</span></>
              ) : (
                <>Privacy <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">Policy</span></>
              )}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {lang === "fr" ? "Dernière mise à jour : 23 Juin 2026" : "Last updated: June 23, 2026"}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-10">
            {sections.map((section) => (
              <div key={section.title} className="p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                <h2 className="text-lg font-bold text-foreground mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>{section.title}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{section.content}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Privacy;
