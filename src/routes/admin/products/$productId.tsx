import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { 
  ChevronLeft, LayoutDashboard, DollarSign, Folder, FileText, 
  Image as ImageIcon, HelpCircle, Search as SearchIcon, Settings,
  Eye, Plus, ChevronUp, ChevronDown, MoreHorizontal, Video, Headphones,
  AlignLeft, PlayCircle, Loader2, List, ListOrdered
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { adminSupabase } from '@/lib/supabase';

// Define the search params type
type ProductSearch = {
  tab?: string;
};

export const Route = createFileRoute('/admin/products/$productId')({
  component: EditProduct,
  validateSearch: (search: Record<string, unknown>): ProductSearch => {
    return {
      tab: search.tab as string | undefined,
    };
  },
});

function EditProduct() {
  const { productId } = Route.useParams();
  const searchParams = Route.useSearch();
  const activeTab = searchParams.tab || 'informations';
  const navigate = useNavigate();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Lesson Panel State
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [showAddLesson, setShowAddLesson] = useState(false);

  // Lesson Form State
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [lessonType, setLessonType] = useState('Vidéo');
  const [lessonUrl, setLessonUrl] = useState('');
  const [lessonContent, setLessonContent] = useState('');

  // Chapter Modal State
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');

  // Product Fields State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [crossedPrice, setCrossedPrice] = useState('');
  const [pricingModel, setPricingModel] = useState('Paiement unique');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await adminSupabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      
      if (data) {
        setProduct(data);
        setTitle(data.title || '');
        setCategory(data.category || '');
        setPrice(data.price?.toString() || '');
        setDescription(data.description || '');
        setImageUrl(data.image_url || '');
        try {
           const feats = typeof data.features === 'string' ? JSON.parse(data.features) : (data.features || {});
           if (feats.pricing_model) setPricingModel(feats.pricing_model);
           if (feats.crossed_price) setCrossedPrice(feats.crossed_price.toString());
        } catch(e) {}
      }
      setLoading(false);
    };
    fetchProduct();
  }, [productId]);

  const handleSaveProduct = async () => {
    setSaving(true);
    try {
      const features = typeof product.features === 'string' ? JSON.parse(product.features) : (product.features || {});
      const updatedFeatures = { 
        ...features, 
        pricing_model: pricingModel, 
        crossed_price: crossedPrice ? parseInt(crossedPrice) : null 
      };
      
      const updateData = {
         title,
         category,
         price: price ? parseInt(price) : 0,
         description,
         image_url: imageUrl,
         features: JSON.stringify(updatedFeatures)
      };

      const { error } = await adminSupabase
        .from('products')
        .update(updateData)
        .eq('id', product.id);

      if (error) throw error;
      setProduct({ ...product, ...updateData, features: JSON.stringify(updatedFeatures) });
      alert('Produit mis à jour avec succès !');
    } catch(err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveChapters = async (newChapters: any[]) => {
    setSaving(true);
    try {
      const features = typeof product.features === 'string' ? JSON.parse(product.features) : (product.features || {});
      const updatedFeatures = { ...features, chapters: newChapters };
      
      const { error } = await adminSupabase
        .from('products')
        .update({ features: JSON.stringify(updatedFeatures) })
        .eq('id', product.id);

      if (error) throw error;
      setProduct({ ...product, features: JSON.stringify(updatedFeatures) });
    } catch(err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleAddChapter = () => {
    if (!newChapterTitle) return;
    const features = typeof product.features === 'string' ? JSON.parse(product.features) : (product.features || {});
    const existingChapters = features.chapters || [];
    
    const newChapter = {
      id: Math.random().toString(36).substring(2, 9),
      title: newChapterTitle,
      status: 'active',
      lessons: []
    };
    handleSaveChapters([...existingChapters, newChapter]);
    setShowAddChapter(false);
    setNewChapterTitle('');
  };

  const handleAddLesson = () => {
    if (!lessonTitle) {
       alert("Le titre est requis");
       return;
    }
    const features = typeof product.features === 'string' ? JSON.parse(product.features) : (product.features || {});
    const existingChapters = features.chapters || [];
    
    const newLesson = {
      id: Math.random().toString(36).substring(2, 9),
      title: lessonTitle,
      description: lessonDesc,
      type: lessonType,
      url: lessonUrl,
      content: lessonContent
    };

    const updatedChapters = existingChapters.map((c: any) => {
      if (c.id === selectedChapter.id) {
        return { ...c, lessons: [...(c.lessons || []), newLesson] };
      }
      return c;
    });

    handleSaveChapters(updatedChapters);
    setSelectedChapter(updatedChapters.find((c: any) => c.id === selectedChapter.id));
    
    setShowAddLesson(false);
    setLessonTitle('');
    setLessonDesc('');
    setLessonType('Vidéo');
    setLessonUrl('');
    setLessonContent('');
  };

  const tabs = [
    { id: 'informations', label: 'Informations', icon: LayoutDashboard },
    { id: 'tarification', label: 'Tarification', icon: DollarSign },
    { id: 'course', label: 'Contenu du cours', icon: Folder },
    { id: 'fichiers', label: 'Fichiers', icon: FileText },
    { id: 'description', label: 'Description', icon: AlignLeft },
    { id: 'design', label: 'Visuel & Design', icon: ImageIcon },
    { id: 'faq', label: 'Questions fréquentes', icon: HelpCircle },
    { id: 'seo', label: 'SEO', icon: SearchIcon },
    { id: 'avance', label: 'Avancé', icon: Settings },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  if (!product) {
    return <div className="p-8 text-center text-slate-500">Produit introuvable</div>;
  }

  const features = typeof product.features === 'string' ? JSON.parse(product.features) : (product.features || {});
  const chapters = features.chapters || [];

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      {/* Top Navigation */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <button 
          onClick={() => navigate({ to: '/admin/products' })}
          className="flex items-center gap-2 text-[14px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Mettre à jour le produit
        </button>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors">
            <Eye className="w-4 h-4" /> Voir
          </button>
          <button onClick={handleSaveProduct} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-lg text-[13px] transition-colors shadow-sm disabled:opacity-50">
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <button className="flex items-center gap-1 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors">
            Plus <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          
          <div className="max-w-[1000px] mx-auto flex gap-12">
            
            {/* Sidebar Tabs */}
            <div className="w-[240px] shrink-0">
              <div className="flex items-center gap-2 mb-8 px-4">
                <h1 className="text-[20px] font-bold text-slate-900 truncate">{product.title}</h1>
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
              </div>

              <div className="flex flex-col gap-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => navigate({ to: `/admin/products/${productId}`, search: { tab: tab.id } })}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                        isActive 
                          ? 'bg-slate-900 text-white' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 pt-2 pb-24">
              
              {activeTab === 'informations' && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                  <h2 className="text-[18px] font-bold text-slate-900 mb-6">Informations générales</h2>
                  <div className="space-y-6 max-w-2xl">
                    <div>
                      <label className="block text-[13px] font-medium text-[#111827] mb-1.5">Nom du produit <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full bg-white border border-[#D1D5DB] rounded-md px-3 py-2 text-[14px] text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-[#111827] mb-1.5">Catégorie <span className="text-red-500">*</span></label>
                      <select 
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full bg-white border border-[#D1D5DB] rounded-md px-3 py-2 text-[14px] text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                      >
                        <option value="Éducation & Apprentissage">Éducation & Apprentissage</option>
                        <option value="Marketing Digital">Marketing Digital</option>
                        <option value="Tech & Programmation">Tech & Programmation</option>
                        <option value="Business & Entrepreneuriat">Business & Entrepreneuriat</option>
                        <option value="Design">Design</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tarification' && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                  <h2 className="text-[18px] font-bold text-slate-900 mb-6">Tarification</h2>
                  <div className="space-y-6 max-w-2xl">
                    <div>
                      <label className="block text-[13px] font-medium text-[#111827] mb-1.5">Modèle de tarification <span className="text-red-500">*</span></label>
                      <select 
                        value={pricingModel}
                        onChange={e => setPricingModel(e.target.value)}
                        className="w-full bg-white border border-[#D1D5DB] rounded-md px-3 py-2 text-[14px] text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                      >
                        <option value="Paiement unique">Paiement unique</option>
                        <option value="Abonnement mensuel">Abonnement mensuel</option>
                        <option value="Abonnement annuel">Abonnement annuel</option>
                        <option value="Gratuit">Gratuit</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[13px] font-medium text-[#111827] mb-1.5">Prix</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            className="w-full bg-white border border-[#D1D5DB] rounded-md pl-3 pr-12 py-2 text-[14px] text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-slate-400">FCFA</div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[13px] font-medium text-[#111827] mb-1.5">Prix promotionnel</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={crossedPrice}
                            onChange={e => setCrossedPrice(e.target.value)}
                            className="w-full bg-white border border-[#D1D5DB] rounded-md pl-3 pr-12 py-2 text-[14px] text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-slate-400">FCFA</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'description' && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[18px] font-bold text-slate-900">Description du produit</h2>
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden max-w-4xl bg-white shadow-sm">
                    <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center gap-3 overflow-x-auto">
                      <select onChange={(e) => document.execCommand('formatBlock', false, e.target.value)} className="bg-transparent text-[13px] font-medium outline-none">
                        <option value="P">Normal</option>
                        <option value="H1">Titre 1</option>
                        <option value="H2">Titre 2</option>
                        <option value="H3">Titre 3</option>
                      </select>
                      <div className="w-px h-4 bg-slate-300"></div>
                      <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('bold', false); }} className="font-serif font-bold text-[14px] px-1 hover:text-blue-600">B</button>
                      <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('italic', false); }} className="font-serif italic text-[14px] px-1 hover:text-blue-600">I</button>
                      <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('underline', false); }} className="underline text-[14px] px-1 hover:text-blue-600">U</button>
                      <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('strikeThrough', false); }} className="line-through text-[14px] px-1 hover:text-blue-600">S</button>
                      <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('insertUnorderedList', false); }} className="text-[14px] px-1 hover:text-blue-600"><List className="w-4 h-4" /></button>
                      <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('insertOrderedList', false); }} className="text-[14px] px-1 hover:text-blue-600"><ListOrdered className="w-4 h-4" /></button>
                    </div>
                    <div 
                      contentEditable
                      onBlur={(e) => setDescription(e.currentTarget.innerHTML)}
                      dangerouslySetInnerHTML={{ __html: description }}
                      className="w-full p-4 h-64 outline-none text-[14px] bg-white overflow-y-auto"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'visuel' && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                  <h2 className="text-[18px] font-bold text-slate-900 mb-6">Visuel & Design</h2>
                  <div className="max-w-2xl">
                    <label className="block text-[13px] font-medium text-[#111827] mb-1.5">Image de couverture</label>
                    {imageUrl && imageUrl !== 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800' ? (
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 mb-4 h-64 group bg-slate-100 flex items-center justify-center">
                        <img src={imageUrl} alt="Cover" className="max-h-full object-contain" />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button onClick={() => setImageUrl('')} className="bg-white text-red-600 px-4 py-2 rounded-lg text-[13px] font-bold">Supprimer l'image</button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-[#D1D5DB] rounded-xl bg-[#F9FAFB] flex flex-col items-center justify-center py-12 px-6 text-center hover:bg-slate-50 transition-colors cursor-pointer mb-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                        <h3 className="text-[15px] font-bold text-slate-900 mb-1">Téléverser une image</h3>
                        <p className="text-[13px] text-slate-500 max-w-[250px]">
                          JPG, PNG, GIF. Taille max 5MB. Ratio recommandé 16:9.
                        </p>
                      </div>
                    )}
                    <label className="block text-[13px] font-medium text-[#111827] mb-1.5">URL de l'image (alternative)</label>
                    <input 
                      type="text" 
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                      placeholder="https://"
                      className="w-full bg-white border border-[#D1D5DB] rounded-md px-3 py-2 text-[14px] text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'course' && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-[18px] font-bold text-slate-900">Contenu du cours</h2>
                    <button onClick={() => setShowAddChapter(true)} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-[13px] transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Ajouter un chapitre
                    </button>
                  </div>

                  {chapters.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 text-[12px] font-semibold text-slate-500 mb-4">
                      <div className="flex items-center gap-4 flex-1">
                        <span className="w-8">#</span>
                        <span>Titre</span>
                      </div>
                      <div className="flex items-center gap-12 pr-[140px]">
                        <span>Statut</span>
                        <span>Actions</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {chapters.length === 0 && (
                       <div className="text-center py-10 text-slate-500 text-[14px]">Aucun chapitre.</div>
                    )}
                    {chapters.map((chapter: any, index: number) => (
                      <div 
                        key={chapter.id} 
                        onClick={() => setSelectedChapter(chapter)}
                        className={`flex items-center justify-between px-4 py-3 bg-white border rounded-xl shadow-sm hover:border-slate-300 transition-colors cursor-pointer ${selectedChapter?.id === chapter.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'}`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <span className="w-8 text-[13px] text-slate-400 font-medium">{(index + 1).toString().padStart(2, '0')}</span>
                          <div className="flex items-center gap-3">
                            <Folder className="w-4 h-4 text-slate-700" />
                            <span className="text-[14px] font-bold text-slate-900 uppercase">{chapter.title}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-8">
                          <button className={`w-11 h-6 rounded-full flex items-center transition-colors px-1 ${chapter.status === 'active' ? 'bg-slate-900' : 'bg-slate-200'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${chapter.status === 'active' ? 'translate-x-5' : 'translate-x-0'}`}></div>
                          </button>
                          
                          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
                              <ChevronUp className="w-4 h-4 text-slate-600" />
                            </button>
                            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
                              <ChevronDown className="w-4 h-4 text-slate-600" />
                            </button>
                            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
                              <MoreHorizontal className="w-4 h-4 text-slate-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'fichiers' && (
                <div className="flex items-center justify-center h-64 text-slate-400 text-[14px]">
                  Fichiers: téléversez vos documents ici.
                </div>
              )}
              {activeTab === 'faq' && (
                <div className="flex items-center justify-center h-64 text-slate-400 text-[14px]">
                  Module de Questions fréquentes en cours de développement
                </div>
              )}
              {activeTab === 'seo' && (
                <div className="flex items-center justify-center h-64 text-slate-400 text-[14px]">
                  Paramètres SEO en cours de développement
                </div>
              )}
              {activeTab === 'avance' && (
                <div className="flex items-center justify-center h-64 text-slate-400 text-[14px]">
                  Paramètres avancés en cours de développement
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Slide-over panel for Lessons */}
        {selectedChapter && (
          <>
            {/* Backdrop for mobile or just separation */}
            <div className="fixed inset-0 bg-slate-900/20 z-40 block xl:hidden" onClick={() => setSelectedChapter(null)} />
            
            {/* The Panel */}
            <div className="w-[500px] shrink-0 bg-white border-l border-slate-200 flex flex-col z-50 h-[calc(100vh-65px)] animate-in slide-in-from-right duration-300 shadow-2xl">
              
              {!showAddLesson ? (
                // State: Empty / List of lessons
                <div className="flex flex-col h-full">
                  <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
                    <button onClick={() => setSelectedChapter(null)} className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                      <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <h3 className="text-[15px] font-bold text-slate-900 uppercase">{selectedChapter.title}</h3>
                    <button 
                      onClick={() => setShowAddLesson(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-[13px] transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Ajouter une leçon
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                      <PlayCircle className="w-8 h-8 text-slate-600" />
                    </div>
                    
                    {(!selectedChapter.lessons || selectedChapter.lessons.length === 0) ? (
                      <>
                        <h3 className="text-[20px] font-bold text-slate-900 mb-2">Créez votre première leçon</h3>
                        <p className="text-slate-500 text-[14px] mb-8 max-w-[300px]">
                          Ajoutez des vidéos, textes ou fichiers pour enrichir ce chapitre.
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-[20px] font-bold text-slate-900 mb-2">{selectedChapter.lessons.length} leçon(s) dans ce chapitre</h3>
                        <p className="text-slate-500 text-[14px] mb-8 max-w-[300px]">
                          Continuez à ajouter du contenu ou modifiez l'existant.
                        </p>
                        
                        <div className="w-full text-left mb-8 space-y-2">
                          {selectedChapter.lessons.map((lesson: any, i: number) => (
                            <div key={lesson.id} className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {lesson.type === 'Vidéo' && <Video className="w-4 h-4 text-blue-600" />}
                                {lesson.type === 'Audio' && <Headphones className="w-4 h-4 text-purple-600" />}
                                {lesson.type === 'Texte' && <FileText className="w-4 h-4 text-emerald-600" />}
                                <span className="text-[14px] font-medium text-slate-900">{lesson.title}</span>
                              </div>
                              <button className="text-slate-400 hover:text-slate-600">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setShowAddLesson(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg text-[14px] transition-colors flex items-center gap-2 shadow-sm"
                      >
                        <Plus className="w-4 h-4" /> Ajouter une leçon
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // State: Add Lesson Form
                <div className="flex flex-col h-full">
                  <div className="px-6 py-4 flex items-center gap-3 border-b border-slate-100">
                    <button onClick={() => setShowAddLesson(false)} className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                      <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <h3 className="text-[15px] font-bold text-slate-900">Ajouter une leçon</h3>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div>
                      <label className="block text-[13px] font-medium text-slate-900 mb-1.5">Titre <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={lessonTitle}
                        onChange={(e) => setLessonTitle(e.target.value)}
                        className="w-full bg-white border border-[#D1D5DB] rounded-md px-3 py-2 text-[14px] text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium text-slate-900 mb-1.5">Description <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <textarea 
                          value={lessonDesc}
                          onChange={(e) => {
                            if (e.target.value.length <= 160) {
                              setLessonDesc(e.target.value);
                            }
                          }}
                          rows={3}
                          className="w-full bg-white border border-[#D1D5DB] rounded-md px-3 py-2 text-[14px] text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm resize-none"
                        />
                        <div className="absolute bottom-2 right-2 text-[11px] font-medium text-emerald-500">
                          {lessonDesc.length}/160
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium text-slate-900 mb-3">Type de contenu</label>
                      <div className="grid grid-cols-3 gap-3">
                        <button 
                          onClick={() => setLessonType('Vidéo')}
                          className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-[13px] font-semibold transition-colors ${lessonType === 'Vidéo' ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                        >
                          {lessonType === 'Vidéo' && <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center mr-1"><div className="w-1.5 h-1.5 bg-white rounded-full"></div></div>}
                          <Video className="w-4 h-4" /> Vidéo
                        </button>
                        <button 
                          onClick={() => setLessonType('Audio')}
                          className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-[13px] font-semibold transition-colors ${lessonType === 'Audio' ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                        >
                          <Headphones className="w-4 h-4" /> Audio
                        </button>
                        <button 
                          onClick={() => setLessonType('Texte')}
                          className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-[13px] font-semibold transition-colors ${lessonType === 'Texte' ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                        >
                          <FileText className="w-4 h-4" /> Texte
                        </button>
                      </div>
                    </div>

                    {lessonType === 'Vidéo' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[13px] font-medium text-slate-900 mb-1.5">Méthode d'intégration</label>
                          <select className="w-full bg-white border border-[#D1D5DB] rounded-md px-3 py-2.5 text-[14px] text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm appearance-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em' }}>
                            <option>URL de la vidéo</option>
                            <option>Code d'intégration</option>
                            <option>Téléverser</option>
                          </select>
                        </div>
                        
                        <div className="bg-[#FFFBEB] border border-[#FEF3C7] text-[#D97706] px-4 py-2 rounded-lg text-[13px] flex gap-2 items-center">
                          <span className="font-bold border border-[#D97706] rounded-full w-4 h-4 flex items-center justify-center text-[10px]">!</span> YouTube, Vimeo, etc.
                        </div>

                        <div>
                          <label className="block text-[13px] font-medium text-slate-900 mb-1.5">URL de la vidéo <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            value={lessonUrl}
                            onChange={(e) => setLessonUrl(e.target.value)}
                            className="w-full bg-white border border-[#D1D5DB] rounded-md px-3 py-2 text-[14px] text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[13px] font-medium text-slate-900 mb-1.5">Contenu de la leçon</label>
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center gap-3 overflow-x-auto">
                          <select onChange={(e) => document.execCommand('formatBlock', false, e.target.value)} className="bg-transparent text-[13px] font-medium outline-none">
                            <option value="P">Normal</option>
                            <option value="H1">Titre 1</option>
                            <option value="H2">Titre 2</option>
                            <option value="H3">Titre 3</option>
                          </select>
                          <div className="w-px h-4 bg-slate-300"></div>
                          <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('bold', false); }} className="font-serif font-bold text-[14px] px-1 hover:text-blue-600">B</button>
                          <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('italic', false); }} className="font-serif italic text-[14px] px-1 hover:text-blue-600">I</button>
                          <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('underline', false); }} className="underline text-[14px] px-1 hover:text-blue-600">U</button>
                          <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('strikeThrough', false); }} className="line-through text-[14px] px-1 hover:text-blue-600">S</button>
                          <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('insertUnorderedList', false); }} className="text-[14px] px-1 hover:text-blue-600"><List className="w-4 h-4" /></button>
                          <div className="w-px h-4 bg-slate-300"></div>
                          <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('justifyLeft', false); }} className="text-[14px] px-1 hover:text-blue-600"><AlignLeft className="w-4 h-4" /></button>
                        </div>
                        <div 
                          contentEditable
                          onBlur={(e) => setLessonContent(e.currentTarget.innerHTML)}
                          dangerouslySetInnerHTML={{ __html: lessonContent }}
                          className="w-full p-3 h-32 outline-none resize-y text-[14px] bg-white overflow-y-auto"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-slate-100 flex justify-end">
                    <button onClick={handleAddLesson} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-[13px] transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Ajouter une leçon
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

      </div>

      {showAddChapter && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-[18px] font-bold text-slate-900 mb-4">Nouveau chapitre</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-slate-900 mb-1.5">Titre du chapitre <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={newChapterTitle}
                    onChange={(e) => setNewChapterTitle(e.target.value)}
                    placeholder="Ex: Introduction au design"
                    className="w-full bg-white border border-[#D1D5DB] rounded-md px-3 py-2 text-[14px] text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button 
                onClick={() => { setShowAddChapter(false); setNewChapterTitle(''); }}
                className="px-4 py-2 text-[13px] font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleAddChapter}
                disabled={!newChapterTitle || saving}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg text-[13px] transition-colors shadow-sm disabled:opacity-50"
              >
                Créer le chapitre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
