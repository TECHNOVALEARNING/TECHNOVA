import { Header } from "@/components/site/shared";
import { Footer } from "@/components/site/shared";
import { motion } from "framer-motion";
import { Mail, MessageCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";

const translations = {
  fr: {
    seoTitle: "Contact - TechNova",
    seoDesc:
      "Contactez l'équipe TECHNOVA. Support disponible 24/7 pour répondre à toutes vos questions sur la vente de produits digitaux.",
    heading: "Contactez-nous",
    subtitle: "Une question ? Notre équipe est là pour vous aider.",
    formTitle: "Envoyez-nous un message",
    namePlaceholder: "Votre nom",
    emailPlaceholder: "Votre email",
    messagePlaceholder: "Votre message...",
    sendBtn: "Envoyer",
    successMsg: "Message envoyé ! Nous vous répondrons sous 24h.",
    otherTitle: "Autres moyens",
    chatTitle: "Chat en direct",
    chatDesc: "Disponible du lundi au vendredi, 9h-18h",
    addressTitle: "Adresse",
    addressDesc: "Cotonou, Bénin",
  },
  en: {
    seoTitle: "Contact Us - TechNova",
    seoDesc:
      "Contact the TECHNOVA team. Support is available 24/7 to answer all your questions about selling digital products.",
    heading: "Get in Touch",
    subtitle: "Any questions? Our team is here to help you.",
    formTitle: "Send us a message",
    namePlaceholder: "Your name",
    emailPlaceholder: "Your email",
    messagePlaceholder: "Your message...",
    sendBtn: "Send",
    successMsg: "Message sent! We will respond within 24 hours.",
    otherTitle: "Other channels",
    chatTitle: "Live Chat",
    chatDesc: "Available Monday to Friday, 9am-6pm",
    addressTitle: "Address",
    addressDesc: "Cotonou, Benin",
  },
};

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [lang, setLang] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("technova_lang") || "fr" : "fr",
  );

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const t = translations[lang === "en" ? "en" : "fr"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t.successMsg);
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={t.seoTitle} description={t.seoDesc} canonicalPath="/contact" />
      <Header />
      <section className="py-24 md:py-32 bg-mesh">
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">
              <span className="text-gradient">{t.heading.split("-")[0]}</span>
              {t.heading.includes("-") ? `-${t.heading.split("-")[1]}` : ""}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t.subtitle}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid gap-16 md:grid-cols-2 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">{t.formTitle}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder={t.namePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Textarea
                  placeholder={t.messagePlaceholder}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  required
                />
                <Button type="submit" className="w-full">
                  {t.sendBtn}
                </Button>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">{t.otherTitle}</h2>
              {[
                {
                  icon: Mail,
                  title: "Email",
                  desc: "contact@technova.com",
                  href: "mailto:contact@technova.com",
                },
                { icon: MessageCircle, title: t.chatTitle, desc: t.chatDesc },
                { icon: MapPin, title: t.addressTitle, desc: t.addressDesc },
              ].map((c) => (
                <div key={c.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <c.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
                    <p className="text-sm text-muted-foreground">{c.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Contact;
