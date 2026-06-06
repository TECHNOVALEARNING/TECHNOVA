import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Loader2, FileText, Play, Briefcase } from 'lucide-react';
import siteLogo from '@/assets/logo.png';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export const Route = createFileRoute('/login')({
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          shouldCreateUser: true,
        }
      });

      if (error) throw error;
      setStep('otp');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 8) {
      setErrorMsg("Veuillez entrer les 8 chiffres.");
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });

      if (error) throw error;

      const adminEmails = ['isidoreagonan@gmail.com', 'acres707@gmail.com'];
      if (data.user?.email && adminEmails.includes(data.user.email)) {
        navigate({ to: '/admin' });
      } else {
        navigate({ to: '/dashboard' });
      }
      
    } catch (err: any) {
      setErrorMsg("Code incorrect ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/admin/' }
      });
    } catch (err: any) {
      setErrorMsg("Erreur lors de la connexion Google.");
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Colonne de gauche (Design Graphique) - Prend toute la hauteur avec un padding */}
      <div className="hidden lg:flex w-1/2">
        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 p-12 lg:p-16 xl:p-24 flex flex-col justify-center relative overflow-hidden shadow-2xl shadow-blue-900/20">
          
          {/* Logo Technova en fond géant façon Chariow */}
          <div className="absolute -bottom-24 -left-24 w-[700px] h-[700px] pointer-events-none opacity-10">
             <img src={siteLogo} alt="" className="w-full h-full object-contain brightness-0 invert" />
          </div>

          <div className="relative z-10 max-w-lg mx-auto w-full">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-display font-bold text-white mb-6 leading-[1.1]">
              Bienvenue dans l'espace <span className="text-amber-400 italic font-serif">client.</span>
            </h1>
            <p className="text-white/80 font-medium text-sm lg:text-base mb-10 max-w-md">
              Retrouvez ici l'ensemble de vos achats effectués sur n'importe quelle boutique Technova.
            </p>
          </div>
        </div>
      </div>

      {/* Colonne de droite (Formulaire) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-16 md:px-24 xl:px-32 relative">
        
        {/* Logo Technova centré */}
        <div className="flex justify-center mb-10">
          <Link to="/" className="flex flex-col items-center gap-4 font-display font-black text-4xl text-blue-600 tracking-tight">
            <img src={siteLogo} alt="Technova Logo" className="h-16 w-auto object-contain" />
            TECHNOVA
          </Link>
        </div>

        <div className="max-w-sm w-full mx-auto">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 border border-red-100 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
              {errorMsg}
            </div>
          )}

          {step === 'email' && (
            <>
              {/* Bouton Google */}
              <button 
                type="button"
                onClick={handleGoogleAuth}
                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors shadow-sm mb-8"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Se connecter avec Google
              </button>

              <div className="relative flex items-center justify-center mb-8">
                <hr className="w-full border-slate-200" />
                <span className="absolute bg-white px-4 text-xs text-slate-400 font-medium lowercase">
                  ou
                </span>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Adresse e-mail <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder-slate-300 shadow-sm"
                      placeholder="vous@exemple.com"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 mt-4 shadow-sm"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Recevoir un code par e-mail"}
                </button>
              </form>
            </>
          )}

          {step === 'otp' && (
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Vérifiez vos e-mails</h2>
              <p className="text-sm text-slate-500 text-center mb-8">
                Nous vous avons envoyé un e-mail à <span className="font-semibold text-slate-700">{email}</span> avec un code de vérification
              </p>

              <form onSubmit={handleVerifyOtp} className="w-full flex flex-col items-center">
                <p className="text-xs text-slate-500 mb-3 font-medium">Entrez le code de vérification</p>
                <div className="mb-6">
                  <InputOTP maxLength={8} value={otp} onChange={setOtp} className="gap-2">
                    <InputOTPGroup className="gap-1 sm:gap-2">
                      <InputOTPSlot index={0} className="w-8 h-10 sm:w-10 sm:h-12 text-base sm:text-lg border-slate-300 rounded-lg shadow-sm" />
                      <InputOTPSlot index={1} className="w-8 h-10 sm:w-10 sm:h-12 text-base sm:text-lg border-slate-300 rounded-lg shadow-sm" />
                      <InputOTPSlot index={2} className="w-8 h-10 sm:w-10 sm:h-12 text-base sm:text-lg border-slate-300 rounded-lg shadow-sm" />
                      <InputOTPSlot index={3} className="w-8 h-10 sm:w-10 sm:h-12 text-base sm:text-lg border-slate-300 rounded-lg shadow-sm" />
                      <InputOTPSlot index={4} className="w-8 h-10 sm:w-10 sm:h-12 text-base sm:text-lg border-slate-300 rounded-lg shadow-sm" />
                      <InputOTPSlot index={5} className="w-8 h-10 sm:w-10 sm:h-12 text-base sm:text-lg border-slate-300 rounded-lg shadow-sm" />
                      <InputOTPSlot index={6} className="w-8 h-10 sm:w-10 sm:h-12 text-base sm:text-lg border-slate-300 rounded-lg shadow-sm" />
                      <InputOTPSlot index={7} className="w-8 h-10 sm:w-10 sm:h-12 text-base sm:text-lg border-slate-300 rounded-lg shadow-sm" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <button 
                  type="submit"
                  disabled={loading || otp.length !== 8}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3.5 rounded-xl font-bold flex items-center justify-center transition-colors disabled:opacity-50 shadow-sm"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Se connecter >"}
                </button>
              </form>

              <div className="mt-6 text-xs text-slate-500">
                Vous n'avez pas reçu l'e-mail ?{' '}
                <button 
                  onClick={handleSendOtp} 
                  disabled={loading}
                  className="text-blue-600 font-semibold hover:underline disabled:opacity-50"
                >
                  Cliquez ici
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
