import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Header, Footer } from '@/components/site/shared';
import { CheckCircle2, Download, Package, GraduationCap, ChevronRight, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const Route = createFileRoute('/success')({
  component: SuccessPage,
});

function SuccessPage() {
  const navigate = useNavigate();
  const search = Route.useSearch() as { purchaseId?: string };
  const purchaseId = search.purchaseId;
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    if (!purchaseId) {
      setLoading(false);
      return;
    }
    loadOrderDetails();
  }, [purchaseId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', purchaseId)
        .single();

      if (orderError || !orderData) throw new Error("Commande introuvable");
      setOrder(orderData);

      // Fetch product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', orderData.product_id)
        .single();
        
      if (productError || !productData) throw new Error("Produit introuvable");
      setProduct(productData);

    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du chargement de la commande');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderFiles = () => {
    if (!product) return null;
    const features = typeof product.features === 'string' ? JSON.parse(product.features) : (product.features || {});
    const fileUrls = features.file_urls || (features.file_url ? [features.file_url] : []);
    
    if (fileUrls.length === 0 && features.type !== 'course') {
      return (
        <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-100 text-slate-500 text-sm">
          Aucun fichier disponible pour ce produit.
        </div>
      );
    }

    if (features.type === 'course') {
      return (
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
             </div>
             <div>
               <p className="font-semibold text-slate-900 text-sm">Accès Formation</p>
               <p className="text-xs text-slate-500">Modules et leçons</p>
             </div>
          </div>
          <Link 
            to={`/mes-achats/${order.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm shrink-0"
          >
            Accéder
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {fileUrls.map((url: string, idx: number) => {
          const fileName = url.split('/').pop() || `Fichier ${idx + 1}`;
          return (
            <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                 <div className="w-10 h-10 bg-slate-200 text-slate-600 rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                 </div>
                 <div className="min-w-0">
                   <p className="font-semibold text-slate-900 text-sm truncate">{fileName}</p>
                   <p className="text-xs text-slate-500">Document téléchargeable</p>
                 </div>
              </div>
              <a 
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm shrink-0"
              >
                <Download className="w-4 h-4" />
                Télécharger
              </a>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-start p-4 pt-12 pb-24">
        {loading ? (
          <div className="mt-20 flex flex-col items-center justify-center text-slate-500">
            <div className="w-8 h-8 border-4 border-[#034694] border-t-transparent rounded-full animate-spin mb-4"></div>
            Chargement de votre commande...
          </div>
        ) : !purchaseId || !order || !product ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-md w-full text-center mt-20"
          >
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Paiement réussi !</h1>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Félicitations pour votre achat. Votre transaction a bien été validée et votre produit est maintenant débloqué.
            </p>
            <Link 
              to="/mes-achats"
              className="w-full text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg"
              style={{ backgroundColor: '#034694', boxShadow: '0 8px 24px -8px rgba(3, 70, 148, 0.5)' }}
            >
              Accéder au portail client
              <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl w-full"
          >
            {/* Header Success */}
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👏</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Achat confirmé</h1>
              <p className="text-slate-500 text-lg">Merci pour votre commande !</p>
              <p className="text-sm font-medium text-slate-400 mt-2">
                Commande : <span className="text-slate-700">{order.id}</span>
              </p>
            </div>

            {/* Product & Files Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                  {(() => {
                     const feats = typeof product.features === 'string' ? JSON.parse(product.features) : (product.features || {});
                     return feats.type === 'course' ? <GraduationCap className="w-6 h-6" /> : <Package className="w-6 h-6" />;
                  })()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{product.title}</h2>
                  <p className="text-sm text-slate-500">
                    {(() => {
                      const feats = typeof product.features === 'string' ? JSON.parse(product.features) : (product.features || {});
                      const count = feats.file_urls?.length || (feats.file_url ? 1 : 0);
                      if (feats.type === 'course') return "Formation complète";
                      return `${count} fichier${count > 1 ? 's' : ''} disponible${count > 1 ? 's' : ''}`;
                    })()}
                  </p>
                </div>
              </div>

              {renderFiles()}

              <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-center text-sm text-slate-500 mb-4">Retrouvez votre achat sur le portail client</p>
                <Link 
                  to="/mes-achats"
                  className="w-full text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md"
                  style={{ backgroundColor: '#034694' }}
                >
                  Accéder au portail client
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Order Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                Détails de la commande
              </h3>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500">Sous-total</span>
                  <span className="font-medium text-slate-900">{order.amount} FCFA</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-900 font-bold">Total payé</span>
                  <span className="font-bold text-[#034694]">{order.amount} FCFA</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500">Date</span>
                  <span className="font-medium text-slate-900">{formatDate(order.created_at)}</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
                  <Download className="w-4 h-4" />
                  Télécharger la facture
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
}
