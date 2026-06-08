import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Header, Footer } from '@/components/site/shared';
import { motion } from 'framer-motion';
import {
  Download, BookOpen, Key, Package, ShoppingBag, Share2,
  MessageCircle, Flag, ShieldCheck, Zap, Headphones,
  CheckCircle2, Clock, Lock, Loader2, ChevronDown, Users, ArrowLeft,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/product/$id')({
  component: ProductPage,
});

const BRAND_COLOR = '#034694';

const typeIcons: Record<string, React.ReactNode> = {
  fichier:   <Download className="h-4 w-4" />,
  formation: <BookOpen className="h-4 w-4" />,
  licence:   <Key className="h-4 w-4" />,
  bundle:    <Package className="h-4 w-4" />,
};
const typeLabels: Record<string, string> = {
  fichier:   'Téléchargeable',
  formation: 'Formation en ligne',
  licence:   'Licence',
  bundle:    'Bundle',
};

function ProductPage() {
  const { id } = Route.useParams();
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

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
    },
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié !');
    }
  };

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleBuy = async () => {
    try {
      setIsCheckingOut(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Veuillez vous connecter pour acheter.');
        window.location.href = '/login';
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        window.location.href = '/login';
        return;
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          productId: id,
          userId: user.id,
          email: user.email,
          firstName: user.user_metadata?.full_name?.split(' ')[0] || '',
          lastName: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || ''
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de paiement');
      
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création du paiement');
    } finally {
      setIsCheckingOut(false);
    }
  };

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: BRAND_COLOR }} />
        </div>
      </div>
    );
  }

  /* ── Not found ── */
  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <Package className="h-16 w-16 text-gray-200 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Produit introuvable</h1>
          <p className="text-gray-500 mb-6">Ce produit n'existe plus ou a été retiré.</p>
          <Link to="/" className="px-6 py-3 rounded-xl text-white text-sm font-bold" style={{ backgroundColor: BRAND_COLOR }}>
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  /* ── Parse features ── */
  let features: any = {};
  try { features = typeof product.features === 'string' ? JSON.parse(product.features) : (product.features || {}); } catch (_) {}

  const productType = features.type || 'fichier';
  const oldPrice: number | null = product.crossed_price ? Number(product.crossed_price) : null;
  const currentPrice = Number(product.price);
  const discount = oldPrice && oldPrice > currentPrice
    ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100) : null;
  const salesCount = product.sales_count || 0;

  const faqs = features.faqs as { q: string; a: string }[] | undefined;

  const included = [
    productType === 'formation' ? 'Accès à vie aux modules de la formation' :
    productType === 'licence'   ? 'Clé de licence unique livrée par email' :
    'Téléchargement immédiat après paiement',
    'Mises à jour gratuites à vie',
    'Support direct de notre équipe',
    'Accès depuis votre espace « Mes achats »',
  ];

  const schemaData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.title,
    "image": product.image_url || "https://technovalearning.com/og-image.png",
    "description": product.description ? product.description.replace(/<[^>]*>?/gm, '').substring(0, 300) : `Achetez ${product.title} sur Technova Learning`,
    "sku": product.id,
    "offers": {
      "@type": "Offer",
      "url": `https://technovalearning.com/product/${product.id}`,
      "priceCurrency": "XOF",
      "price": currentPrice,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Technova Learning"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": salesCount > 0 ? salesCount + 15 : 24
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/40 flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      <Header />

      <main className="flex-1 pt-16 pb-24 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">

          {/* Breadcrumb */}
          <Link to="/formations"
            className="mb-4 sm:mb-6 inline-flex items-center gap-2 text-xs sm:text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Retour aux formations
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10 mt-2">

            {/* ──────────────── LEFT COLUMN ──────────────── */}
            <div className="lg:col-span-3 space-y-6">

              {/* Hero image */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="relative rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.title}
                    className="w-full h-auto object-contain" />
                ) : (
                  <div className="w-full aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <Package className="h-20 w-20 text-gray-300" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {salesCount >= 10 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
                      🔥 Bestseller
                    </span>
                  )}
                  {discount && (
                    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow-md"
                      style={{ backgroundColor: BRAND_COLOR }}>
                      -{discount}%
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Mobile title block */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }} className="lg:hidden">
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-700">
                    {typeIcons[productType]} {typeLabels[productType] || productType}
                  </span>
                  {salesCount > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {salesCount} ventes
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">{product.title}</h1>
                <div className="mt-3 flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl font-extrabold" style={{ color: BRAND_COLOR }}>
                    {currentPrice.toLocaleString()} FCFA
                  </span>
                  {oldPrice && oldPrice > currentPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      {oldPrice.toLocaleString()} FCFA
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Trust strip */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { icon: Zap,        label: 'Livraison instantanée', sub: 'Accès immédiat' },
                  { icon: ShieldCheck, label: 'Paiement sécurisé',    sub: '100% protégé' },
                  { icon: Headphones, label: 'Support inclus',        sub: 'Réponse rapide' },
                ].map((t) => (
                  <div key={t.label} className="rounded-xl border border-gray-100 bg-white p-2.5 sm:p-3 text-center">
                    <t.icon className="mx-auto h-4 w-4 sm:h-5 sm:w-5 mb-1" style={{ color: BRAND_COLOR }} />
                    <div className="text-[10px] sm:text-xs font-semibold text-gray-900 leading-tight">{t.label}</div>
                    <div className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5 hidden sm:block">{t.sub}</div>
                  </div>
                ))}
              </div>

              {/* Description */}
              {product.description && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-7">
                  <h2 className="mb-4 text-lg font-bold text-gray-900">À propos de ce produit</h2>
                  <div
                    dangerouslySetInnerHTML={{ __html: product.description }}
                    className="prose prose-sm max-w-none leading-relaxed text-gray-700 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:text-gray-900 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:text-gray-900 [&_p]:mb-4 [&_p]:text-gray-600 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_li]:mb-1 [&_li]:text-gray-600 [&_a]:underline [&_img]:rounded-lg [&_img]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-500"
                  />
                </motion.div>
              )}

              {/* What's included */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-7">
                <h2 className="mb-4 text-lg font-bold text-gray-900">Ce qui est inclus</h2>
                <ul className="space-y-3">
                  {included.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: BRAND_COLOR }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* FAQ */}
              {faqs && faqs.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-7">
                  <h2 className="mb-4 text-lg font-bold text-gray-900">Questions fréquentes</h2>
                  <div className="space-y-2">
                    {faqs.map((faq, idx) => (
                      <div key={idx} className="rounded-xl border border-gray-100 bg-gray-50/60 overflow-hidden">
                        <button onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                          className="w-full flex items-center justify-between px-4 py-4 text-left">
                          <span className="text-sm font-medium text-gray-900">{faq.q}</span>
                          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${faqOpen === idx ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`px-4 overflow-hidden transition-all duration-200 ${faqOpen === idx ? 'max-h-[300px] pb-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                          <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Default FAQ if no custom ones */}
              {(!faqs || faqs.length === 0) && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-7">
                  <h2 className="mb-4 text-lg font-bold text-gray-900">Questions fréquentes</h2>
                  <div className="space-y-2">
                    {[
                      { q: 'Comment vais-je recevoir mon produit ?', a: 'Une fois le paiement validé, vous recevrez immédiatement un accès depuis votre espace « Mes achats » et par e-mail.' },
                      { q: 'Quels sont les moyens de paiement acceptés ?', a: 'Nous acceptons MTN Mobile Money, MOOV Money, M-PESA ainsi que les cartes bancaires Visa et Mastercard.' },
                      { q: 'Puis-je obtenir un remboursement ?', a: 'Nos produits numériques étant livrés instantanément, ils ne sont généralement pas remboursables. Contactez notre support pour tout cas exceptionnel.' },
                    ].map((faq, idx) => (
                      <div key={idx} className="rounded-xl border border-gray-100 bg-gray-50/60 overflow-hidden">
                        <button onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                          className="w-full flex items-center justify-between px-4 py-4 text-left">
                          <span className="text-sm font-medium text-gray-900">{faq.q}</span>
                          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${faqOpen === idx ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`px-4 overflow-hidden transition-all duration-200 ${faqOpen === idx ? 'max-h-[300px] pb-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                          <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

            </div>

            {/* ──────────────── RIGHT COLUMN ──────────────── */}
            <div className="lg:col-span-2">

              {/* Desktop title block */}
              <div className="hidden lg:block mb-5">
                <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-700">
                    {typeIcons[productType]} {typeLabels[productType] || productType}
                  </span>
                  {salesCount > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {salesCount} ventes
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{product.title}</h1>
              </div>

              {/* Sticky purchase card */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="lg:sticky lg:top-20 rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 space-y-5 shadow-sm">

                {/* Price */}
                <div>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-3xl sm:text-4xl font-extrabold" style={{ color: BRAND_COLOR }}>
                      {currentPrice.toLocaleString()} FCFA
                    </span>
                    {oldPrice && oldPrice > currentPrice && (
                      <span className="text-base text-gray-400 line-through">
                        {oldPrice.toLocaleString()}
                      </span>
                    )}
                    {discount && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                        Économisez {discount}%
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Paiement unique • Pas d'abonnement
                  </p>
                </div>

                {/* CTA */}
                <button
                  onClick={handleBuy}
                  disabled={isCheckingOut}
                  className="w-full text-base font-bold py-4 rounded-xl text-white transition-all hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
                  style={{ backgroundColor: BRAND_COLOR, boxShadow: `0 8px 24px -8px ${BRAND_COLOR}80` }}>
                  {isCheckingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Acheter maintenant'}
                </button>

                {/* Quick benefits */}
                <ul className="space-y-2 text-xs text-gray-600">
                  <li className="flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5" style={{ color: BRAND_COLOR }} />
                    Livré instantanément après paiement
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5" style={{ color: BRAND_COLOR }} />
                    Transaction 100% sécurisée
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" style={{ color: BRAND_COLOR }} />
                    Accès à vie depuis « Mes achats »
                  </li>
                </ul>

                <hr className="border-gray-100" />

                {/* Payment methods */}
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">Moyens de paiement</p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {/* MTN MoMo */}
                    <div className="flex flex-col items-center justify-center rounded-lg py-1.5 px-1 bg-[#FFCD00] border border-[#E6B800]" title="MTN Mobile Money">
                      <span className="font-black text-[10px] text-black leading-tight">MTN</span>
                      <span className="font-bold text-[7px] text-black/60 leading-none">MoMo</span>
                    </div>
                    {/* MOOV Money */}
                    <div className="flex flex-col items-center justify-center rounded-lg py-1.5 px-1 bg-gradient-to-br from-[#F97316] to-[#EA580C] border border-orange-400" title="MOOV Money">
                      <span className="font-black text-[9px] text-white leading-tight">MOOV</span>
                    </div>
                    {/* VISA */}
                    <div className="flex flex-col items-center justify-center rounded-lg py-1.5 px-1 bg-[#1A1F71]" title="VISA">
                      <span className="font-black italic text-[11px] text-white leading-none">VISA</span>
                    </div>
                    {/* Mastercard */}
                    <div className="flex flex-col items-center justify-center rounded-lg py-1.5 px-1 bg-white border border-slate-200" title="Mastercard">
                      <div className="flex -space-x-1">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#EB001B] opacity-90"></div>
                        <div className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] opacity-90"></div>
                      </div>
                    </div>
                    {/* M-PESA */}
                    <div className="flex flex-col items-center justify-center rounded-lg py-1.5 px-1 bg-gradient-to-br from-[#00A651] to-[#007A3D]" title="M-PESA">
                      <span className="font-black text-[8px] text-white leading-tight">M-PESA</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <svg className="w-3 h-3 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                    </svg>
                    <span className="text-[10px] text-gray-400">Paiements 100% sécurisés et cryptés</span>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Social actions */}
                <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
                  <button onClick={handleShare} className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
                    <Share2 className="h-3.5 w-3.5" /> Partager
                  </button>
                  <a href="mailto:contact@technovalearning.com" className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
                    <MessageCircle className="h-3.5 w-3.5" /> Contact
                  </a>
                  <button className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
                    <Flag className="h-3.5 w-3.5" /> Signaler
                  </button>
                </div>

              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Mobile sticky bottom bar ── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-md px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)]">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-gray-400 uppercase tracking-wide">Prix</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold truncate" style={{ color: BRAND_COLOR }}>
                {currentPrice.toLocaleString()} FCFA
              </span>
              {discount && (
                <span className="text-[10px] font-bold text-emerald-600">-{discount}%</span>
              )}
            </div>
          </div>
          <button
            onClick={handleBuy}
            disabled={isCheckingOut}
            className="flex-shrink-0 px-6 py-3 rounded-xl text-white text-sm font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
            style={{ backgroundColor: BRAND_COLOR, boxShadow: `0 6px 20px -6px ${BRAND_COLOR}` }}>
            {isCheckingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Acheter'}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
