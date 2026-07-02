import { useState, useEffect } from "react";
import { Header } from "@/components/site/shared";
import { Footer } from "@/components/site/shared";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";

const Terms = () => {
  const [lang, setLang] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("technova_lang") || "fr" : "fr",
  );

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const sections = [
    {
      title: lang === "fr" ? "1. Acceptation des conditions" : "1. Acceptance of Terms",
      content:
        lang === "fr"
          ? "En utilisant TECHNOVA, vous acceptez les présentes conditions d'utilisation. Si vous n'êtes pas d'accord, veuillez ne pas utiliser notre plateforme."
          : "By accessing or using TECHNOVA, you agree to be bound by these terms of service. If you do not agree to these terms, please do not use our platform.",
    },
    {
      title: lang === "fr" ? "2. Description du service" : "2. Description of Service",
      content:
        lang === "fr"
          ? "TECHNOVA est une plateforme de distribution permettant aux créateurs de vendre des produits digitaux (fichiers, formations et licences de logiciels) à travers le monde."
          : "TECHNOVA is a distribution platform that enables creators to sell digital products (files, courses, and software licenses) to customers worldwide.",
    },
    {
      title:
        lang === "fr"
          ? "3. Inscription et vérification d'identité (KYC)"
          : "3. Registration and Identity Verification (KYC)",
      content:
        lang === "fr"
          ? "Pour utiliser les services de vente, vous devez créer un compte avec des informations exactes. Avant tout retrait de fonds, vous devez compléter une vérification d'identité (KYC) via notre partenaire Didit.me (passeport, CNI ou permis biométrique). Une même personne ne peut valider qu'un seul compte TECHNOVA : tout document d'identité déjà utilisé pour approuver un compte sera automatiquement rejeté pour tout autre compte."
          : "To sell on the platform, you must register for an account using accurate information. Before any withdrawal of funds, you must complete an identity verification (KYC) process via our partner Didit.me (passport, national ID, or biometric driving license). A single person can only validate one TECHNOVA account: any identity document already used to approve an account will be automatically rejected for any other account.",
    },
    {
      title:
        lang === "fr"
          ? "4. Produits autorisés et modération"
          : "4. Authorized Products and Moderation",
      content:
        lang === "fr"
          ? "Seuls les produits digitaux légaux sont autorisés (fichiers, formations, licences). Les contenus illicites, contrefaits, frauduleux ou violant les droits d'auteur sont strictement interdits. Toutes les boutiques et produits sont analysés par une combinaison d'intelligence artificielle et de modérateurs humains avant et après publication."
          : "Only legal digital products are allowed (files, training modules, licenses). Illicit, counterfeit, fraudulent, or copyright-infringing content is strictly prohibited. All storefronts and products are analyzed by a combination of artificial intelligence and human moderators before and after publication.",
    },
    {
      title:
        lang === "fr"
          ? "5. Paiements, commission et délai de maturation"
          : "5. Payments, Commission, and Escrow Period",
      content:
        lang === "fr"
          ? "Les paiements sont traités de manière sécurisée par nos partenaires de paiement agréés (tels que Stripe, Moneroo, Fedapay, etc.). TECHNOVA applique une commission de 5% par transaction. Les fonds issus des ventes sont placés en quarantaine pendant 72 heures (délai de maturation) pour prévenir la fraude au remboursement, puis disponibles pour retrait après validation KYC."
          : "Payments are processed securely by our certified payment partners (such as Stripe, Moneroo, Fedapay, etc.). TECHNOVA applies a 5% commission per transaction. Funds from sales are held in escrow for 72 hours (maturation period) to prevent refund fraud, and then become available for withdrawal following successful KYC validation.",
    },
    {
      title: lang === "fr" ? "6. Propriété intellectuelle" : "6. Intellectual Property",
      content:
        lang === "fr"
          ? "Vous conservez la propriété de vos contenus. En publiant sur TECHNOVA, vous nous accordez une licence limitée pour afficher et distribuer vos produits sur la plateforme."
          : "You retain ownership of your content. By publishing on TECHNOVA, you grant us a limited license to display and distribute your products on the platform.",
    },
    {
      title: lang === "fr" ? "7. Sécurité et anti-fraude" : "7. Security and Anti-Fraud",
      content:
        lang === "fr"
          ? "TECHNOVA met en œuvre une protection multi-couches : chiffrement TLS, Row-Level Security au niveau de la base de données, modération IA, vérification KYC obligatoire, détection automatique de doublons d'identité et suivi anti-fraude des transactions. Toute tentative de fraude entraîne la suspension immédiate du compte et la conservation des fonds aux fins d'enquête."
          : "TECHNOVA implements multi-layered protection: TLS encryption, database-level Row-Level Security (RLS), AI moderation, mandatory KYC checks, automatic identity duplicate detection, and transaction anti-fraud tracking. Any attempt at fraud leads to immediate account suspension and withholding of funds for investigation purposes.",
    },
    {
      title: lang === "fr" ? "8. Résiliation" : "8. Termination",
      content:
        lang === "fr"
          ? "Vous pouvez fermer votre compte à tout moment. TECHNOVA se réserve le droit de suspendre les comptes violant ces conditions, présentant un risque de fraude, ou n'ayant pas validé leur KYC dans les délais requis."
          : "You can close your account at any time. TECHNOVA reserves the right to suspend accounts that violate these terms, present a risk of fraud, or fail to validate their KYC within the required timeframes.",
    },
    {
      title: lang === "fr" ? "9. Contact" : "9. Contact Us",
      content:
        lang === "fr"
          ? "Pour toute question relative à ces conditions, contactez-nous à contact@technova.com ou par courrier à Dolapo ECOM LLC, 1209 Mountain Rd PL NE, Ste R, Albuquerque, NM 87110, USA."
          : "For any questions regarding these terms, contact us at contact@technova.com or by mail at Dolapo ECOM LLC, 1209 Mountain Rd PL NE, Ste R, Albuquerque, NM 87110, USA.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={
          lang === "fr" ? "Conditions d'utilisation · TECHNOVA" : "Terms of Service · TECHNOVA"
        }
        description={
          lang === "fr"
            ? "Conditions générales d'utilisation de la plateforme TECHNOVA. Politique de confidentialité et mentions légales."
            : "General terms of service of the TECHNOVA platform. Privacy policy and legal notices."
        }
        canonicalPath="/terms"
        noindex
      />
      <Header />
      <section className="py-24 md:py-32 bg-mesh relative">
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1
              className="text-4xl md:text-6xl font-extrabold text-foreground mb-6"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {lang === "fr" ? (
                <>
                  Conditions{" "}
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                    d'utilisation
                  </span>
                </>
              ) : (
                <>
                  Terms of{" "}
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                    Service
                  </span>
                </>
              )}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {lang === "fr"
                ? "Dernière mise à jour : 23 Juin 2026"
                : "Last updated: June 23, 2026"}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            {sections.map((section) => (
              <div
                key={section.title}
                className="p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
              >
                <h2
                  className="text-lg font-bold text-foreground mb-3"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {section.title}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Terms;
