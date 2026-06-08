import { createFileRoute, Link } from '@tanstack/react-router';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { 
  ArrowLeft, Package, GraduationCap, Download, Play, 
  FileText, Star, Loader2, ChevronRight, Check, X
} from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/mes-achats/$orderId')({
  component: OrderDetail,
});

function OrderDetail() {
  const { orderId } = Route.useParams();
  const [session, setSession] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [store, setStore] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Content Modal
  const [showContentModal, setShowContentModal] = useState(false);
  const [lessons, setLessons] = useState<any[]>([]);
  const [activeLesson, setActiveLesson] = useState<any>(null);

  // Review
  const [review, setReview] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState<'positive'|'negative'|null>(null);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [savingReview, setSavingReview] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem('buyer_session');
    if (!s) return;
    const parsed = JSON.parse(s);
    setSession(parsed);
    loadOrderDetails(parsed.email, parsed.customerName);
  }, [orderId]);

  const loadOrderDetails = async (customerEmail: string, customerName: string) => {
    setLoading(true);
    
    // 1. Fetch order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('customer_email', customerEmail)
      .single();

    if (orderError || !orderData) {
      setLoading(false);
      return;
    }
    setOrder(orderData);

      // 2. Fetch product & store
      const { data: prodData } = await supabase.from('products').select('*').eq('id', orderData.product_id).single();
      const productData = prodData;
      setProduct(productData);
      
      // We don't have store_owner_id on orders anymore, so just set store to null or fetch admin
      setStore({ store_name: 'Technova' });
  
      // 3. Fetch lessons if course
      const productType = typeof productData.features === 'string' ? JSON.parse(productData.features).type : productData.features?.type;
      if (productType === 'course') {
        const { data: lessData } = await supabase
          .from('course_lessons')
          .select('*')
          .eq('product_id', productData.id)
          .order('position');
        setLessons(lessData || []);
        if (lessData && lessData.length > 0) setActiveLesson(lessData[0]);
      }
  
      // 4. Skip product_reviews since the table doesn't exist yet
      setReview(null);
  
      // 5. Fetch recommendations (same store, different product)
      const { data: recData } = await supabase
        .from('products')
        .select('id, title, type, image_url, price, features')
        .neq('id', orderData.product_id)
        .limit(4);
      
      setRecommendations(recData || []);
      setLoading(false);
  };

  const saveReview = async () => {
    if (!reviewRating || !reviewComment) return toast.error('Veuillez donner une note et un commentaire');
    
    setSavingReview(true);
    try {
      const reviewData = {
        product_id: product.id,
        customer_id: session.customerId,
        reviewer_name: session.customerName || session.email.split('@')[0],
        sentiment: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
        is_public: true
      };

      if (review) {
        // Update
        await supabase.from('product_reviews').update(reviewData).eq('id', review.id);
        toast.success('Avis modifié !');
      } else {
        // Insert
        const { data } = await supabase.from('product_reviews').insert(reviewData).select().single();
        setReview(data);
        toast.success('Avis publié !');
      }
    } catch (err: any) {
      toast.error('Erreur: ' + err.message);
    } finally {
      setSavingReview(false);
    }
  };

  const getEmbedUrl = (lesson: any) => {
    if (!lesson || !lesson.video_url) return '';
    if (lesson.video_type === 'youtube') {
       const id = lesson.video_url.split('v=')[1] || lesson.video_url.split('/').pop();
       return `https://www.youtube.com/embed/${id}`;
    }
    if (lesson.video_type === 'vimeo') {
       const id = lesson.video_url.split('/').pop();
       return `https://player.vimeo.com/video/${id}`;
    }
    return lesson.video_url; // Direct upload URL
  };

  if (!session) return null;
  if (loading) return <div className="text-center py-20 text-slate-500">Chargement de la commande...</div>;
  if (!order || !product) return <div className="text-center py-20">Commande introuvable</div>;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/mes-achats" className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
           <h1 className="text-[20px] font-bold text-slate-900">{product.title}</h1>
           <p className="text-[13px] text-slate-500">Commande du {new Date(order.created_at).toLocaleDateString('fr-FR')} • {store?.store_name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Content & Review */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Card */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
             <div className="aspect-[16/9] bg-slate-100 relative">
               {product.image_url ? (
                 <img src={product.image_url} alt="" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-300">
                    {(typeof product.features === 'string' ? JSON.parse(product.features).type : product.features?.type) === 'course' ? <GraduationCap className="w-20 h-20" /> : <Package className="w-20 h-20" />}
                 </div>
               )}
             </div>
             <div className="p-6 md:p-8 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-slate-200 bg-slate-50/50">
               <div>
                 <h2 className="text-[18px] font-bold text-slate-900">Accédez à votre contenu</h2>
                 <p className="text-[13px] text-slate-500 mt-1">Vous avez un accès à vie à ce produit.</p>
               </div>
               
               {(() => {
                 const pType = typeof product.features === 'string' ? JSON.parse(product.features).type : product.features?.type;
                 const pFileUrl = typeof product.features === 'string' ? JSON.parse(product.features).file_url : product.features?.file_url;
                 return pType === 'file' && pFileUrl ? (
                  <a
                    href={pFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white text-[15px] font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-sm w-full sm:w-auto justify-center"
                  >
                    <Download className="w-5 h-5" />
                    Télécharger
                  </a>
               ) : (
                  <button
                    onClick={() => setShowContentModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#1E293B] text-white text-[15px] font-bold rounded-xl hover:bg-[#0F172A] transition-colors shadow-sm w-full sm:w-auto justify-center"
                  >
                    <Play className="w-5 h-5" />
                    Accéder à la formation
                  </button>
               )
               })()}
             </div>
          </div>

          {/* Review Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8">
             <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                 <Star className="w-5 h-5 text-amber-600" />
               </div>
               <div>
                 <h3 className="text-[18px] font-bold text-slate-900">Votre avis sur ce produit</h3>
                 <p className="text-[13px] text-slate-500">Aidez les autres acheteurs en partageant votre expérience.</p>
               </div>
             </div>

             <div className="space-y-5">
                <div className="flex gap-3">
                  <button 
                    onClick={() => setReviewRating('positive')}
                    className={`flex-1 py-3 border-2 rounded-xl text-[14px] font-bold transition-colors ${reviewRating === 'positive' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                  >
                    Super 👍
                  </button>
                  <button 
                    onClick={() => setReviewRating('negative')}
                    className={`flex-1 py-3 border-2 rounded-xl text-[14px] font-bold transition-colors ${reviewRating === 'negative' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                  >
                    Pas super 👎
                  </button>
                </div>

                <div>
                   <input
                     value={reviewTitle}
                     onChange={e => setReviewTitle(e.target.value)}
                     placeholder="Titre de votre avis (optionnel)"
                     className="w-full h-11 px-4 text-[14px] bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#1E293B]"
                   />
                </div>
                <div>
                   <textarea
                     value={reviewComment}
                     onChange={e => setReviewComment(e.target.value)}
                     placeholder="Dites-nous ce que vous avez pensé de ce produit..."
                     className="w-full p-4 text-[14px] bg-white border border-slate-200 rounded-xl min-h-[120px] resize-y focus:outline-none focus:border-[#1E293B]"
                   />
                </div>

                <div className="flex justify-end">
                   <button
                     onClick={saveReview}
                     disabled={savingReview || !reviewRating || !reviewComment}
                     className="px-6 py-2.5 bg-[#1E293B] text-white text-[14px] font-bold rounded-xl hover:bg-[#0F172A] disabled:opacity-50 transition-colors"
                   >
                     {savingReview ? 'Enregistrement...' : (review ? 'Modifier mon avis' : 'Publier mon avis')}
                   </button>
                </div>
             </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Recap & Recs */}
        <div className="space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
             <h3 className="text-[16px] font-bold text-slate-900 mb-4">Récapitulatif</h3>
             <div className="space-y-3">
               <div className="flex justify-between text-[14px]">
                 <span className="text-slate-500">Date</span>
                 <span className="font-semibold text-slate-900">{new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
               </div>
               <div className="flex justify-between text-[14px]">
                 <span className="text-slate-500">Email</span>
                 <span className="font-semibold text-slate-900">{session.email}</span>
               </div>
               <div className="flex justify-between text-[14px] pt-3 border-t border-slate-100">
                 <span className="text-slate-500 font-medium">Total payé</span>
                 <span className="font-bold text-slate-900 text-[16px]">
                   {order.amount > 0 ? `${order.amount} FCFA` : 'Gratuit'}
                 </span>
               </div>
             </div>
             
             <button 
               onClick={() => toast.info('La génération de facture sera bientôt disponible.')}
               className="w-full mt-6 py-2.5 border border-slate-200 rounded-xl text-[14px] font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2"
             >
               <FileText className="w-4 h-4" /> Facture PDF
             </button>
          </div>

          {recommendations.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
               <h3 className="text-[16px] font-bold text-slate-900 mb-4">Du même vendeur</h3>
               <div className="space-y-3">
                  {recommendations.map(rec => {
                    const recType = typeof rec.features === 'string' ? JSON.parse(rec.features).type : rec.features?.type;
                    return (
                    <div key={rec.id} className="flex items-center gap-3 group cursor-pointer" onClick={() => window.open(`/product/${rec.id}`, '_blank')}>
                       <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                         {rec.image_url ? <img src={rec.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><Package className="w-5 h-5"/></div>}
                       </div>
                       <div className="flex-1 min-w-0">
                         <p className="text-[13px] font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{rec.title}</p>
                         <p className="text-[11px] text-slate-500 uppercase font-semibold">{recType === 'course' ? 'Formation' : 'Fichier'}</p>
                       </div>
                    </div>
                  )})}
               </div>
            </div>
          )}

        </div>

      </div>

      {/* CONTENT MODAL (FOR COURSES) */}
      {showContentModal && (typeof product.features === 'string' ? JSON.parse(product.features).type : product.features?.type) === 'course' && (
        <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col md:flex-row">
          {/* Main Video Area */}
          <div className="flex-1 bg-black flex flex-col">
            <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
               <h2 className="text-white font-bold text-[15px] truncate pr-4">{product.title}</h2>
               <button onClick={() => setShowContentModal(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                 <X className="w-4 h-4" />
               </button>
            </div>
            <div className="flex-1 flex items-center justify-center relative">
               {activeLesson ? (
                 activeLesson.video_type === 'text' ? (
                   <div className="max-w-3xl w-full p-8 text-white">
                     <h3 className="text-2xl font-bold mb-6">{activeLesson.title}</h3>
                     <p className="text-slate-300 text-lg">Cette leçon est au format texte. Le contenu sera affiché ici.</p>
                   </div>
                 ) : (
                   <iframe
                     src={getEmbedUrl(activeLesson)}
                     className="w-full h-full max-h-full"
                     frameBorder="0"
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                     allowFullScreen
                   ></iframe>
                 )
               ) : (
                 <div className="text-white">Aucune leçon disponible</div>
               )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-80 bg-[#1E293B] border-l border-white/10 flex flex-col shrink-0">
             <div className="p-4 border-b border-white/10">
               <h3 className="text-white font-bold text-[16px]">Contenu du cours</h3>
               <p className="text-slate-400 text-[13px]">{lessons.length} leçons</p>
             </div>
             <div className="flex-1 overflow-y-auto">
               {lessons.map((lesson, idx) => (
                 <button
                   key={lesson.id}
                   onClick={() => setActiveLesson(lesson)}
                   className={`w-full flex items-start gap-3 p-4 text-left transition-colors border-b border-white/5 ${activeLesson?.id === lesson.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
                 >
                   <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 ${activeLesson?.id === lesson.id ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                     {idx + 1}
                   </div>
                   <div>
                     <p className={`text-[14px] font-medium leading-tight ${activeLesson?.id === lesson.id ? 'text-white' : 'text-slate-300'}`}>
                       {lesson.title}
                     </p>
                     {lesson.duration_minutes > 0 && (
                       <p className="text-[12px] text-slate-500 mt-1 flex items-center gap-1">
                         <Play className="w-3 h-3" /> {lesson.duration_minutes} min
                       </p>
                     )}
                   </div>
                 </button>
               ))}
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
