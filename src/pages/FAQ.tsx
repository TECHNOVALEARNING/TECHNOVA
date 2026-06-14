import Navbar from "@/components/Navbar";
import { Footer } from "@/components/site/shared";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SEOHead from "@/components/SEOHead";

const faqs = [
  { 
    category: "Général", 
    items: [
      { q: "Qu'est-ce que TechNova Learning ?", a: "TechNova Learning est une plateforme de formation en ligne freemium proposant des cours en développement web, marketing digital, business et design graphique. Elle est accessible depuis n'importe quel appareil connecté et s'adresse à un public mondial, avec un focus particulier sur l'Afrique francophone." },
      { q: "TechNova Learning est-il gratuit ?", a: "Oui, TechNova Learning propose un accès freemium. De nombreux cours sont entièrement gratuits. Des formations avancées et certifiantes sont disponibles en version premium à des tarifs accessibles." },
      { q: "Dans quelle langue sont les formations ?", a: "Toutes les formations sont disponibles en français. Certains modules avancés peuvent inclure des ressources complémentaires en anglais." },
      { q: "Faut-il un niveau de départ pour s'inscrire ?", a: "Non. TechNova Learning accueille les débutants complets comme les apprenants ayant déjà des bases. Chaque parcours commence par les fondamentaux et progresse graduellement." },
      { q: "Peut-on apprendre depuis un smartphone ?", a: "Oui, la plateforme est entièrement responsive et optimisée pour mobile. Vous pouvez suivre vos cours depuis un téléphone Android ou iOS sans aucun problème." }
    ]
  },
  {
    category: "Formations",
    items: [
      { q: "Quelles formations propose TechNova Learning ?", a: "TechNova Learning propose des formations en développement web (HTML, CSS, JavaScript, React), marketing digital (SEO, réseaux sociaux, publicité), business et entrepreneuriat, et design graphique (Figma, Adobe, UI/UX)." },
      { q: "Les formations incluent-elles des exercices pratiques ?", a: "Oui. Chaque module comprend des exercices, des quiz et des projets pratiques. L'objectif est que chaque apprenant reparte avec des compétences applicables immédiatement." },
      { q: "Quelle est la durée des formations ?", a: "La durée varie selon les parcours : de quelques heures pour les modules courts, à plusieurs mois pour les parcours complets. Chaque apprenant avance à son propre rythme." },
      { q: "Les cours sont-ils mis à jour régulièrement ?", a: "Oui. Le contenu est mis à jour régulièrement pour rester aligné avec les évolutions du marché et des technologies enseignées." },
      { q: "TechNova Learning propose-t-il des formations pour les entreprises ?", a: "Oui. Des offres B2B sont disponibles pour les entreprises souhaitant former leurs équipes. Contactez-nous pour un devis personnalisé." }
    ]
  },
  {
    category: "Certificats et reconnaissance",
    items: [
      { q: "Obtient-on un certificat à la fin d'une formation ?", a: "Oui. À la fin de chaque parcours premium, un certificat de complétion est délivré. Ce certificat peut être partagé sur LinkedIn et présenté aux employeurs." },
      { q: "Les certificats TechNova Learning sont-ils reconnus ?", a: "Nos certificats sont reconnus par une communauté croissante d'employeurs et de recruteurs, en particulier dans le secteur numérique en Afrique et en Europe francophone." }
    ]
  },
  {
    category: "Technique et accès",
    items: [
      { q: "Comment s'inscrire sur TechNova Learning ?", a: "L'inscription se fait directement sur notre site web en quelques minutes. Il suffit de créer un compte avec votre adresse email, puis de choisir votre premier cours." },
      { q: "Peut-on accéder aux cours sans connexion internet ?", a: "Certains contenus peuvent être téléchargés pour un accès hors ligne. Cette fonctionnalité est disponible pour les abonnés premium." },
      { q: "Que faire si j'ai un problème technique ?", a: "Notre équipe support est disponible par email et via notre chat en ligne. Nous nous engageons à répondre dans les 24 heures ouvrables." }
    ]
  },
  {
    category: "Paiement et abonnement",
    items: [
      { q: "Quels modes de paiement sont acceptés ?", a: "TechNova Learning accepte les cartes bancaires, les paiements par mobile money (Orange Money, Wave, MTN MoMo) ainsi que PayPal pour les paiements internationaux." },
      { q: "Peut-on annuler son abonnement premium ?", a: "Oui, l'abonnement peut être annulé à tout moment depuis les paramètres du compte. Aucune pénalité n'est appliquée." },
      { q: "Y a-t-il une période d'essai pour le premium ?", a: "Oui. Nous proposons une période d'essai gratuite pour découvrir les fonctionnalités premium avant tout engagement." }
    ]
  },
  {
    category: "Communauté et accompagnement",
    items: [
      { q: "Existe-t-il une communauté d'apprenants ?", a: "Oui. TechNova Learning dispose d'une communauté active sur ses plateformes : forum interne, groupes d'échange, sessions de mentorat en live et événements en ligne réguliers." },
      { q: "Peut-on être mis en relation avec des mentors ?", a: "Oui. Les apprenants premium ont accès à des sessions de mentorat individuel ou en groupe avec des formateurs et des professionnels expérimentés dans leur domaine." }
    ]
  }
];

// Generate JSON-LD Schema
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.flatMap(cat => cat.items).map(item => ({
    "@type": "Question",
    "name": item.q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.a
    }
  }))
};

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background font-sans transition-colors duration-300">
      <SEOHead 
        title="Foire Aux Questions - TechNova Learning" 
        description="Trouvez toutes les réponses à vos questions sur TechNova Learning : formations en ligne, certificats, paiements (Mobile Money, Cartes) et notre communauté." 
        canonicalPath="/faq" 
        keywords="FAQ TechNova Learning, questions fréquentes, formation en ligne, certificats, mobile money, apprentissage" 
      />
      
      {/* Inject JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Navbar />
      
      <section className="py-24 md:py-32 bg-mesh relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">
              Foire Aux <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Questions</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tout ce que vous devez savoir sur TechNova Learning, nos formations, les paiements et le fonctionnement de la plateforme.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="space-y-12">
            {faqs.map((categoryGroup, catIndex) => (
              <div key={catIndex} className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">{categoryGroup.category}</h2>
                <Accordion type="single" collapsible className="space-y-4">
                  {categoryGroup.items.map((faq, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                      <AccordionItem value={`item-${catIndex}-${i}`} className="rounded-xl border border-border bg-card px-6">
                        <AccordionTrigger className="text-base font-semibold text-card-foreground hover:no-underline text-left">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    </motion.div>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default FAQ;
