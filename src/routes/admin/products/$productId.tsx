import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  ArrowLeft, Eye, EyeOff, Save, Loader2,
  FileText, DollarSign, Upload, AlignLeft, Image as ImageIcon,
  HelpCircle, Search as SearchIcon, Settings, Package, Lock,
  Fingerprint, BarChart3, MapPin, Sparkles, Plus, Trash2, Globe,
  GraduationCap, ShoppingCart, Check, X, Video, BookOpen, Layers,
  MoreVertical, Link2, Folder
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { adminSupabase } from '@/lib/supabase';
import { RichTextEditor } from '@/components/RichTextEditor';
import { toast } from 'sonner';

type TabKey = 'informations' | 'tarification' | 'fichiers' | 'description' | 'visuel' | 'faq' | 'seo' | 'cours';

export const Route = createFileRoute('/admin/products/$productId')({
  component: EditProduct,
});

// ─── Toggle Row Component ─────────────────────────────────────────────────────
const ToggleRow = ({
  title, description, enabled, onToggle, children,
}: {
  title: string; description: string; enabled: boolean;
  onToggle: (v: boolean) => void; children?: React.ReactNode;
}) => (
  <div className="py-4 border-b border-slate-100 last:border-0">
    <div className="flex items-start gap-3">
      <button
        type="button"
        onClick={() => onToggle(!enabled)}
        className={`mt-0.5 w-11 h-6 rounded-full flex items-center transition-colors px-1 shrink-0 ${enabled ? 'bg-[#1E293B]' : 'bg-[#E2E8F0]'}`}
      >
        <div className={`w-4 h-4 rounded-full bg-white flex items-center justify-center transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`}>
          {enabled
            ? <Check className="w-3 h-3 text-[#1E293B]" strokeWidth={3} />
            : <X className="w-3 h-3 text-[#94A3B8]" strokeWidth={3} />
          }
        </div>
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-slate-900">{title}</p>
        <p className="text-[13px] text-slate-500 leading-tight">{description}</p>
        {children && enabled && <div className="mt-3">{children}</div>}
      </div>
    </div>
  </div>
);

// ─── Lesson type ──────────────────────────────────────────────────────────────
interface Lesson {
  id?: string;
  title: string;
  video_type: 'youtube' | 'vimeo' | 'upload' | 'text';
  video_url: string;
  duration_minutes: number;
  description: string;
  position: number;
  file?: File;
}

