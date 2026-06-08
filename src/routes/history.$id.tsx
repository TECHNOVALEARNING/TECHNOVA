import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, FileText, Download, Eye, Star, MessageCircle, Gift, LogOut, LayoutGrid 
} from 'lucide-react';
import siteLogo from '@/assets/logo.png';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/history/$id')({
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      });
    }
    return { session };
  },
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const { session } = Route.useRouteContext();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: '/' });
  };

  const userInitials = session?.user?.email?.substring(0, 2).toUpperCase() || 'AA';

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Chargement...</div>;
  }

  if (!product) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Produit introuvable</div>;
  }

  const orderId = `CMD-${product.id.split('-')[0].toUpperCase()}`;
  const dateStr = new Date(product.created_at).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' });

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans text-slate-900 pb-20">
      {/* Top Navigation - Chariow Style */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10 px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-black text-xl text-blue-600 tracking-tight">
          <img src={siteLogo} alt="Logo" className="h-6 w-auto object-contain" />
          TECHNOVA
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors">
            Accueil
          </Link>
          <Link to="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors">
            Achats
          </Link>
          <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors">
            Découvrir
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors" title="Se déconnecter">
            <LogOut className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm border border-slate-200">
            {userInitials}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium bg-white border border-slate-200 px-4 py-2 rounded-full mb-8 shadow-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <div className="mb-8">
          <div className="text-slate-500 text-sm mb-2 flex items-center gap-2">
            Commande #{orderId}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            {product.title}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {(() => {
              let type = 'fichier';
              let chapters: any[] = [];
              try {
                const feats = typeof product.features === 'string' ? JSON.parse(product.features) : product.features;
                if (feats?.type) type = feats.type;
                if (feats?.chapters && Array.isArray(feats.chapters)) chapters = feats.chapters;
              } catch(e) {}

              // Extract all lessons across all chapters into a flat list for the player
              const allLessons: any[] = [];
              chapters.forEach((chapter, chapterIndex) => {
                (chapter.lessons || []).forEach((lesson: any) => {
                   allLessons.push({
                     ...lesson,
                     chapterTitle: chapter.title,
                     chapterIndex
                   });
                });
              });

              if (type === 'formation' || chapters.length > 0) {
                const activeModule = allLessons[activeModuleIndex] || null;
                return (
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col md:flex-row h-[500px]">
                    {/* Video Area */}
                    <div className="flex-1 bg-black relative flex flex-col">
                      {activeModule ? (
                        activeModule.type === 'Vidéo' ? (
                          <iframe 
                            src={activeModule.url} 
                            title={activeModule.title}
                            className="w-full h-full border-0 flex-1"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        ) : activeModule.type === 'Audio' ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 flex-1 px-8">
                            <audio controls src={activeModule.url} className="w-full max-w-md" />
                            <div className="mt-4 text-white font-medium">{activeModule.title}</div>
                          </div>
                        ) : activeModule.type === 'Texte' ? (
                          <div className="w-full h-full bg-white flex-1 p-8 overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-4">{activeModule.title}</h2>
                            <p className="text-slate-600 mb-6">{activeModule.description}</p>
                            {activeModule.url && (
                              <a href={activeModule.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">
                                Télécharger le document
                              </a>
                            )}
                          </div>
                        ) : null
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-100 flex-1">
                          Aucune leçon disponible
                        </div>
                      )}
                      {activeModule && activeModule.type !== 'Texte' && (
                        <div className="p-4 bg-white border-t border-slate-200">
                          <h2 className="text-xl font-bold text-slate-900">{activeModule.title}</h2>
                          <p className="text-sm text-slate-500 mt-1">{activeModule.description}</p>
                        </div>
                      )}
                    </div>

                    {/* Playlist Sidebar */}
                    <div className="w-full md:w-80 bg-slate-50 border-l border-slate-200 flex flex-col h-full overflow-y-auto">
                      <div className="p-4 bg-white border-b border-slate-200 sticky top-0 z-10">
                        <h3 className="font-bold text-slate-900">Contenu du cours</h3>
                        <p className="text-sm text-slate-500">{chapters.length} chapitre{chapters.length > 1 ? 's' : ''}</p>
                      </div>
                      <div className="space-y-1">
                        {chapters.map((chapter, cIdx) => (
                          <div key={cIdx} className="border-b border-slate-200 last:border-0">
                            <div className="px-4 py-3 bg-slate-100 font-semibold text-sm text-slate-800">
                              {chapter.title}
                            </div>
                            <div className="p-2 space-y-1">
                              {chapter.lessons?.map((lesson: any, lIdx: number) => {
                                // Find global index
                                const globalIndex = allLessons.findIndex(l => l.id === lesson.id);
                                const isActive = activeModuleIndex === globalIndex;
                                return (
                                  <button 
                                    key={lesson.id || lIdx}
                                    onClick={() => setActiveModuleIndex(globalIndex)}
                                    className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition-colors ${isActive ? 'bg-blue-50 border border-blue-100 text-blue-700' : 'hover:bg-slate-100 text-slate-700'}`}
                                  >
                                    <PlayCircle className={`w-5 h-5 mt-0.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                                    <div className="flex-1">
                                      <div className="font-medium text-sm line-clamp-2">{lesson.title}</div>
                                    </div>
                                  </button>
                                );
                              })}
                              {(!chapter.lessons || chapter.lessons.length === 0) && (
                                <div className="px-4 py-2 text-xs text-slate-400">Aucune leçon</div>
                              )}
                            </div>
                          </div>
                        ))}
                        {chapters.length === 0 && (
                          <div className="p-4 text-sm text-slate-500 text-center">Aucun contenu ajouté.</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <>
                  {/* Fichiers Section */}
                  <div>
                    <h2 className="text-lg font-semibold mb-4 text-slate-700">Fichiers</h2>
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">Accès {product.title}</h3>
                          <p className="text-sm text-slate-500">PDF - Accès immédiat</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors">
                          <Eye className="w-4 h-4" />
                          Aperçu
                        </button>
                        <a href={product.file_url || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors">
                          <Download className="w-4 h-4" />
                          Télécharger
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Instructions Section */}
                  <div>
                    <h2 className="text-lg font-semibold mb-4 text-slate-700">Instructions</h2>
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm prose prose-slate max-w-none prose-a:text-blue-600 prose-headings:font-bold">
                      <div dangerouslySetInnerHTML={{ __html: product.description }} />
                    </div>
                  </div>
                </>
              );
            })()}

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Boutique */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-slate-700">Boutique</h2>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center overflow-hidden">
                  <img src={siteLogo} alt="TECHNOVA" className="w-8 h-8 object-contain" />
                </div>
                <span className="font-bold text-lg">TECHNOVA</span>
              </div>
            </div>

            {/* Order Details */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-slate-700">Détails de la commande</h2>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex gap-4 mb-6">
                  <img src={product.image_url} alt={product.title} className="w-16 h-16 rounded-xl object-cover bg-slate-100" />
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug mb-1">{product.title}</h3>
                    <p className="text-xs text-slate-500">{dateStr}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between py-4 border-t border-slate-100 mb-6">
                  <span className="font-semibold text-slate-700">Total</span>
                  <span className="font-bold text-lg text-slate-900">
                    {product.price > 0 ? `${product.price.toLocaleString('fr-FR')} FCFA` : 'Gratuit'}
                  </span>
                </div>

                <button className="w-full bg-[#1c222b] hover:bg-black text-white font-medium py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mb-3">
                  <Star className="w-4 h-4" />
                  Noter le produit
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 px-3 py-3 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    Contacter le vendeur
                  </button>
                  <button className="flex items-center justify-center gap-2 px-3 py-3 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors">
                    <Gift className="w-4 h-4" />
                    Envoyer en cadeau
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
