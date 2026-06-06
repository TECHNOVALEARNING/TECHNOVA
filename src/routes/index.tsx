import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowRight, BookOpen, Star, PlayCircle, Clock, Zap, Target, BarChart as BarChartIcon, 
  Users, CheckCircle2, Award, Shield, Check, Lock, CreditCard, ChevronRight,
  Calendar, Activity, Play, TrendingUp
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import hero from "@/assets/hero-new-white.png";
import {
  Header, Footer, LogoMarquee, WhyChoose, FaqSection,
  PaymentSecurity, Reviews, Benefits, CourseCard, SectionHead,
} from "@/components/site/shared";
import { ALL_COURSES } from "@/data/courses";
import { getPawapayLogos } from "@/lib/pawapay.functions";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "TECHNOVA Learning — Formations digitales à petit prix" },
      { name: "description", content: "Cybersécurité, IA, marketing, entrepreneuriat. Formations & ebooks pratiques, payez en Mobile Money. 2000+ apprenants nous font confiance." },
      { property: "og:title", content: "TECHNOVA Learning — Apprenez la tech à petit prix" },
      { property: "og:description", content: "Formations 100% pratiques, paiement Mobile Money, support 7j/7." },
      { property: "og:url", content: "/" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

/* Evolution data – digital usage in Africa */
const DIGITAL_DATA = [
  { year: "2018", digital: 22, infopreneur: 8, entrepreneur: 14 },
  { year: "2019", digital: 31, infopreneur: 13, entrepreneur: 19 },
  { year: "2020", digital: 48, infopreneur: 22, entrepreneur: 27 },
  { year: "2021", digital: 60, infopreneur: 34, entrepreneur: 39 },
  { year: "2022", digital: 72, infopreneur: 49, entrepreneur: 52 },
  { year: "2023", digital: 84, infopreneur: 67, entrepreneur: 64 },
  { year: "2024", digital: 92, infopreneur: 81, entrepreneur: 75 },
  { year: "2025", digital: 98, infopreneur: 94, entrepreneur: 88 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-lg min-w-[150px]">
        <p className="font-display font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">
          {label}
        </p>
        <div className="space-y-3">
          {payload.map((entry: any, index: number) => {
            const color = entry.dataKey === 'digital' ? '#3b82f6' : entry.dataKey === 'infopreneur' ? '#f59e0b' : '#10b981';
            const name = entry.dataKey === 'digital' ? 'digital' : entry.dataKey === 'infopreneur' ? 'infopreneur' : 'entrepreneur';
            return (
              <div key={index} className="flex items-center justify-between gap-6">
                <span className="text-sm font-medium" style={{ color }}>{name} :</span>
                <span className="font-bold text-sm" style={{ color }}>{entry.value}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

function HomePage() {
  const { data: pay } = useQuery({
    queryKey: ["pawapay-logos-v11"],
    queryFn: () => getPawapayLogos(),
    staleTime: 60 * 60 * 1000,
  });
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />

      {/* ============== HERO ============== */}
      <section className="relative bg-hero overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-[color:var(--primary)]/10 animate-blob" />
        <div className="absolute bottom-0 right-20 w-96 h-96 bg-[color:var(--accent)]/10 animate-blob" style={{ animationDelay: "3s" }} />
        <div className="absolute inset-0 grid-bg opacity-50" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-24 lg:pt-20 lg:pb-32 grid lg:grid-cols-2 gap-10 items-center">
          {/* left */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-soft text-[color:var(--primary)] text-xs font-mono-display uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)] animate-pulse" /> L'excellence digitale pour tous
            </div>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold leading-[1.05]">
              <span className="bg-gradient-to-r from-[color:var(--primary)] to-blue-400 bg-clip-text text-transparent italic font-black pr-2 tracking-tight drop-shadow-sm">Apprenez sur la tech</span><br />
              sans aucune limite
            </h1>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed">
              Des formations et produits numériques de haute qualité pour propulser votre carrière, où que vous soyez. Cybersécurité, IA, marketing, entrepreneuriat — accessibles à tous et à petit prix.
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {["Certificat inclus", "Compétences pro", "Accès à vie"].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-[color:var(--primary)]/10 grid place-items-center">
                    <Check className="h-3 w-3 text-[color:var(--primary)]" />
                  </span>
                  <span className="font-medium">{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/formations"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-primary-gradient text-white text-sm font-semibold shadow-glow hover:scale-[1.03] transition-transform">
                Commencer maintenant <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#evolution"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[color:var(--navy)] text-white text-sm font-semibold hover:bg-[color:var(--navy)]/90 transition">
                <Play className="h-4 w-4" /> Pourquoi maintenant
              </a>
            </div>
          </motion.div>

          {/* right — hero illustration */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full max-w-[320px] sm:max-w-[420px] lg:max-w-[500px] mx-auto mt-8 lg:mt-0">
            {/* big blue circle behind */}
            <div className="absolute -inset-6 sm:-inset-10 rounded-full border-[2px] sm:border-[3px] border-[color:var(--primary)]/30 border-dashed animate-spin-slow" style={{ animationDuration: '40s' }} />
            <div className="absolute inset-0 rounded-[2.5rem] bg-[color:var(--primary)]/10 rotate-3 transform-gpu" />
            
            <div className="relative aspect-[3/4] sm:aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border-[4px] sm:border-[6px] border-[color:var(--primary)] z-10 bg-white">
              <img src={hero} alt="Étudiant TECHNOVA" 
                   className="absolute inset-0 h-full w-full object-cover object-top hover:scale-105 transition-transform duration-700" />
            </div>

            {/* floating stat card – top */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
              className="absolute top-4 sm:top-10 -left-4 sm:-left-8 bg-white/95 backdrop-blur rounded-2xl shadow-xl px-3 py-2 sm:px-5 sm:py-4 flex items-center gap-3 sm:gap-4 z-30">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-[color:var(--primary)] grid place-items-center text-white">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <div className="font-display font-bold text-base sm:text-lg leading-none">2 000+</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Apprenants actifs</div>
              </div>
            </motion.div>
            {/* floating stat card – bottom */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}
              className="absolute bottom-6 sm:bottom-12 -right-4 sm:-right-8 bg-white/95 backdrop-blur rounded-2xl shadow-xl px-3 py-2 sm:px-5 sm:py-4 flex items-center gap-3 sm:gap-4 z-30" style={{ animationDelay: "2s" }}>
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-[color:var(--accent)] grid place-items-center text-[color:var(--navy)]">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <div className="font-display font-bold text-base sm:text-lg leading-none">50+</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Produits numériques</div>

              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* stat bar — marquee on mobile, grid on desktop */}
        <div className="relative mx-auto max-w-7xl sm:px-6 lg:px-8 pb-10">
          {/* Mobile : marquee */}
          <div className="sm:hidden relative overflow-hidden bg-white rounded-none shadow-soft py-4">
            <div className="flex gap-6 animate-marquee w-max items-center">
              {[
                { icon: BookOpen, l: "50+ Formations" },
                { icon: Users, l: "Support 7j/7" },
                { icon: Award, l: "Certificat reconnu" },
                { icon: Zap, l: "Accès instantané" },
                { icon: BookOpen, l: "50+ Formations" },
                { icon: Users, l: "Support 7j/7" },
                { icon: Award, l: "Certificat reconnu" },
                { icon: Zap, l: "Accès instantané" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2.5 px-3 shrink-0">
                  <div className="h-9 w-9 rounded-full bg-[color:var(--primary)]/10 grid place-items-center">
                    <s.icon className="h-4 w-4 text-[color:var(--primary)]" />
                  </div>
                  <span className="text-sm font-semibold whitespace-nowrap">{s.l}</span>
                </div>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent" />
          </div>
          {/* Desktop : grid */}
          <div className="hidden sm:grid grid-cols-4 gap-6 bg-white rounded-3xl shadow-soft p-6 mx-4 sm:mx-0">
            {[
              { icon: BookOpen, l: "50+ Formations" },
              { icon: Users, l: "Support 7j/7" },
              { icon: Award, l: "Certificat reconnu" },
              { icon: Zap, l: "Accès instantané" },
            ].map((s) => (
              <div key={s.l} className="flex items-center gap-3 px-2">
                <div className="h-10 w-10 rounded-full bg-[color:var(--primary)]/10 grid place-items-center">
                  <s.icon className="h-5 w-5 text-[color:var(--primary)]" />
                </div>
                <span className="text-sm font-semibold">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>


      <LogoMarquee />

      {/* ============== EVOLUTION GRAPH ============== */}
      <section id="evolution" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHead kicker="Pourquoi maintenant"
            title={<>Le digital, l'infopreneuriat & l'entreprenariat <span className="text-gradient">explosent</span></>}
            sub="Ne soyez pas spectateur. L'adoption des compétences numériques en Afrique a triplé en 5 ans. Ceux qui apprennent aujourd'hui gagnent demain." />

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-3xl bg-[#f0f7ff] border border-blue-100 p-6 sm:p-10 shadow-sm relative group">
            
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-10">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Adoption (%)</p>
                <h3 className="font-display font-semibold text-xl sm:text-3xl text-slate-900 tracking-tight">
                  Évolution 2018 &rarr; 2025
                </h3>
              </div>
              <div className="flex flex-wrap gap-5 text-sm font-semibold">
                <span className="flex items-center gap-2 text-slate-700"><span className="h-3 w-3 rounded-full bg-[#3b82f6]" />Digital</span>
                <span className="flex items-center gap-2 text-slate-700"><span className="h-3 w-3 rounded-full bg-[#f59e0b]" />Infopreneuriat</span>
                <span className="flex items-center gap-2 text-slate-700"><span className="h-3 w-3 rounded-full bg-[#10b981]" />Entreprenariat</span>
              </div>
            </div>
            
            <div className="h-[300px] sm:h-[400px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DIGITAL_DATA} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="gAmber" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={true} vertical={false} />
                  
                  <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} fontFamily="Inter, sans-serif" tickLine={false} axisLine={false} dy={15} />
                  <YAxis stroke="#94a3b8" fontSize={12} fontFamily="Inter, sans-serif" tickLine={false} axisLine={false} dx={-10} />
                  
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,0,0,0.1)', strokeWidth: 1 }} />
                  
                  <Area type="monotone" dataKey="digital" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#gBlue)" />
                  <Area type="monotone" dataKey="infopreneur" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#gAmber)" />
                  <Area type="monotone" dataKey="entrepreneur" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#gGreen)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
              {[
                { title: "Croissance digitale 2018-2025", value: "+346%", color: "text-blue-600" },
                { title: "Boom infopreneuriat", value: "+1075%", color: "text-amber-500" },
                { title: "Nouveaux entrepreneurs", value: "+528%", color: "text-emerald-500" }
              ].map((stat, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm mb-2">
                    <TrendingUp className="w-4 h-4" /> En forte hausse
                  </div>
                  <div className={`text-4xl font-display font-bold mb-1 ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-slate-500 font-medium text-sm">
                    {stat.title}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <WhyChoose />

      <Benefits />
      <PaymentSecurity logos={pay?.logos} />
      <Reviews />
      <FaqSection />

      {/* ============== CTA ============== */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-primary-gradient p-10 sm:p-16 text-white text-center overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-20 dotted-bg" />
            <h2 className="relative font-display font-bold text-3xl sm:text-5xl leading-tight">
              Prêt à transformer votre carrière ?
            </h2>
            <p className="relative mt-4 text-white/85 max-w-2xl mx-auto">
              Rejoignez plus de 2000 apprenants à travers le monde. Une formation aujourd'hui, des compétences pour toute la vie.
            </p>
            <div className="relative mt-8 flex flex-wrap gap-3 justify-center">
              <Link to="/formations" className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-white text-[color:var(--primary)] font-semibold hover:scale-105 transition">
                Voir les formations <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="https://web.facebook.com" target="_blank" rel="noopener" className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-white/15 border border-white/30 text-white font-semibold hover:bg-white/25 transition">
                Suivre sur Facebook
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
