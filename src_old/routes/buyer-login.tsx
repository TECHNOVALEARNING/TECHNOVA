import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Package, GraduationCap, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';

export const Route = createFileRoute('/buyer-login')({
  component: BuyerLogin,
});

function BuyerLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      // 1. Verify customer exists first
      const { data: customerData, error: customerError } = await supabase
        .from('orders')
        .select('customer_id')
        .eq('customer_email', email)
        .limit(1);

      if (customerError || !customerData || customerData.length === 0) {
         toast.error("Aucun achat n'a été trouvé avec cette adresse email.");
         setLoading(false);
         return;
      }

      // 2. Send actual OTP via Edge Function
      const { data, error } = await supabase.functions.invoke('send-buyer-otp', {
        body: { email: email.trim().toLowerCase() },
      });
      
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        setLoading(false);
        return;
      }

      toast.success(`Un code a été envoyé à ${email}.`);
      setStep(2);

    } catch (err: any) {
      toast.error(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    setLoading(true);
    try {
      // Real OTP verification via Edge Function
      const { data, error } = await supabase.functions.invoke('verify-buyer-otp', {
        body: { email: email.trim().toLowerCase(), code: otp.trim() },
      });
      
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        setLoading(false);
        return;
      }

      // Establish real Supabase auth session if returned
      if (data.session?.access_token && data.session?.refresh_token) {
         await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
         });
      }

      // Find customer info
      const { data: orderData } = await supabase
        .from('orders')
        .select('customer_id, customer_name')
        .eq('customer_email', email)
        .limit(1)
        .single();

      if (orderData || data.customer?.id) {
        localStorage.setItem('buyer_session', JSON.stringify({
          email: email.trim().toLowerCase(),
          customerId: data.customer?.id || orderData?.customer_id,
          customerName: data.customer?.name || orderData?.customer_name,
          authenticatedAt: Date.now()
        }));
        
        toast.success("Connexion réussie !");
        navigate({ to: '/mes-achats' });
      } else {
         toast.error("Erreur lors de la récupération de votre profil.");
      }

    } catch (err: any) {
      toast.error(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <div className="h-20 bg-white border-b border-slate-200 flex items-center justify-center">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1E293B] flex items-center justify-center">
              <span className="text-white font-bold text-[14px]">T</span>
            </div>
            <span className="font-bold text-[18px] text-slate-900">TECHNOVALearning</span>
         </div>
      </div>

      <div className="flex-1 flex">
         {/* Left Side - Login Form */}
         <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8 sm:p-10 relative overflow-hidden">
               
               {/* Decorative background */}
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-[#1E293B]"></div>
               
               {step === 1 ? (
                 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="text-center">
                     <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                       <Package className="w-8 h-8 text-blue-600" />
                     </div>
                     <h1 className="text-[24px] font-bold text-slate-900 mb-2">Accédez à vos achats</h1>
                     <p className="text-[14px] text-slate-500">
                       Entrez l'adresse email utilisée lors de vos commandes pour retrouver toutes vos formations et fichiers.
                     </p>
                   </div>

                   <form onSubmit={handleSendOtp} className="space-y-4">
                     <div>
                       <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">Adresse email</label>
                       <input
                         type="email"
                         value={email}
                         onChange={e => setEmail(e.target.value)}
                         placeholder="vous@exemple.com"
                         className="w-full h-12 px-4 text-[15px] bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E293B]/20 focus:border-[#1E293B] transition-all"
                         required
                       />
                     </div>
                     <button
                       type="submit"
                       disabled={loading || !email}
                       className="w-full h-12 bg-[#1E293B] text-white text-[15px] font-bold rounded-xl hover:bg-[#0F172A] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 group"
                     >
                       {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                         <>
                           Continuer
                           <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                         </>
                       )}
                     </button>
                   </form>
                 </div>
               ) : (
                 <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                   <button 
                     onClick={() => setStep(1)}
                     className="text-[13px] font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
                   >
                     <ArrowLeft className="w-4 h-4" /> Changer d'email
                   </button>
                   
                   <div>
                     <h1 className="text-[24px] font-bold text-slate-900 mb-2">Vérifiez vos emails</h1>
                     <p className="text-[14px] text-slate-500">
                       Nous avons envoyé un code de connexion à <span className="font-semibold text-slate-900">{email}</span>.
                     </p>
                   </div>

                   <form onSubmit={handleVerifyOtp} className="space-y-4">
                     <div>
                       <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">Code à 6 chiffres</label>
                       <input
                         type="text"
                         value={otp}
                         onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                         placeholder="123456"
                         className="w-full h-14 text-center text-[24px] tracking-[0.5em] font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E293B]/20 focus:border-[#1E293B] transition-all"
                         required
                         autoFocus
                       />
                     </div>
                     <button
                       type="submit"
                       disabled={loading || otp.length < 6}
                       className="w-full h-12 bg-[#1E293B] text-white text-[15px] font-bold rounded-xl hover:bg-[#0F172A] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                     >
                       {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Se connecter'}
                     </button>
                   </form>

                   <div className="text-center">
                      <p className="text-[13px] text-slate-500">
                        Vous n'avez pas reçu le code ? <button onClick={handleSendOtp} className="font-bold text-[#1E293B] hover:underline">Renvoyer</button>
                      </p>
                   </div>
                 </div>
               )}
            </div>
         </div>

         {/* Right Side - Marketing Panel (Hidden on mobile) */}
         <div className="hidden lg:flex flex-1 bg-[#1E293B] p-12 items-center justify-center relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>

            <div className="max-w-md relative z-10">
               <div className="flex gap-4 mb-8">
                 <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl">
                    <GraduationCap className="w-8 h-8 text-blue-400" />
                 </div>
                 <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl translate-y-4">
                    <Package className="w-8 h-8 text-amber-400" />
                 </div>
               </div>
               
               <h2 className="text-[36px] font-bold text-white leading-tight mb-4">
                 Votre espace d'apprentissage personnel.
               </h2>
               <p className="text-[16px] text-slate-400 leading-relaxed">
                 Retrouvez toutes les formations, e-books et fichiers que vous avez achetés sur les boutiques propulsées par TechnovaLearning en un seul endroit.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
