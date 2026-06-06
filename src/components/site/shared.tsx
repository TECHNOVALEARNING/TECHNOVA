import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight, Check, ChevronDown, Shield, Headphones, Wallet,
  GraduationCap, Sparkles, Star, Mail, MapPin, Phone, Lock, CreditCard,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import siteLogo from "@/assets/logo.png";

/* ---------- Logo ---------- */
export const Logo = ({ className = "" }: { className?: string }) => (
  <Link to="/" className={`flex items-center gap-2.5 ${className}`}>
    <img src={siteLogo} alt="Logo" className="h-10 sm:h-12 w-auto object-contain" />
    <span className="font-display text-xl sm:text-2xl font-black tracking-tight text-[color:var(--primary)]">
      TECHNOVA
    </span>
  </Link>
);

/* ---------- Header ---------- */
export const Header = () => {
  const [open, setOpen] = useState(false);
  const links = [
    { to: "/", label: "Accueil" },
    { to: "/formations", label: "Nos formations" },
    { to: "/#pourquoi", label: "Pourquoi nous" },
    { to: "/#faq", label: "FAQ" },
  ];
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/75 border-b border-[color:var(--border)]/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="hover:text-[color:var(--primary)] transition-colors story-link">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-3">
          <Link to="/login"
             className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-primary-gradient text-white text-sm font-semibold shadow-glow hover:scale-[1.03] transition-transform">
            COMMENCER <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <button onClick={() => setOpen(!open)} className="lg:hidden p-2" aria-label="menu">
          <div className="space-y-1.5">
            <span className={`block h-0.5 w-6 bg-foreground transition-transform ${open && "translate-y-2 rotate-45"}`} />
            <span className={`block h-0.5 w-6 bg-foreground transition-opacity ${open && "opacity-0"}`} />
            <span className={`block h-0.5 w-6 bg-foreground transition-transform ${open && "-translate-y-2 -rotate-45"}`} />
          </div>
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-[color:var(--border)] bg-white">
          <div className="px-4 py-4 flex flex-col gap-3">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                    className="py-2 font-medium">{l.label}</Link>
            ))}
            <Link to="/login" onClick={() => setOpen(false)}
               className="mt-2 text-center h-11 grid place-items-center rounded-full bg-primary-gradient text-white font-semibold">
              COMMENCER
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

/* ---------- Footer ---------- */
export const Footer = () => (
  <footer className="mt-24 sm:mt-32 bg-[color:var(--navy)] text-white">
    <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-12 sm:py-16 grid gap-10 sm:gap-12 sm:grid-cols-2 md:grid-cols-4">
      <div className="sm:col-span-2">
        <Logo className="mb-2" />
        <p className="mt-4 text-white/70 max-w-md leading-relaxed text-sm sm:text-base">
          TECHNOVA Learning : la plateforme africaine de formations & produits numériques
          à petit prix. Cybersécurité, IA, marketing, entrepreneuriat — apprenez ce que les
          entreprises recherchent vraiment.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="#" className="h-10 w-10 rounded-full bg-white/10 hover:bg-[#1877F2] transition-colors flex items-center justify-center text-white shadow-sm hover:-translate-y-1 duration-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>
          <a href="#" className="h-10 w-10 rounded-full bg-white/10 hover:bg-[#E4405F] transition-colors flex items-center justify-center text-white shadow-sm hover:-translate-y-1 duration-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>
          <a href="#" className="h-10 w-10 rounded-full bg-white/10 hover:bg-black transition-colors flex items-center justify-center text-white shadow-sm hover:-translate-y-1 duration-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
            </svg>
          </a>
        </div>
      </div>
      <div>
        <h4 className="font-display font-semibold mb-4">Navigation</h4>
        <ul className="space-y-2 text-white/70 text-sm">
          <li><Link to="/" className="hover:text-white">Accueil</Link></li>
          <li><Link to="/formations" className="hover:text-white">Nos formations</Link></li>
          <li><a href="/#pourquoi" className="hover:text-white">Pourquoi TECHNOVA</a></li>
          <li><a href="/#faq" className="hover:text-white">FAQ</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-display font-semibold mb-4">Contact</h4>
        <ul className="space-y-3 text-white/70 text-sm">
          <li className="flex gap-2 items-start break-all"><Mail className="h-4 w-4 mt-0.5 flex-none" /><span>contact@technovalearning.com</span></li>
          <li className="flex gap-2 items-start"><Phone className="h-4 w-4 mt-0.5 flex-none" /><span>+229 00 00 00 00</span></li>
          <li className="flex gap-2 items-start"><MapPin className="h-4 w-4 mt-0.5 flex-none" /><span>Cotonou, Bénin</span></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-white/10 py-5 px-4 text-center text-white/50 text-xs">
      © {new Date().getFullYear()} TECHNOVA Learning — Tous droits réservés.
    </div>
  </footer>
);


