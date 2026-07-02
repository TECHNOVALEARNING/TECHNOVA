import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Users, Globe, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Phone3D from "@/components/Phone3D";
import TrustBadgesStrip from "@/components/TrustBadgesStrip";

const productTypes = [
  { emoji: "📁", label: "Fichiers", href: "/fichiers" },
  { emoji: "🎓", label: "Cours", href: "/cours" },
  { emoji: "🔑", label: "Licences", href: "/licences" },
];

const HeroSection = () => {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-mesh py-24 md:py-36">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(0,0,0)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
          }}
        />

        <div className="container relative mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <div className="text-center md:text-left order-2 md:order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-1.5 shadow-sm backdrop-blur-sm"
              >
                <span className="flex h-2 w-2 rounded-full bg-primary" />
                <span className="text-xs font-medium text-muted-foreground">
                  +1M$ reversés aux créateurs
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-6 text-4xl font-extrabold leading-[1.1] text-foreground md:text-5xl lg:text-6xl"
              >
                La plateforme #1 pour vendre vos{" "}
                <span className="text-gradient">produits digitaux</span>.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-10 text-lg text-muted-foreground md:text-xl leading-relaxed"
              >
                Créez votre boutique en 5 minutes, vendez vos produits digitaux dans le monde entier
                et recevez vos revenus rapidement.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col items-center gap-4 sm:flex-row md:justify-start sm:justify-center"
              >
                <Link to="/register">
                  <Button
                    size="lg"
                    className="px-8 py-6 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                  >
                    Créer une boutique gratuite
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/products">
                  <Button variant="outline" size="lg" className="px-8 py-6 text-base font-medium">
                    Explorer les produits
                  </Button>
                </Link>
              </motion.div>

              <TrustBadgesStrip className="mt-6 justify-center md:justify-start" />

              {/* Product type tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="mt-14 flex flex-wrap justify-center md:justify-start gap-3"
              >
                {productTypes.map((type) => (
                  <Link key={type.label} to={type.href}>
                    <div className="flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 shadow-sm transition-all hover:shadow-md hover:border-primary/30 cursor-pointer">
                      <span className="text-base">{type.emoji}</span>
                      <span className="text-sm font-medium text-foreground">{type.label}</span>
                    </div>
                  </Link>
                ))}
              </motion.div>
            </div>

            {/* Right: 3D Phone - Desktop */}
            <div className="hidden md:flex justify-center items-center order-2">
              <Phone3D />
            </div>

            {/* Phone 3D - Mobile */}
            <div className="flex md:hidden justify-center items-center order-1 mb-2">
              <Phone3D compact />
            </div>
          </div>

          {/* Hero Illustration */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 mx-auto max-w-4xl"
          >
            <div className="relative">
              {/* Floating glow */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <img
                  src="/images/hero-illustration.png"
                  alt="TECHNOVA - Plateforme de vente de produits digitaux avec boutique vendeur et espace acheteur"
                  className="w-full rounded-2xl shadow-2xl"
                  loading="eager"
                />
              </motion.div>
              {/* Glow effect */}
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-primary/10 blur-3xl" />
              <div className="absolute -inset-8 -z-20 rounded-3xl bg-accent/5 blur-[60px]" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Platform Preview - Dashboard Mockup */}
      <section className="py-20 bg-background overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative mx-auto max-w-5xl"
          >
            {/* Browser frame */}
            <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
              {/* Browser bar */}
              <div className="flex items-center gap-2 border-b border-border px-4 py-3 bg-secondary/50">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-destructive/60" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400/60" />
                  <div className="h-3 w-3 rounded-full bg-green-400/60" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="rounded-md bg-background border border-border px-4 py-1.5 text-xs text-muted-foreground text-center">
                    dashboard.technova.com
                  </div>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-6 md:p-8 bg-background">
                <div className="grid gap-4 md:grid-cols-4 mb-6">
                  {[
                    {
                      label: "Revenus du mois",
                      value: "2 450 000 FCFA",
                      change: "+24%",
                      icon: TrendingUp,
                    },
                    { label: "Ventes", value: "342", change: "+18%", icon: Zap },
                    { label: "Clients actifs", value: "1 247", change: "+12%", icon: Users },
                    { label: "Pays touchés", value: "23", change: "+3", icon: Globe },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">{stat.label}</span>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-xl font-bold text-card-foreground">{stat.value}</p>
                      <span className="text-xs font-medium text-primary">{stat.change}</span>
                    </div>
                  ))}
                </div>

                {/* Revenue chart mockup */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-semibold text-card-foreground">
                      Évolution des revenus
                    </h3>
                    <span className="text-xs text-muted-foreground">12 derniers mois</span>
                  </div>
                  <div className="flex items-end gap-2 h-40">
                    {[30, 45, 35, 55, 50, 65, 60, 75, 70, 85, 80, 95].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05, duration: 0.5 }}
                        className="flex-1 rounded-t-md bg-primary/20 hover:bg-primary/40 transition-colors relative group"
                      >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-foreground font-medium whitespace-nowrap">
                          {Math.round(h * 28000)}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    {[
                      "Jan",
                      "Fév",
                      "Mar",
                      "Avr",
                      "Mai",
                      "Jun",
                      "Jul",
                      "Aoû",
                      "Sep",
                      "Oct",
                      "Nov",
                      "Déc",
                    ].map((m) => (
                      <span
                        key={m}
                        className="text-[10px] text-muted-foreground flex-1 text-center"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Glow effect behind */}
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-primary/5 blur-2xl" />
          </motion.div>
        </div>
      </section>

      {/* Speed & Payment section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider">
              Rapidité
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4">
              Des paiements à la vitesse de l'éclair
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Recevez vos revenus en 24h. Pas de délais, pas de complications.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "Client achète",
                desc: "Paiement sécurisé via Mobile Money ou carte bancaire en quelques secondes.",
                time: "~10s",
              },
              {
                step: "2",
                title: "Livraison instantanée",
                desc: "Le client reçoit immédiatement son produit digital par email et dans son espace.",
                time: "Immédiat",
              },
              {
                step: "3",
                title: "Vous êtes payé",
                desc: "Vos revenus sont reversés automatiquement sur votre compte.",
                time: "24-72h",
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-xl font-bold shadow-lg shadow-primary/25">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{s.desc}</p>
                <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {s.time}
                </span>
                {i < 2 && (
                  <div className="hidden md:block absolute top-7 -right-4 w-8">
                    <ArrowRight className="h-5 w-5 text-muted-foreground/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid gap-12 md:grid-cols-4 text-center">
            {[
              { num: "10K+", label: "Créateurs actifs" },
              { num: "1M$+", label: "Revenus reversés" },
              { num: "40+", label: "Pays supportés" },
              { num: "99.9%", label: "Disponibilité" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <p className="text-4xl md:text-5xl font-extrabold text-gradient mb-2">{stat.num}</p>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
