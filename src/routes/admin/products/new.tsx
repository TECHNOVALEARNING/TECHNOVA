import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { adminSupabase, supabase } from '@/lib/supabase';
import { RichTextEditor } from '@/components/RichTextEditor';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { 
  FileText, GraduationCap, Check, ArrowLeft, Upload, 
  Image as ImageIcon, Package, Loader2, Sparkles, Video, 
  BookOpen, Layers, Shield, Plus, Trash2, X 
} from 'lucide-react';

export const Route = createFileRoute('/admin/products/new')({
  component: NewProduct,
  validateSearch: (search: Record<string, unknown>) => {
    let t = search.type as string;
    if (t === 'fichier') t = 'file';
    if (t === 'formation') t = 'course';
    return {
      type: t as ProductType | undefined,
    };
  },
});

type ProductType = 'file' | 'course' | 'license';

interface Lesson {
  title: string;
  video_type: 'youtube' | 'vimeo' | 'upload' | 'text';
  video_url: string;
  duration_minutes: number;
  file?: File;
}

function NewProduct() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null));
  }, []);

  const { type } = Route.useSearch();
  
  useEffect(() => {
    if (!type) {
      navigate({ to: '/admin/products/create' });
    }
  }, [type, navigate]);

  // Product type
  const [selectedType, setSelectedType] = useState<ProductType | null>(type || 'file');

  // Step 1 - Details

  // Step 2 - Details
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [pricingModel, setPricingModel] = useState('one_time');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');

  // Step 2 - Description
  const [description, setDescription] = useState('');
  const [aiRewriting, setAiRewriting] = useState(false);

  // Step 3 - Images
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Step 4 - Content
  const [downloadFile, setDownloadFile] = useState<File | null>(null);
  const [courseContentType, setCourseContentType] = useState('mixed');
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const priceNum = pricingModel === 'free' ? 0 : parseFloat(price) || 0;
  const originalPriceNum = pricingModel === 'free' ? 0 : parseFloat(originalPrice) || 0;
  const priceError = pricingModel === 'one_time' && priceNum < 100 ? "Le prix minimum est de 100 FCFA" : "";
  const originalPriceError = pricingModel === 'one_time' && originalPrice && originalPriceNum > 0 && originalPriceNum <= priceNum
    ? "Le prix barré doit être strictement supérieur au prix de vente" : "";

  const canNext = () => {
    switch (step) {
      case 1: return !!title.trim() && (pricingModel === 'free' || (priceNum >= 100 && !priceError && !originalPriceError));
      case 2: return !!description.replace(/<[^>]*>/g, '').trim();
      case 3: return true;
      case 4:
        if (selectedType === 'file') return !!downloadFile;
        if (selectedType === 'course') return lessons.length > 0;
        return true;
      default: return false;
    }
  };

  const rewriteDescription = async () => {
    if (!title.trim()) { toast.error('Entrez d\'abord un titre'); return; }
    setAiRewriting(true);
    try {
      const { data, error } = await adminSupabase.functions.invoke('rewrite-description', {
        body: { title, description, productType: selectedType },
      });
      if (error) throw error;
      if (data?.description) {
        setDescription(data.description);
        toast.success('Description réécrite par l\'IA !');
      }
    } catch (err: any) {
      toast.error('Erreur IA: ' + (err.message || 'Réessayez'));
    } finally {
      setAiRewriting(false);
    }
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    if (!userId) return null;
    const ext = file.name.split('.').pop();
    const path = `${folder}/${userId}/${Date.now()}.${ext}`;
    const { error } = await adminSupabase.storage.from('product-assets').upload(path, file);
    if (error) { toast.error('Erreur upload: ' + error.message); return null; }
    const { data } = adminSupabase.storage.from('product-assets').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!userId) {
      toast.error('Erreur: Impossible de vous identifier. Veuillez vous reconnecter.');
      return;
    }
    setSaving(true);
    try {
      let thumbnailUrl = null;
      let downloadUrl = null;

      if (thumbnailFile) thumbnailUrl = await uploadFile(thumbnailFile, 'thumbnails');
      if (bannerFile) await uploadFile(bannerFile, 'banners'); // Or store bannerUrl if you added the column
      if (downloadFile) downloadUrl = await uploadFile(downloadFile, 'downloads');

      const productData = {
        title: title.trim(),
        description: description.trim() || null,
        category: category || null,
        pricing_model: pricingModel, // make sure we save the pricing model if needed by schema, but let's just save price=0 for free.
        price: priceNum,
        original_price: originalPriceNum > 0 ? originalPriceNum : null,
        type: selectedType,
        thumbnail_url: thumbnailUrl,
        download_url: downloadUrl,
        creator_id: userId,
        is_published: true, // Auto publish for now
      };

      const { data: product, error } = await adminSupabase.from('products').insert(productData).select().single();
      if (error) throw error;

      if (selectedType === 'course' && lessons.length > 0) {
        const toInsert = [];
        for (let i = 0; i < lessons.length; i++) {
          const lesson = lessons[i];
          let videoUrl = lesson.video_url;
          if (lesson.video_type === 'upload' && lesson.file) {
            const uploaded = await uploadFile(lesson.file, 'course-videos');
            if (uploaded) videoUrl = uploaded;
          }
          toInsert.push({
            product_id: product.id,
            title: lesson.title || `Leçon ${i + 1}`,
            video_url: videoUrl || null,
            video_type: lesson.video_type,
            duration_minutes: lesson.duration_minutes,
            position: i,
          });
        }
        if (toInsert.length > 0) {
            await adminSupabase.from('course_lessons').insert(toInsert);
        }
      }

      // Moderation Edge Function invocation
      try {
        await adminSupabase.functions.invoke('analyze-product-moderation', {
          body: { productId: product.id },
        });
      } catch (modErr) {
        console.warn('Moderation error:', modErr);
      }

      toast.success('Produit créé avec succès !');
      navigate({ to: '/admin/products' });

    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  };

  const addLesson = () => {
    setLessons([...lessons, {
      title: '',
      video_type: 'youtube',
      video_url: '',
      duration_minutes: 0,
    }]);
  };

  const updateLesson = (index: number, field: string, value: any) => {
    const updated = [...lessons];
    (updated[index] as any)[field] = value;
    setLessons(updated);
  };

  const removeLesson = (index: number) => {
    setLessons(lessons.filter((_, i) => i !== index));
  };


  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header & Progress */}
      <div className="bg-white border-b border-slate-200 py-4 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-2 flex-1 rounded-full ${i <= step ? 'bg-[#1E293B]' : 'bg-slate-100'}`} />
            ))}
          </div>
          <button onClick={() => navigate({ to: '/admin/products/create' })} className="text-[13px] text-slate-500 hover:text-slate-900 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Retour aux choix du produit
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          
          {step === 1 && (
            <div className="space-y-6">
              <h1 className="text-[24px] font-bold text-slate-900 mb-8">Détails du produit</h1>
              
              <div>
                <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">Nom du produit <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="flex-1 h-11 px-3 text-[14px] border border-slate-200 rounded-xl focus:outline-none focus:border-[#1E293B]"
                  />
                  <button
                    onClick={rewriteDescription}
                    disabled={aiRewriting || !title.trim()}
                    className="w-11 h-11 flex items-center justify-center border border-slate-200 rounded-xl hover:bg-amber-50"
                  >
                    {aiRewriting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-500" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">Catégorie</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full h-11 px-3 text-[14px] border border-slate-200 rounded-xl focus:outline-none focus:border-[#1E293B]"
                >
                  <option value="">Sélectionner une catégorie</option>
                  <option value="marketing">Marketing Digital</option>
                  <option value="design">Design & Créativité</option>
                  <option value="dev">Développement</option>
                  <option value="business">Business & Finance</option>
                  <option value="education">Éducation</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">Modèle de tarification</label>
                <select
                  value={pricingModel}
                  onChange={e => setPricingModel(e.target.value)}
                  className="w-full h-11 px-3 text-[14px] border border-slate-200 rounded-xl focus:outline-none focus:border-[#1E293B]"
                >
                  <option value="one_time">Paiement unique</option>
                  <option value="free">Gratuit</option>
                </select>
              </div>

              {pricingModel === 'one_time' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">Prix (FCFA) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      className="w-full h-11 px-3 text-[14px] border border-slate-200 rounded-xl focus:outline-none focus:border-[#1E293B]"
                      placeholder="Min 100"
                    />
                    {priceError && <p className="text-[11px] text-red-500 mt-1">{priceError}</p>}
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">Prix barré (FCFA)</label>
                    <input
                      type="number"
                      value={originalPrice}
                      onChange={e => setOriginalPrice(e.target.value)}
                      className="w-full h-11 px-3 text-[14px] border border-slate-200 rounded-xl focus:outline-none focus:border-[#1E293B]"
                    />
                    {originalPriceError && <p className="text-[11px] text-red-500 mt-1">{originalPriceError}</p>}
                  </div>
                </div>
              )}

            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <RichTextEditor value={description} onChange={setDescription} label="Décrivez votre produit" withAI={true} productTitle={title} productType={selectedType || 'fichier'} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <h1 className="text-[24px] font-bold text-slate-900 mb-6">Personnaliser la page produit</h1>
              
              <div>
                <label className="block text-[13px] font-semibold text-slate-800 mb-3">Vignette (carrée)</label>
                <div
                  className="w-48 h-48 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-[#1E293B] overflow-hidden"
                  onClick={() => document.getElementById('thumb-upload')?.click()}
                >
                  {thumbnailPreview ? (
                    <img src={thumbnailPreview} alt="thumb" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-slate-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-[12px]">Min 600×600px</p>
                    </div>
                  )}
                  <input
                    id="thumb-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setThumbnailFile(f);
                        const r = new FileReader();
                        r.onload = ev => setThumbnailPreview(ev.target?.result as string);
                        r.readAsDataURL(f);
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-800 mb-3">Bannière (optionnel)</label>
                <div
                  className="w-full h-48 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-[#1E293B] overflow-hidden"
                  onClick={() => document.getElementById('banner-upload')?.click()}
                >
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-slate-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-[12px]">1200×400px recommandé</p>
                    </div>
                  )}
                  <input
                    id="banner-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setBannerFile(f);
                        const r = new FileReader();
                        r.onload = ev => setBannerPreview(ev.target?.result as string);
                        r.readAsDataURL(f);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h1 className="text-[24px] font-bold text-slate-900 mb-6">Contenu du produit</h1>

              {selectedType === 'file' && (
                <div className="space-y-6">
                  <div
                    className="w-full p-12 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#1E293B]"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-amber-600" />
                    </div>
                    <p className="text-[14px] font-bold text-slate-900 mb-1">
                      {downloadFile ? 'Remplacer le fichier' : 'Cliquez pour uploader'}
                    </p>
                    <p className="text-[13px] text-slate-500 text-center">
                      Tous les formats : PDF, ZIP, MP3, MP4, etc.<br/>Taille max 500 MB
                    </p>
                    {downloadFile && (
                      <p className="mt-4 text-[13px] font-bold text-[#1E293B]">📎 {downloadFile.name}</p>
                    )}
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={e => setDownloadFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-800 rounded-lg text-[13px] font-medium">
                    <Shield className="w-5 h-5 text-amber-600" />
                    Téléchargement sécurisé avec liens temporaires
                  </div>
                </div>
              )}

              {selectedType === 'course' && (
                <div className="space-y-8">
                  <div>
                    <label className="block text-[13px] font-semibold text-slate-800 mb-3">Type de contenu</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'video', label: 'Vidéo', icon: Video },
                        { value: 'text', label: 'Texte', icon: BookOpen },
                        { value: 'mixed', label: 'Mixte', icon: Layers },
                      ].map(ct => (
                        <button
                          key={ct.value}
                          onClick={() => setCourseContentType(ct.value)}
                          className={`p-4 rounded-xl border-2 text-center ${courseContentType === ct.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}
                        >
                          <ct.icon className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                          <p className="text-[13px] font-semibold text-slate-900">{ct.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[13px] font-semibold text-slate-800">Leçons</label>
                    {lessons.map((lesson, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                        <div className="flex gap-2">
                          <input
                            value={lesson.title}
                            onChange={e => updateLesson(idx, 'title', e.target.value)}
                            placeholder="Titre de la leçon"
                            className="flex-1 h-10 px-3 text-[13px] border border-slate-200 rounded-lg"
                          />
                          <button onClick={() => removeLesson(idx)} className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <select
                            value={lesson.video_type}
                            onChange={e => updateLesson(idx, 'video_type', e.target.value)}
                            className="w-1/3 h-10 px-3 text-[13px] border border-slate-200 rounded-lg"
                          >
                            <option value="youtube">YouTube</option>
                            <option value="vimeo">Vimeo</option>
                            <option value="upload">Upload vidéo</option>
                            <option value="text">Texte</option>
                          </select>
                          {lesson.video_type !== 'text' && lesson.video_type !== 'upload' && (
                            <input
                              value={lesson.video_url}
                              onChange={e => updateLesson(idx, 'video_url', e.target.value)}
                              placeholder="URL vidéo"
                              className="flex-1 h-10 px-3 text-[13px] border border-slate-200 rounded-lg"
                            />
                          )}
                          {lesson.video_type === 'upload' && (
                             <div className="flex-1">
                                <input
                                  type="file"
                                  accept="video/*"
                                  onChange={e => updateLesson(idx, 'file', e.target.files?.[0])}
                                  className="w-full text-[13px]"
                                />
                             </div>
                          )}
                          <input
                            type="number"
                            value={lesson.duration_minutes || ''}
                            onChange={e => updateLesson(idx, 'duration_minutes', parseInt(e.target.value) || 0)}
                            placeholder="Min"
                            className="w-20 h-10 px-3 text-[13px] border border-slate-200 rounded-lg"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addLesson}
                      className="w-full py-3 border-2 border-dashed border-slate-300 text-slate-500 text-[13px] font-medium rounded-xl flex items-center justify-center gap-2 hover:border-[#1E293B] hover:text-[#1E293B]"
                    >
                      <Plus className="w-4 h-4" /> Ajouter une leçon
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Footer / Actions */}
      <div className="bg-white border-t border-slate-200 p-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            className={`px-6 py-2.5 text-[14px] font-medium rounded-xl text-slate-700 hover:bg-slate-100 ${step === 1 ? 'invisible' : ''}`}
          >
            Retour
          </button>

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="px-6 py-2.5 bg-[#1E293B] text-white text-[14px] font-bold rounded-xl hover:bg-[#0F172A] disabled:opacity-50"
            >
              Continuer
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canNext() || saving}
              className="px-6 py-2.5 bg-blue-600 text-white text-[14px] font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin"/> Publication...</> : 'Publier le produit'}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
