import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Header, Footer } from '@/components/site/shared';
import { DownloadCloud, FileText, Share2, HelpCircle, AlertTriangle, ShieldCheck, CreditCard, Loader2, ChevronDown, Check } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/product/$id')({
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-slate-300 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Produit introuvable</h2>
          <p className="text-slate-500 mb-6">Ce produit n'existe plus ou a été retiré.</p>
          <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">Retour à l'accueil</Link>
        </div>
        <Footer />
      </div>
    );
  }

  let features: any = {};
  try {
    features = typeof product.features === 'string' ? JSON.parse(product.features) : (product.features || {});
  } catch (e) {}

  const oldPrice = features.crossed_price;
  const productType = features.type || 'fichier';

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans selection:bg-blue-100">
      <Header />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* LEFT COLUMN - 65% */}
          <div className="flex-1 lg:max-w-[65%]">
            
            {/* Title & Type */}
            <div className="mb-10">
              <h1 className="text-[32px] sm:text-[40px] font-black text-slate-900 leading-[1.1] tracking-tight mb-4">
                {product.title}
              </h1>
              <div className="flex items-center gap-2 text-slate-500 text-[14px] font-medium">
                <DownloadCloud className="w-4 h-4" />
                <span>{productType === 'fichier' ? 'Téléchargeable' : productType === 'formation' ? 'Formation en ligne' : 'Service'}</span>
              </div>
            </div>

            {/* Fichiers block (mock UI for files) */}
            {productType === 'fichier' && (
              <div className="mb-12">
                <h3 className="text-[18px] font-bold text-slate-900 mb-4">Fichiers (1)</h3>
                
                <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-xl px-4 py-3 mb-4 flex items-center gap-3 text-[#D97706] text-[13px] font-medium">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <p>Prévisualisez gratuitement les premières pages avant l'achat</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-[15px]">Fichier du produit</h4>
                      <p className="text-slate-500 text-[12px]">Accès instantané après achat</p>
                    </div>
                  </div>
                  <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[12px] font-bold px-4 py-2 rounded-full transition">
                    Aucun aperçu
                  </button>
                </div>
              </div>
            )}

            {/* Description (Rich Text) */}
            <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-600 hover:prose-a:text-blue-700 mb-16 custom-editor-content">
              {product.description ? (
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              ) : (
                <p>Aucune description disponible pour ce produit.</p>
              )}
            </div>

            <style dangerouslySetInnerHTML={{__html: `
              .custom-editor-content h1 { font-size: 28px; font-weight: 900; margin-top: 1.5em; margin-bottom: 0.5em; color: #0F172A; }
              .custom-editor-content h2 { font-size: 22px; font-weight: 800; margin-top: 1.5em; margin-bottom: 0.5em; color: #0F172A; }
              .custom-editor-content h3 { font-size: 18px; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.5em; color: #0F172A; }
              .custom-editor-content p { font-size: 16px; line-height: 1.7; color: #334155; margin-bottom: 1em; }
              .custom-editor-content ul { list-style-type: none; padding-left: 0; margin: 1.5em 0; }
              .custom-editor-content ul li { position: relative; padding-left: 1.75em; margin-bottom: 0.75em; color: #334155; font-size: 16px; line-height: 1.6; }
              .custom-editor-content ul li::before { content: "✓"; position: absolute; left: 0; top: 0; color: #10B981; font-weight: bold; }
              .custom-editor-content strong { font-weight: 700; color: #0F172A; }
            `}} />

            {/* FAQ Accordion */}
            <div className="mt-16 border-t border-slate-200 pt-12">
              <h3 className="text-[24px] font-black text-slate-900 mb-8 tracking-tight">Questions Fréquentes</h3>
              <div className="space-y-3">
                {[
                  { q: "Comment vais-je recevoir mon produit ?", a: "Une fois le paiement validé, vous recevrez immédiatement un lien de téléchargement par e-mail et sur votre espace membre." },
                  { q: "Quels sont les moyens de paiement acceptés ?", a: "Nous acceptons les paiements par carte bancaire (Visa, Mastercard) ainsi que Mobile Money sécurisé." },
                  { q: "Puis-je obtenir un remboursement ?", a: "Nos produits numériques étant livrés instantanément, ils ne sont généralement pas remboursables, sauf cas exceptionnel détaillé dans nos CGV." }
                ].map((faq, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300">
                    <button 
                      onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                      className="w-full flex items-center justify-between px-6 py-4 text-left focus:outline-none"
                    >
                      <span className="font-bold text-[15px] text-slate-900">{faq.q}</span>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${faqOpen === idx ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`px-6 overflow-hidden transition-all duration-300 ${faqOpen === idx ? 'max-h-[200px] pb-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <p className="text-slate-500 text-[14px] leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN - 35% (STICKY) */}
          <div className="w-full lg:w-[35%]">
            <div className="sticky top-24 bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              
              <div className="flex flex-col items-center justify-center text-center mb-8">
                {oldPrice && (
                  <div className="text-slate-400 text-[18px] font-bold line-through decoration-2 decoration-slate-300/50 mb-1">
                    {oldPrice} FCFA
                  </div>
                )}
                <div className="text-[36px] font-black text-[#E11D48] tracking-tight leading-none">
                  {product.price} FCFA
                </div>
              </div>

              <button 
                onClick={() => alert("Le module de paiement n'est pas encore configuré.")}
                className="w-full bg-[#034694] hover:bg-[#02336D] text-white font-bold text-[16px] py-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] mb-8"
              >
                Profiter de l'offre
              </button>


              <div className="border-t border-slate-100 pt-6 mb-6">
                <p className="text-center text-[11px] font-semibold tracking-widest uppercase text-slate-400 mb-4">Moyens de paiement acceptés</p>
                <div className="grid grid-cols-5 gap-2">
                  {/* MTN MoMo */}
                  <div className="flex flex-col items-center justify-center rounded-xl py-2 px-1 bg-[#FFCD00] border border-[#E6B800] shadow-sm hover:shadow-md transition-shadow cursor-default" title="MTN Mobile Money">
                    <span className="font-black text-[11px] text-black leading-tight tracking-tight">MTN</span>
                    <span className="font-bold text-[7px] text-black/70 leading-none mt-0.5">MoMo</span>
                  </div>
                  {/* MOOV Money */}
                  <div className="flex flex-col items-center justify-center rounded-xl py-2 px-1 bg-gradient-to-br from-[#F97316] to-[#EA580C] border border-orange-400 shadow-sm hover:shadow-md transition-shadow cursor-default" title="MOOV Money">
                    <span className="font-black text-[11px] text-white leading-tight tracking-tight">MOOV</span>
                    <span className="font-bold text-[7px] text-white/80 leading-none mt-0.5">Money</span>
                  </div>
                  {/* VISA */}
                  <div className="flex flex-col items-center justify-center rounded-xl py-2 px-1 bg-[#1A1F71] border border-[#151961] shadow-sm hover:shadow-md transition-shadow cursor-default" title="VISA">
                    <span className="font-black italic text-[13px] text-white leading-none tracking-tight">VISA</span>
                  </div>
                  {/* Mastercard */}
                  <div className="flex flex-col items-center justify-center rounded-xl py-2 px-1 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-default" title="Mastercard">
                    <div className="flex -space-x-1.5">
                      <div className="w-4 h-4 rounded-full bg-[#EB001B] opacity-90"></div>
                      <div className="w-4 h-4 rounded-full bg-[#F79E1B] opacity-90"></div>
                    </div>
                    <span className="font-semibold text-[6px] text-slate-600 leading-none mt-0.5 tracking-tight">mastercard</span>
                  </div>
                  {/* M-PESA */}
                  <div className="flex flex-col items-center justify-center rounded-xl py-2 px-1 bg-gradient-to-br from-[#00A651] to-[#007A3D] border border-green-600 shadow-sm hover:shadow-md transition-shadow cursor-default" title="M-PESA">
                    <span className="font-black text-[9px] text-white leading-tight tracking-tight">M-PESA</span>
                  </div>
                </div>
                {/* Secure badge */}
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                  <span className="text-[10px] font-medium text-slate-400">Paiements 100% sécurisés et cryptés</span>
                </div>
              </div>


              <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-100 text-[12px] font-medium text-slate-600">
                <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                  <Share2 className="w-3.5 h-3.5" /> Partager
                </button>
                <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                  <HelpCircle className="w-3.5 h-3.5" /> Contact
                </button>
                <button className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
                  <AlertTriangle className="w-3.5 h-3.5" /> Signaler
                </button>
              </div>

              <div className="mt-4 text-center">
                <button className="text-[12px] font-semibold text-slate-500 hover:text-slate-800 underline decoration-slate-300 underline-offset-4 transition-colors">
                  Comment acheter ?
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