/* ---------- Logo Marquee (companies / tech) ---------- */
const TECH_LOGOS = [
  { name: "Google", url: "https://www.vectorlogo.zone/logos/google/google-icon.svg" },
  { name: "Microsoft", url: "https://www.vectorlogo.zone/logos/microsoft/microsoft-icon.svg" },
  { name: "Meta", url: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg" },
  { name: "AWS", url: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" },
  { name: "Python", url: "https://www.vectorlogo.zone/logos/python/python-icon.svg" },
];
export const LogoMarquee = () => (
  <section className="py-12 border-y border-[color:var(--border)] bg-white">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-8">
        Technologies & outils enseignés dans nos formations
      </p>
      <div className="flex flex-wrap justify-center gap-10 sm:gap-16 items-center">
        {TECH_LOGOS.map((logo, i) => (
          <img
            key={i}
            src={logo.url}
            alt={logo.name}
            loading="lazy"
            className="h-8 sm:h-10 w-auto object-contain opacity-70 hover:opacity-100 transition grayscale hover:grayscale-0"
          />
        ))}
      </div>
    </div>
  </section>
);

/* ---------- Section Heading ---------- */
export const SectionHead = ({ kicker, title, sub }: { kicker: string; title: ReactNode; sub?: string }) => (
  <div className="text-center max-w-2xl mx-auto mb-14">
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[color:var(--pastel-blue)] text-[color:var(--primary)] text-xs font-mono-display uppercase tracking-wider">
      <Sparkles className="h-3 w-3" />{kicker}
    </div>
    <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight">
      {title}
    </h2>
    {sub && <p className="mt-4 text-muted-foreground leading-relaxed">{sub}</p>}
  </div>
);

/* ---------- Why Choose Us ---------- */
const WHY = [
  { icon: Wallet, title: "Formations à petit prix", desc: "Accédez à un savoir premium pour le prix d'une pizza. Sans abonnement caché." },
  { icon: Headphones, title: "Support client ultra-actif", desc: "Une équipe qui répond en quelques minutes, 7j/7, sur WhatsApp et email." },
  { icon: Check, title: "100% pratique", desc: "Pas de blabla. Chaque module se termine par un projet concret applicable demain." },
  { icon: Shield, title: "Paiement local & sécurisé", desc: "MTN, Moov, Celtiis, Wave, Carte Visa. Vos transactions sont chiffrées." },
];
export const WhyChoose = () => (
  <section id="pourquoi" className="py-24 bg-[color:var(--sky-soft)]">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHead kicker="Pourquoi TECHNOVA"
        title={<>La plateforme que <span className="text-gradient">tous les apprenants</span> attendaient.</>}
        sub="Nous éliminons les obstacles classiques : prix, langue, support, paiement. Vous restez concentré sur ce qui compte : apprendre." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {WHY.map((w, i) => (
          <motion.div key={w.title}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            className="group p-7 rounded-3xl bg-white border border-[color:var(--border)] hover:border-[color:var(--primary)]/30 hover:shadow-elegant transition-all">
            <div className="h-14 w-14 rounded-2xl bg-primary-gradient grid place-items-center text-white mb-5 group-hover:scale-110 transition-transform shadow-glow">
              <w.icon className="h-7 w-7" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">{w.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ---------- FAQ ---------- */
const FAQ_ITEMS = [
  { q: "Comment fonctionne le paiement ?", a: "Vous payez en Mobile Money (MTN, Moov, Celtiis, Wave) ou par carte. Dès validation, vous recevez immédiatement un lien d'accès à votre formation par email." },
  { q: "Les formations sont-elles à vie ?", a: "Oui. Une fois achetée, une formation vous appartient à vie, avec toutes les mises à jour futures gratuites." },
  { q: "Y a-t-il un certificat à la fin ?", a: "Oui, chaque formation délivre un certificat de complétion téléchargeable, à ajouter sur LinkedIn ou votre CV." },
  { q: "Que se passe-t-il si je n'ai pas internet stable ?", a: "Nos vidéos sont téléchargeables. Vous étudiez hors-ligne, à votre rythme, où que vous soyez." },
  { q: "Puis-je demander un remboursement ?", a: "Oui. Garantie satisfait ou remboursé sous 7 jours, sans question." },
  { q: "Comment contacter le support ?", a: "WhatsApp, email, Facebook Messenger. Réponse en moins de 30 min en moyenne." },
];
export const FaqSection = () => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-24 bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHead kicker="Questions fréquentes"
          title={<>On répond à <span className="text-gradient">tout ce que vous vous demandez</span>.</>} />
        <div className="space-y-3">
          {FAQ_ITEMS.map((it, i) => (
            <div key={i} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--sky-soft)] overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left">
                <span className="font-display font-semibold text-base sm:text-lg">{it.q}</span>
                <ChevronDown className={`h-5 w-5 text-[color:var(--primary)] flex-none transition-transform ${open === i && "rotate-180"}`} />
              </button>
              {open === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed">{it.a}</motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ---------- Payment / Security ---------- */
export type PaymentLogo = { name: string; logoUrl: string };
const DEFAULT_PAY: PaymentLogo[] = [
  { name: "MTN Mobile Money", logoUrl: "https://www.vectorlogo.zone/logos/mtn/mtn-icon.svg" },
  { name: "Orange Money", logoUrl: "https://www.vectorlogo.zone/logos/orange/orange-icon.svg" },
  { name: "Moov Money", logoUrl: "https://www.vectorlogo.zone/logos/moov/moov-icon.svg" },
  { name: "Airtel Money", logoUrl: "https://www.vectorlogo.zone/logos/airtel/airtel-icon.svg" },
  { name: "Vodafone Cash", logoUrl: "https://www.vectorlogo.zone/logos/vodafone/vodafone-icon.svg" },
  { name: "M-Pesa", logoUrl: "https://www.vectorlogo.zone/logos/safaricom/safaricom-icon.svg" },
  { name: "Visa", logoUrl: "https://www.vectorlogo.zone/logos/visa/visa-icon.svg" },
  { name: "Mastercard", logoUrl: "https://www.vectorlogo.zone/logos/mastercard/mastercard-icon.svg" },
];
export const PaymentSecurity = ({ logos }: { logos?: PaymentLogo[] }) => {
  const list = logos && logos.length > 0 ? logos : DEFAULT_PAY;
  const loop = [...list, ...list, ...list];
  const trust = [
    { icon: Lock, label: "SSL 256-bit" },
    { icon: Shield, label: "PCI DSS" },
    { icon: Check, label: "RGPD" },
    { icon: CreditCard, label: "Anti-fraude" },
  ];
  return (
    <section className="py-20 sm:py-24 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[color:var(--pastel-green)] text-emerald-700 text-xs font-mono-display uppercase tracking-wider">
            <Lock className="h-3 w-3" /> Paiement 100% sécurisé
          </div>
          <h3 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight">
            Payez localement.{" "}
            <span className="text-gradient">Soyez livré instantanément.</span>
          </h3>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Mobile Money & cartes bancaires acceptés via PawaPay. Chiffrement SSL 256-bits,
            conforme PCI-DSS. Vos paiements n'ont jamais été aussi simples.
          </p>

          {/* Trust badges */}
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            {trust.map((t) => (
              <div
                key={t.label}
                className="px-3.5 py-1.5 rounded-full bg-[color:var(--sky-soft)] border border-[color:var(--border)] text-xs font-semibold inline-flex items-center gap-1.5 text-foreground/80"
              >
                <t.icon className="h-3.5 w-3.5 text-[color:var(--primary)]" />
                {t.label}
              </div>
            ))}
          </div>
        </div>

        {/* Logos marquee — propre, fond blanc */}
        <div className="relative overflow-hidden py-2">
          <div className="flex gap-4 sm:gap-5 animate-marquee w-max items-center">
            {loop.map((p, i) => (
              <div
                key={i}
                title={p.name}
                className="group h-20 w-32 sm:h-24 sm:w-40 rounded-2xl bg-white border border-[color:var(--border)] grid place-items-center px-4 shrink-0 shadow-soft hover:shadow-elegant hover:-translate-y-0.5 hover:border-[color:var(--primary)]/30 transition-all"
              >
                <img
                  src={p.logoUrl}
                  alt={p.name}
                  loading="lazy"
                  className="max-h-10 sm:max-h-12 max-w-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                    const parent = e.currentTarget.parentElement;
                    if (parent && !parent.querySelector(".fallback-label")) {
                      const span = document.createElement("span");
                      span.className = "fallback-label text-xs font-semibold text-foreground/70 text-center";
                      span.textContent = p.name;
                      parent.appendChild(span);
                    }
                  }}
                />
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />
        </div>
      </div>
    </section>
  );
};

/* ---------- Testimonials (marquee) ---------- */
const REVIEWS = [
  { name: "Aïcha K.", role: "Étudiante en marketing", text: "Avec 5000F, j'ai eu une formation que je payais 50.000F ailleurs. Le support répond en quelques minutes !", rating: 5, avatar: "https://randomuser.me/api/portraits/women/93.jpg" },
  { name: "Yannick D.", role: "Développeur junior", text: "Très pratique. J'ai pu décrocher mon premier contrat freelance 2 mois après avoir terminé la formation web.", rating: 5, avatar: "https://randomuser.me/api/portraits/men/53.jpg" },
  { name: "Mireille A.", role: "Entrepreneure", text: "Le module entrepreneuriat m'a aidée à structurer mon business. Paiement Mobile Money ultra simple.", rating: 5, avatar: "https://randomuser.me/api/portraits/women/68.jpg" },
  { name: "Karim B.", role: "Étudiant IA", text: "Contenus à jour, projets concrets, compétences directement applicables. Je recommande à 100%.", rating: 5, avatar: "https://randomuser.me/api/portraits/men/22.jpg" },
  { name: "Fatou S.", role: "Community Manager", text: "Le module marketing digital m'a permis de doubler mes clients en 3 mois. Merci TECHNOVA !", rating: 5, avatar: "https://randomuser.me/api/portraits/women/46.jpg" },
  { name: "Eric T.", role: "Étudiant cybersécurité", text: "Formations claires, pratiques, à un prix imbattable. J'ai adoré la qualité des vidéos.", rating: 5, avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
];
export const Reviews = () => {
  const loop = [...REVIEWS, ...REVIEWS];
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead kicker="Avis vérifiés"
          title={<>Ce que nos <span className="text-gradient">2000+ apprenants</span> en pensent.</>} />
      </div>
      <div className="relative">
        <div className="flex gap-5 animate-marquee-slow w-max">
          {loop.map((r, i) => (
            <div key={i}
              className="w-[300px] sm:w-[360px] shrink-0 p-6 rounded-3xl bg-[color:var(--sky-soft)] border border-[color:var(--border)] hover:shadow-elegant transition">
              <div className="flex gap-0.5 mb-3 text-[color:var(--accent)]">
                {Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed mb-5 italic">"{r.text}"</p>
              <div className="flex items-center gap-3 pt-3 border-t border-[color:var(--border)]">
                <img
                  src={r.avatar}
                  alt={r.name}
                  loading="lazy"
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-soft"
                />
                <div>
                  <div className="font-semibold text-sm">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-white to-transparent" />
      </div>
    </section>
  );
};

/* ---------- Course Card ---------- */
export type Course = {
  slug: string; title: string; cover: string; category: string;
  level: string; price: string; oldPrice?: string; duration: string;
};
export const CourseCard = ({ c, i = 0 }: { c: Course; i?: number }) => (
  <motion.article
    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }} transition={{ delay: i * 0.06 }}
    className="group rounded-3xl bg-white border border-[color:var(--border)] overflow-hidden hover:shadow-elegant hover:-translate-y-1 transition-all">
    <div className="relative aspect-[16/10] overflow-hidden">
      <img src={c.cover} alt={c.title} loading="lazy"
           className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 text-[10px] font-bold uppercase tracking-wider text-[color:var(--primary)]">
        {c.category}
      </div>
      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[color:var(--accent)] text-[10px] font-bold uppercase tracking-wider text-[color:var(--navy)]">
        {c.duration}
      </div>
    </div>
    <div className="p-5">
      <h3 className="font-display font-bold text-lg leading-snug group-hover:text-[color:var(--primary)] transition-colors">
        {c.title}
      </h3>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>Niveau · {c.level}</span>
        <div className="flex gap-0.5 text-[color:var(--accent)]">
          {Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-3 w-3 fill-current" />)}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-[color:var(--border)] flex items-center justify-between">
        <div>
          <span className="font-display font-bold text-xl text-[color:var(--primary)]">{c.price}</span>
          {c.oldPrice && <span className="ml-2 text-xs text-muted-foreground line-through">{c.oldPrice}</span>}
        </div>
        <Link to={`/product/${c.slug}`}
           className="inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--primary)] hover:gap-2 transition-all">
          Obtenir <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  </motion.article>
);

/* ---------- Benefits Strip ---------- */
const BENEFITS = [
  { n: "01", t: "Apprentissage à vie", d: "Achetez une fois, gardez à jamais avec mises à jour gratuites." },
  { n: "02", t: "Projets concrets", d: "Chaque module se termine par un livrable que vous pouvez vendre." },
  { n: "03", t: "Communauté privée", d: "Rejoignez 2000+ apprenants pour échanger et progresser ensemble." },
  { n: "04", t: "Certificat reconnu", d: "Boostez votre CV avec un certificat partageable sur LinkedIn." },
];
export const Benefits = () => (
  <section className="py-24 bg-[color:var(--sky-soft)]">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHead kicker="Vos bénéfices"
        title={<>Bien plus qu'une formation. <span className="text-gradient">Un investissement.</span></>} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {BENEFITS.map((b, i) => (
          <motion.div key={b.n}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="relative p-7 rounded-3xl bg-white border border-[color:var(--border)] overflow-hidden hover:shadow-elegant transition">
            <div className="text-6xl font-display font-extrabold text-[color:var(--primary)]/10 absolute top-3 right-4">{b.n}</div>
            <CreditCard className="h-8 w-8 text-[color:var(--primary)] mb-4" />
            <h3 className="font-display font-bold text-lg">{b.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b.d}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