function EditProduct() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('informations');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [productType, setProductType] = useState<string>('file');
  const [isPublished, setIsPublished] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // ── Core fields ─────────────────────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [pricingModel, setPricingModel] = useState('one_time');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFile, setDownloadFile] = useState<File | null>(null);

  // ── Toggles ─────────────────────────────────────────────────────────────────
  const [enableCustomButton, setEnableCustomButton] = useState(false);
  const [customButtonText, setCustomButtonText] = useState('Acheter maintenant');
  const [enableFilePassword, setEnableFilePassword] = useState(false);
  const [filePassword, setFilePassword] = useState('');
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [enableSalesLimit, setEnableSalesLimit] = useState(false);
  const [salesLimit, setSalesLimit] = useState('');
  const [hideFromStore, setHideFromStore] = useState(false);
  const [hideSalesCount, setHideSalesCount] = useState(false);
  const [collectShippingAddress, setCollectShippingAddress] = useState(false);

  // ── FAQ ─────────────────────────────────────────────────────────────────────
  const [faqs, setFaqs] = useState<{ id?: string; question: string; answer: string; position: number }[]>([]);

  // ── SEO ─────────────────────────────────────────────────────────────────────
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [seoImageUrl, setSeoImageUrl] = useState<string | null>(null);
  const [seoImageFile, setSeoImageFile] = useState<File | null>(null);
  const [seoImagePreview, setSeoImagePreview] = useState<string | null>(null);

  // ── Course lessons ───────────────────────────────────────────────────────────
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courseContentType, setCourseContentType] = useState('mixed');

  // ── AI ───────────────────────────────────────────────────────────────────────
  const [aiRewriting, setAiRewriting] = useState(false);

  // ─── Build tabs dynamically ──────────────────────────────────────────────────
  const allTabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: 'informations', label: 'Informations', icon: FileText },
    { key: 'tarification', label: 'Tarification', icon: DollarSign },
    ...(productType === 'course' ? [{ key: 'cours' as TabKey, label: 'Contenu du cours', icon: Folder }] : []),
    { key: 'fichiers', label: 'Fichiers', icon: Upload },
    { key: 'description', label: 'Description', icon: AlignLeft },
    { key: 'visuel', label: 'Visuel & Design', icon: ImageIcon },
    { key: 'faq', label: 'Questions fréquentes', icon: HelpCircle },
    { key: 'seo', label: 'SEO', icon: SearchIcon },
    { key: 'seo', label: 'Avancé', icon: Settings },
  ].filter((t, i, arr) => arr.findIndex(x => x.key === t.key) === i);

  // Remove duplicate seo/avancé
  const tabs = [
    { key: 'informations' as TabKey, label: 'Informations', icon: FileText },
    { key: 'tarification' as TabKey, label: 'Tarification', icon: DollarSign },
    ...(productType === 'course' ? [{ key: 'cours' as TabKey, label: 'Contenu du cours', icon: Folder }] : []),
    { key: 'fichiers' as TabKey, label: 'Fichiers', icon: Upload },
    { key: 'description' as TabKey, label: 'Description', icon: AlignLeft },
    { key: 'visuel' as TabKey, label: 'Visuel & Design', icon: ImageIcon },
    { key: 'faq' as TabKey, label: 'Questions fréquentes', icon: HelpCircle },
    { key: 'seo' as TabKey, label: 'SEO', icon: SearchIcon },
  ];

  // ─── Load product ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await adminSupabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error || !data) {
        toast.error('Produit introuvable');
        navigate({ to: '/admin/products' });
        return;
      }

      setTitle(data.title || '');
      setCategory(data.category || '');
      setDescription(data.description || '');
      setPricingModel(data.pricing_model || (data.price === 0 ? 'free' : 'one_time'));
      setPrice(String(data.price || ''));
      setOriginalPrice(data.original_price ? String(data.original_price) : '');
      setProductType(data.type || 'file');
      setIsPublished(data.is_published || false);
      setThumbnailUrl(data.thumbnail_url || null);
      setThumbnailPreview(data.thumbnail_url || null);
      setDownloadUrl(data.download_url || null);
      setCourseContentType(data.course_content_type || 'mixed');

      // SEO
      setSeoTitle((data as any).seo_title || '');
      setSeoDescription((data as any).seo_description || '');
      setSeoKeywords((data as any).seo_keywords || '');
      setSeoImageUrl((data as any).seo_image_url || null);
      setSeoImagePreview((data as any).seo_image_url || null);

      // Advanced toggles
      const d = data as any;
      setEnableFilePassword(!!d.file_password);
      setFilePassword(d.file_password || '');
      setWatermarkEnabled(!!d.watermark_enabled);
      setEnableSalesLimit(!!d.sales_limit);
      setSalesLimit(d.sales_limit ? String(d.sales_limit) : '');
      setHideFromStore(!!d.hide_from_store);
      setHideSalesCount(!!d.hide_sales_count);
      setCollectShippingAddress(!!d.collect_shipping_address);
      setEnableCustomButton(!!d.custom_button_text);
      setCustomButtonText(d.custom_button_text || 'Acheter maintenant');

      // Load course lessons
      if (data.type === 'course') {
        const { data: lessonsData } = await adminSupabase
          .from('course_lessons')
          .select('*')
          .eq('product_id', productId)
          .order('position');
        if (lessonsData) {
          setLessons(lessonsData.map((l: any) => ({
            id: l.id,
            title: l.title || '',
            video_type: l.video_type || 'youtube',
            video_url: l.video_url || '',
            duration_minutes: l.duration_minutes || 0,
            description: l.description || '',
            position: l.position,
          })));
        }
      }

      // Load FAQs
      const { data: faqData } = await adminSupabase
        .from('product_faqs')
        .select('*')
        .eq('product_id', productId)
        .order('position');
      if (faqData) {
        setFaqs(faqData.map((f: any) => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
          position: f.position,
        })));
      }

      setLoading(false);
    };
    fetchProduct();
  }, [productId]);

  // ─── Upload helper ────────────────────────────────────────────────────────────
  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const ext = file.name.split('.').pop();
    const path = `${folder}/${Date.now()}.${ext}`;
    const { error } = await adminSupabase.storage.from('product-assets').upload(path, file);
    if (error) { toast.error('Erreur upload: ' + error.message); return null; }
    const { data } = adminSupabase.storage.from('product-assets').getPublicUrl(path);
    return data.publicUrl;
  };

  // ─── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      let newThumb = thumbnailUrl;
      let newDownload = downloadUrl;
      let newSeoImg = seoImageUrl;

      if (thumbnailFile) newThumb = await uploadFile(thumbnailFile, 'thumbnails');
      if (downloadFile) newDownload = await uploadFile(downloadFile, 'downloads');
      if (seoImageFile) newSeoImg = await uploadFile(seoImageFile, 'seo-images');

      const priceNum = pricingModel === 'free' ? 0 : parseFloat(price) || 0;
      const originalPriceNum = pricingModel === 'free' ? 0 : parseFloat(originalPrice) || 0;

      if (pricingModel === 'one_time') {
        if (priceNum < 100) { toast.error("Le prix minimum est de 100 FCFA"); setSaving(false); return; }
        if (originalPriceNum > 0 && originalPriceNum <= priceNum) {
          toast.error("Le prix barré doit être strictement supérieur au prix de vente"); setSaving(false); return;
        }
      }

      const updateData: any = {
        title: title.trim(),
        description: description.trim() || null,
        category: category || null,
        pricing_model: pricingModel,
        price: priceNum,
        original_price: originalPriceNum > 0 ? originalPriceNum : null,
        thumbnail_url: newThumb,
        download_url: newDownload,
        seo_title: seoTitle.trim() || null,
        seo_description: seoDescription.trim() || null,
        seo_keywords: seoKeywords.trim() || null,
        seo_image_url: newSeoImg,
        file_password: enableFilePassword && filePassword.trim() ? filePassword.trim() : null,
        watermark_enabled: watermarkEnabled,
        sales_limit: enableSalesLimit && salesLimit ? parseInt(salesLimit) : null,
        hide_from_store: hideFromStore,
        collect_shipping_address: collectShippingAddress,
        hide_sales_count: hideSalesCount,
        custom_button_text: enableCustomButton ? customButtonText : null,
        course_content_type: productType === 'course' ? courseContentType : undefined,
      };

      const { error } = await adminSupabase.from('products').update(updateData).eq('id', productId);
      if (error) throw error;

      // Save course lessons
      if (productType === 'course') {
        await adminSupabase.from('course_lessons').delete().eq('product_id', productId);
        if (lessons.length > 0) {
          const toInsert = [];
          for (const lesson of lessons) {
            let videoUrl = lesson.video_url;
            if (lesson.video_type === 'upload' && lesson.file) {
              const uploaded = await uploadFile(lesson.file, 'course-videos');
              if (uploaded) videoUrl = uploaded;
            }
            toInsert.push({
              product_id: productId,
              title: lesson.title || `Leçon ${lesson.position + 1}`,
              description: lesson.description || null,
              video_url: videoUrl || null,
              video_type: lesson.video_type,
              duration_minutes: lesson.duration_minutes,
              position: lesson.position,
            });
          }
          await adminSupabase.from('course_lessons').insert(toInsert);
        }
      }

      // Save FAQs
      await adminSupabase.from('product_faqs').delete().eq('product_id', productId);
      if (faqs.length > 0) {
        await adminSupabase.from('product_faqs').insert(
          faqs.map((f, i) => ({ product_id: productId, question: f.question, answer: f.answer, position: i }))
        );
      }

      toast.success('Produit mis à jour !');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  // ─── Publish ─────────────────────────────────────────────────────────────────
  const togglePublish = async () => {
    const { error } = await adminSupabase
      .from('products')
      .update({ is_published: !isPublished })
      .eq('id', productId);
    if (error) { toast.error(error.message); return; }
    setIsPublished(!isPublished);
    toast.success(isPublished ? 'Produit dépublié' : 'Produit publié !');
  };

  // ─── Add lesson ───────────────────────────────────────────────────────────────
  const addLesson = () => {
    setLessons([...lessons, {
      title: '',
      video_type: 'youtube',
      video_url: '',
      duration_minutes: 0,
      description: '',
      position: lessons.length,
    }]);
  };

  const updateLesson = (index: number, field: string, value: any) => {
    const updated = [...lessons];
    (updated[index] as any)[field] = value;
    setLessons(updated);
  };

  const removeLesson = (index: number) => {
    setLessons(lessons.filter((_, i) => i !== index).map((l, i) => ({ ...l, position: i })));
  };

  // ─── AI rewrite ───────────────────────────────────────────────────────────────
  const rewriteDescription = async () => {
    if (!title.trim()) { toast.error('Entrez d\'abord un titre'); return; }
    setAiRewriting(true);
    try {
      const { data, error } = await adminSupabase.functions.invoke('rewrite-description', {
        body: { title, description, productType },
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate({ to: '/admin/products' })}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="min-w-0">
              <h1 className="text-[15px] font-bold text-slate-900 truncate">{title || 'Produit sans titre'}</h1>
              <span className="text-[12px] text-slate-400 capitalize">
                {productType === 'file' ? 'Fichier' : productType === 'course' ? 'Formation' : productType}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.open(`/product/${productId}`, '_blank')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Voir
            </button>

            <button
              onClick={togglePublish}
              className={`flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium rounded-lg transition-colors ${
                isPublished
                  ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isPublished
                ? <><EyeOff className="w-4 h-4" /> Dépublier</>
                : <><Eye className="w-4 h-4" /> Publier</>
              }
            </button>

            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setShowMore(!showMore)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
              >
                <MoreVertical className="w-4 h-4 text-slate-600" />
              </button>
              {showMore && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/product/${productId}`);
                      toast.success('Lien copié !');
                      setShowMore(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Link2 className="w-4 h-4" /> Copier le lien
                  </button>
                  <hr className="border-slate-100 my-1" />
                  <button
                    onClick={async () => {
                      if (!confirm('Supprimer ce produit définitivement ?')) return;
                      await adminSupabase.from('products').delete().eq('id', productId);
                      toast.success('Produit supprimé');
                      navigate({ to: '/admin/products' });
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Supprimer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Layout ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar nav */}
        <nav className="md:w-52 md:shrink-0">
          <div className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors text-left whitespace-nowrap shrink-0 ${
                    activeTab === tab.key
                      ? 'bg-[#1E293B] text-white shadow-sm'
                      : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="md:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

            {/* ── INFORMATIONS ── */}
            {activeTab === 'informations' && (
              <div className="space-y-6">
                <h2 className="text-[18px] font-bold text-slate-900">Détails du produit</h2>

                <div>
                  <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
                    Nom du produit <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="flex-1 h-11 px-3 text-[14px] bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E293B]/20 focus:border-[#1E293B] transition-colors"
                    />
                    <button
                      onClick={rewriteDescription}
                      disabled={aiRewriting || !title.trim()}
                      title="Améliorer avec l'IA"
                      className="w-11 h-11 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-amber-50 hover:border-amber-300 transition-colors disabled:opacity-40"
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
                    className="w-full h-11 px-3 text-[14px] bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E293B]/20 focus:border-[#1E293B] transition-colors"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option value="marketing">📈 Marketing Digital</option>
                    <option value="design">🎨 Design & Créativité</option>
                    <option value="dev">💻 Développement</option>
                    <option value="business">💼 Business & Finance</option>
                    <option value="education">🎓 Éducation & Apprentissage</option>
                    <option value="lifestyle">🌿 Lifestyle</option>
                    <option value="other">✨ Autre</option>
                  </select>
                </div>

                {/* Toggles */}
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100">
                  <div className="px-4">
                    <ToggleRow
                      title="Texte du bouton d'achat"
                      description="Personnalisez le texte du bouton d'achat sur votre page produit"
                      enabled={enableCustomButton}
                      onToggle={setEnableCustomButton}
                    >
                      <select
                        value={customButtonText}
                        onChange={e => setCustomButtonText(e.target.value)}
                        className="w-full h-10 px-3 text-[13px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E293B]"
                      >
                        <option>Acheter maintenant</option>
                        <option>Télécharger maintenant</option>
                        <option>Obtenir l'accès</option>
                        <option>S'inscrire</option>
                        <option>Profiter de l'offre</option>
                      </select>
                    </ToggleRow>

                    <ToggleRow
                      title="Protégez vos fichiers avec un mot de passe"
                      description="Sécurisez votre contenu premium avec protection par mot de passe"
                      enabled={enableFilePassword}
                      onToggle={setEnableFilePassword}
                    >
                      <input
                        type="text"
                        value={filePassword}
                        onChange={e => setFilePassword(e.target.value)}
                        placeholder="Mot de passe à communiquer à l'acheteur"
                        className="w-full h-10 px-3 text-[13px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E293B]"
                      />
                    </ToggleRow>

                    <ToggleRow
                      title="Ajoutez des filigranes à vos fichiers"
                      description="Affiche les détails de l'acheteur sur la page de téléchargement pour décourager le partage non autorisé"
                      enabled={watermarkEnabled}
                      onToggle={setWatermarkEnabled}
                    />

                    <ToggleRow
                      title="Limite de ventes"
                      description="Rendez votre produit exclusif en limitant le nombre d'acheteurs"
                      enabled={enableSalesLimit}
                      onToggle={setEnableSalesLimit}
                    >
                      <input
                        type="number"
                        min={1}
                        value={salesLimit}
                        onChange={e => setSalesLimit(e.target.value)}
                        placeholder="Nombre maximum de ventes"
                        className="w-full h-10 px-3 text-[13px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E293B]"
                      />
                    </ToggleRow>

                    <ToggleRow
                      title="Masquer sur la boutique"
                      description="Gardez ce produit privé - uniquement accessible avec un lien direct"
                      enabled={hideFromStore}
                      onToggle={setHideFromStore}
                    />

                    <ToggleRow
                      title="Masquer le nombre de ventes"
                      description="Cache le compteur de ventes sur la page produit publique"
                      enabled={hideSalesCount}
                      onToggle={setHideSalesCount}
                    />

                    <ToggleRow
                      title="Collecter les adresses de livraison"
                      description="Demande l'adresse postale lors du paiement (utile pour les produits physiques)"
                      enabled={collectShippingAddress}
                      onToggle={setCollectShippingAddress}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── TARIFICATION ── */}
            {activeTab === 'tarification' && (
              <div className="space-y-6">
                <h2 className="text-[18px] font-bold text-slate-900">Tarification</h2>
                
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
                      <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">Prix</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-slate-400">FCFA</span>
                      <input
                        type="number"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        className="w-full h-11 pl-14 pr-3 text-[14px] bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E293B]/20 focus:border-[#1E293B] transition-colors"
                        placeholder="0"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Min : 100 FCFA</p>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">Prix barré</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-slate-400">FCFA</span>
                      <input
                        type="number"
                        value={originalPrice}
                        onChange={e => setOriginalPrice(e.target.value)}
                        className="w-full h-11 pl-14 pr-3 text-[14px] bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E293B]/20 focus:border-[#1E293B] transition-colors"
                        placeholder="0"
                      />
                    </div>
                      {originalPrice && parseFloat(originalPrice) > parseFloat(price || '0') && (
                        <p className="text-[11px] text-emerald-600 mt-1">
                          Réduction de {Math.round(((parseFloat(originalPrice) - parseFloat(price)) / parseFloat(originalPrice)) * 100)}%
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── COURS (formation only) ── */}
            {activeTab === 'cours' && productType === 'course' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[18px] font-bold text-slate-900">Contenu de la formation</h2>
                    <p className="text-[13px] text-slate-500">Gérez les leçons de votre formation</p>
                  </div>
                </div>

                {/* Content type selector */}
                <div>
                  <label className="block text-[13px] font-semibold text-slate-800 mb-3">Type de contenu</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'video', label: 'Vidéo', icon: Video, desc: 'Cours en vidéo' },
                      { value: 'text', label: 'Texte', icon: BookOpen, desc: 'Contenu écrit' },
                      { value: 'mixed', label: 'Mixte', icon: Layers, desc: 'Vidéo + texte' },
                    ].map(ct => (
                      <button
                        key={ct.value}
                        type="button"
                        onClick={() => setCourseContentType(ct.value)}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          courseContentType === ct.value
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <ct.icon className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                        <p className="text-[13px] font-semibold text-slate-900">{ct.label}</p>
                        <p className="text-[11px] text-slate-500">{ct.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lessons list */}
                <div className="space-y-3">
                  {lessons.map((lesson, index) => (
                    <div key={index} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="w-7 h-7 rounded-full bg-[#1E293B] text-white flex items-center justify-center text-[12px] font-bold shrink-0">
                          {index + 1}
                        </span>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            value={lesson.title}
                            onChange={e => updateLesson(index, 'title', e.target.value)}
                            placeholder="Titre de la leçon"
                            className="h-10 px-3 text-[13px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E293B]"
                          />
                          <input
                            type="number"
                            value={lesson.duration_minutes || ''}
                            onChange={e => updateLesson(index, 'duration_minutes', parseInt(e.target.value) || 0)}
                            placeholder="Durée (minutes)"
                            className="h-10 px-3 text-[13px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E293B]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLesson(index)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 ml-10">
                        <select
                          value={lesson.video_type}
                          onChange={e => updateLesson(index, 'video_type', e.target.value)}
                          className="h-10 px-3 text-[13px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E293B]"
                        >
                          <option value="youtube">YouTube URL</option>
                          <option value="vimeo">Vimeo URL</option>
                          <option value="upload">Upload vidéo</option>
                          <option value="text">Texte uniquement</option>
                        </select>
                        {lesson.video_type !== 'text' && lesson.video_type !== 'upload' && (
                          <input
                            value={lesson.video_url}
                            onChange={e => updateLesson(index, 'video_url', e.target.value)}
                            placeholder={lesson.video_type === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://vimeo.com/...'}
                            className="sm:col-span-2 h-10 px-3 text-[13px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E293B]"
                          />
                        )}
                        {lesson.video_type === 'upload' && (
                          <div className="sm:col-span-2">
                            <label className="flex items-center gap-2 h-10 px-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-[#1E293B] transition-colors">
                              <Upload className="w-4 h-4 text-slate-400" />
                              <span className="text-[13px] text-slate-500">
                                {lesson.file ? lesson.file.name : 'Choisir une vidéo'}
                              </span>
                              <input
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={e => {
                                  const f = e.target.files?.[0];
                                  if (f) updateLesson(index, 'file', f);
                                }}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addLesson}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-300 rounded-xl text-[13px] font-medium text-slate-500 hover:border-[#1E293B] hover:text-[#1E293B] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter une leçon
                </button>
              </div>
            )}

            {/* ── FICHIERS ── */}
            {activeTab === 'fichiers' && (
              <div className="space-y-6">
                <h2 className="text-[18px] font-bold text-slate-900">Fichier du produit</h2>

                {downloadUrl && !downloadFile && (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <Package className="w-5 h-5 text-slate-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-slate-700">Fichier actuel</p>
                      <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[12px] text-blue-600 hover:underline truncate block"
                      >
                        {downloadUrl.split('/').pop()}
                      </a>
                    </div>
                  </div>
                )}

                <div
                  className="rounded-xl border-2 border-dashed border-slate-300 p-12 text-center cursor-pointer hover:border-[#1E293B] transition-colors"
                  onClick={() => document.getElementById('edit-download-input')?.click()}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-amber-600" />
                    </div>
                    <p className="text-[14px] font-medium text-slate-700">
                      {downloadUrl ? 'Remplacer le fichier' : 'Choisir un fichier'}
                    </p>
                    <p className="text-[12px] text-slate-400">PDF, ZIP, MP3, MP4, DOCX… Max 500 MB</p>
                  </div>
                  {downloadFile && (
                    <p className="text-[13px] font-medium text-slate-700 mt-4">📎 {downloadFile.name}</p>
                  )}
                  <input
                    id="edit-download-input"
                    type="file"
                    className="hidden"
                    onChange={e => setDownloadFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            )}

            {/* ── DESCRIPTION ── */}
            {activeTab === 'description' && (
              <div className="space-y-4">
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  label="Description"
                  withAI={true}
                  productTitle={title}
                  productType={productType}
                />
              </div>
            )}

            {/* ── VISUEL ── */}
            {activeTab === 'visuel' && (
              <div className="space-y-6">
                <h2 className="text-[18px] font-bold text-slate-900">Visuel & Design</h2>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-800 mb-3">Vignette du produit</label>
                  <div
                    className="relative w-48 h-48 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 hover:border-[#1E293B] transition-colors cursor-pointer flex items-center justify-center overflow-hidden"
                    onClick={() => document.getElementById('edit-thumb-input')?.click()}
                  >
                    {thumbnailPreview
                      ? <img src={thumbnailPreview} alt="Vignette" className="h-full w-full object-cover" />
                      : <Package className="w-12 h-12 text-slate-300" />
                    }
                    <input
                      id="edit-thumb-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setThumbnailFile(f);
                          const reader = new FileReader();
                          reader.onload = ev => setThumbnailPreview(ev.target?.result as string);
                          reader.readAsDataURL(f);
                        }
                      }}
                    />
                  </div>
                  <p className="text-[12px] text-slate-400 mt-2">Image carrée JPG ou PNG. Min 600×600px recommandé.</p>
                </div>
              </div>
            )}

            {/* ── FAQ ── */}
            {activeTab === 'faq' && (
              <div className="space-y-6">
                <div className="flex flex-col items-center text-center mb-2">
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <HelpCircle className="w-6 h-6 text-slate-400" />
                  </div>
                  <h2 className="text-[18px] font-bold text-slate-900">Questions fréquentes</h2>
                  <p className="text-[13px] text-slate-500 mt-1 max-w-md">
                    Répondez aux questions fréquemment posées par vos clients pour rassurer et convertir.
                  </p>
                </div>

                {faqs.length > 0 && (
                  <div className="space-y-3">
                    {faqs.map((faq, index) => (
                      <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 space-y-3">
                            <div>
                              <label className="text-[11px] font-semibold text-slate-400 uppercase mb-1 block">Question</label>
                              <input
                                value={faq.question}
                                onChange={e => {
                                  const updated = [...faqs];
                                  updated[index].question = e.target.value;
                                  setFaqs(updated);
                                }}
                                placeholder="Ex: Comment accéder au contenu ?"
                                className="w-full h-10 px-3 text-[13px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1E293B]"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-slate-400 uppercase mb-1 block">Réponse</label>
                              <textarea
                                value={faq.answer}
                                onChange={e => {
                                  const updated = [...faqs];
                                  updated[index].answer = e.target.value;
                                  setFaqs(updated);
                                }}
                                placeholder="Votre réponse..."
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] min-h-[80px] resize-y focus:outline-none focus:border-[#1E293B]"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFaqs(faqs.filter((_, i) => i !== index))}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setFaqs([...faqs, { question: '', answer: '', position: faqs.length }])}
                    className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-[#1E293B] hover:text-[#1E293B] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter une question
                  </button>
                </div>
              </div>
            )}

            {/* ── SEO ── */}
            {activeTab === 'seo' && (
              <div className="space-y-8">
                {/* Google preview */}
                <div>
                  <h2 className="text-[18px] font-bold text-slate-900 mb-1">Aperçu Google</h2>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg border border-slate-200 bg-white flex items-center justify-center shrink-0">
                      <Globe className="w-5 h-5 text-slate-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-blue-700 truncate">
                        {seoTitle || title || 'Titre de la page'}
                      </p>
                      <p className="text-[12px] text-green-700 truncate">
                        {window.location.origin}/product/{productId}
                      </p>
                      <p className="text-[12px] text-slate-500 mt-0.5 line-clamp-2">
                        {seoDescription || 'Meta description de votre produit...'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Title & description */}
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900 mb-1">Titre et Meta description</h3>
                  <p className="text-[13px] text-slate-500 mb-4">
                    Optimisez votre référencement dans les moteurs de recherche.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">Titre SEO</label>
                      <input
                        value={seoTitle}
                        onChange={e => setSeoTitle(e.target.value)}
                        placeholder={title || 'Ajouter un titre SEO'}
                        className="w-full h-11 px-3 text-[14px] bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#1E293B]"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">Meta description</label>
                      <textarea
                        value={seoDescription}
                        onChange={e => setSeoDescription(e.target.value)}
                        placeholder="Décrivez votre produit pour les moteurs de recherche..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-[13px] min-h-[100px] resize-y focus:outline-none focus:border-[#1E293B]"
                      />
                    </div>
                  </div>
                </div>

                {/* SEO image */}
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900 mb-1">Image de partage</h3>
                  <p className="text-[13px] text-slate-500 mb-4">
                    Image affichée lors du partage sur les réseaux. Format recommandé : 1200×627px.
                  </p>
                  <div
                    className="rounded-xl border-2 border-dashed border-slate-300 h-48 flex items-center justify-center cursor-pointer hover:border-[#1E293B] transition-colors overflow-hidden"
                    onClick={() => document.getElementById('seo-image-input')?.click()}
                  >
                    {seoImagePreview
                      ? <img src={seoImagePreview} alt="SEO" className="h-full w-full object-cover" />
                      : (
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <ImageIcon className="w-10 h-10" />
                          <p className="text-[13px]">Cliquer pour ajouter une image</p>
                        </div>
                      )
                    }
                    <input
                      id="seo-image-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setSeoImageFile(f);
                          const reader = new FileReader();
                          reader.onload = ev => setSeoImagePreview(ev.target?.result as string);
                          reader.readAsDataURL(f);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900 mb-1">Mots-clés</h3>
                  <p className="text-[13px] text-slate-500 mb-4">Séparés par des virgules.</p>
                  <input
                    value={seoKeywords}
                    onChange={e => setSeoKeywords(e.target.value)}
                    placeholder="marketing digital, formation, facebook ads..."
                    className="w-full h-11 px-3 text-[14px] bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#1E293B]"
                  />
                </div>
              </div>
            )}

          </div>

          {/* ── Save button ── */}
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-[#1E293B] text-white text-[14px] font-semibold rounded-xl hover:bg-[#0F172A] transition-colors disabled:opacity-50 shadow-sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Enregistrer
            </button>
          </div>
        </div>
      </div>

      {/* Click outside to close more menu */}
      {showMore && (
        <div className="fixed inset-0 z-20" onClick={() => setShowMore(false)} />
      )}
    </div>
  );
}
