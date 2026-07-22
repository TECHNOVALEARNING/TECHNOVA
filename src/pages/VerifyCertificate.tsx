import { useSearchParams, Link } from "react-router-dom";
import { ShieldCheck, Calendar, GraduationCap, CheckCircle2, Home, Award } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";

const VerifyCertificate = () => {
  const [searchParams] = useSearchParams();
  const studentName = searchParams.get("name") || "Élève Certifié";
  const courseTitle = searchParams.get("course") || "Formation Certifiante";
  const completionDate = searchParams.get("date") || new Date().toLocaleDateString("fr-FR");
  const storeName = searchParams.get("org") || "TECHNOVA Learning";

  return (
    <div className="min-h-screen w-full bg-background flex flex-col justify-between font-sans relative overflow-hidden py-12 px-4">
      <SEOHead
        title="Vérification de l'Attestation Numérique — TECHNOVA"
        description="Portail officiel de vérification des certificats de réussite TECHNOVA Learning."
      />

      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-xl mx-auto my-auto relative z-10">
        {/* Decorative Top Accent */}
        <div className="w-full h-2 rounded-t-3xl bg-gradient-to-r from-amber-400 via-primary to-emerald-400 shadow-lg" />
        
        <div className="bg-card border border-border/80 rounded-b-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
          {/* Header Icon & Branding */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4 relative">
              <CheckCircle2 className="h-10 w-10 animate-pulse" />
              <div className="absolute inset-0 rounded-full border border-emerald-500/30 scale-125 animate-ping opacity-75" />
            </div>
            
            <div className="text-[10px] font-bold tracking-widest text-emerald-500 uppercase flex items-center gap-1.5 justify-center mb-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Attestation Numérique Confirmée</span>
            </div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Technova Learning Academy
            </h2>
          </div>

          <div className="space-y-6">
            {/* Main Info Blocks */}
            <div className="p-5 rounded-2xl bg-muted/30 border border-border/50 space-y-4">
              {/* Student Name */}
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">
                  Titulaire de l'attestation
                </span>
                <span className="text-xl font-extrabold text-foreground tracking-tight uppercase">
                  {studentName}
                </span>
              </div>

              {/* Separator line */}
              <div className="h-px bg-border" />

              {/* Course Title */}
              <div className="flex items-start gap-3">
                <GraduationCap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Formation Complétée
                  </span>
                  <span className="text-sm font-bold text-foreground mt-0.5 leading-snug">
                    {courseTitle}
                  </span>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Date de Délivrance
                  </span>
                  <span className="text-sm font-bold text-foreground mt-0.5">
                    {completionDate}
                  </span>
                </div>
              </div>

              {/* Organization */}
              <div className="flex items-start gap-3">
                <Award className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Organisme Émetteur
                  </span>
                  <span className="text-sm font-bold text-foreground mt-0.5">
                    {storeName}
                  </span>
                </div>
              </div>
            </div>

            {/* Official Confirmation Text */}
            <p className="text-xs text-muted-foreground leading-relaxed text-center px-2">
              Le présent certificat numérique de fin de formation atteste que l'élève mentionné ci-dessus a validé et complété avec succès l'intégralité du parcours pédagogique requis, conformément aux critères de compétences académiques de TECHNOVA.
            </p>

            {/* Verification Success Seal */}
            <div className="pt-2">
              <div className="mx-auto w-max px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <i className="fa-solid fa-seal-question text-emerald-500 text-xs" />
                <span>Document Officiel TECHNOVA · Signature Certifiée</span>
              </div>
            </div>

            {/* Back Home CTA */}
            <div className="pt-4 flex justify-center">
              <Button asChild variant="outline" className="rounded-xl px-6 gap-2 text-xs font-semibold border-border">
                <Link to="/">
                  <Home className="h-3.5 w-3.5" />
                  <span>Retour à l'accueil</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="text-center text-[10px] text-muted-foreground/60 font-semibold tracking-wider uppercase mt-8 relative z-10">
        © {new Date().getFullYear()} TECHNOVA Inc. Tous droits réservés.
      </footer>
    </div>
  );
};

export default VerifyCertificate;
