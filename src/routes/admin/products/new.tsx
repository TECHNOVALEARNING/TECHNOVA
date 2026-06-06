import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { useState, useRef, useEffect } from 'react';
import { adminSupabase } from '@/lib/supabase';
import { 
  Loader2, 
  Sparkles, 
  Image as ImageIcon, 
  File, 
  CheckCircle2, 
  Box, 
  PlayCircle,
  Bold, Italic, Underline, Strikethrough, List, ListOrdered, Link as LinkIcon, Image as ImageIcon2, Video,
  Rocket, Languages, CheckCheck, X
} from 'lucide-react';

export const Route = createFileRoute('/admin/products/new')({
  component: AdminNewProductWizard,
});

function AdminNewProductWizard() {
  const navigate = useNavigate();
  const search: any = useSearch({ strict: false });
  const productType = search?.type || 'fichier';

  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [pricingModel, setPricingModel] = useState('Paiement unique');
  const [price, setPrice] = useState('');
  const [crossedPrice, setCrossedPrice] = useState('');
  
  const [description, setDescription] = useState('');
  
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  const [productFile, setProductFile] = useState<File | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const isPublishing = useRef(false);

  // Popups State for Rich Text Editor
  const [showFormatPopup, setShowFormatPopup] = useState(false);
  const [currentFormat, setCurrentFormat] = useState('Normal');

  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [linkUrlInput, setLinkUrlInput] = useState('');

  const [savedRange, setSavedRange] = useState<Range | null>(null);

  // AI Assistant State
  const [showIADropdown, setShowIADropdown] = useState(false);
  const [showIAImproveModal, setShowIAImproveModal] = useState(false);
  const [iaKeywords, setIaKeywords] = useState('');
  const [iaInstructions, setIaInstructions] = useState('');
  const [iaTone, setIaTone] = useState('Persuasif');
  const [isGenerating, setIsGenerating] = useState(false);

  const draftId = search?.id || null;
  const [productId, setProductId] = useState<string | null>(draftId);

  // Load draft on mount if ID is in URL
  useEffect(() => {
    if (productId) {
      const loadDraft = async () => {
        const { data } = await adminSupabase.from('products').select('*').eq('id', productId).single();
        if (data) {
          setTitle(data.title);
          setDescription(data.description);
          if (data.price) setPrice(data.price.toString());
          if (data.category) setCategory(data.category);
          if (data.image_url && data.image_url !== 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800') {
             setCoverPreview(data.image_url);
          }
          try {
            const feats = typeof data.features === 'string' ? JSON.parse(data.features) : data.features;
            if (feats) {
              if (feats.pricing_model) setPricingModel(feats.pricing_model);
              if (feats.crossed_price) setCrossedPrice(feats.crossed_price.toString());
            }
          } catch(e) {}
        }
      };
      loadDraft();
    }
  }, []);

  // Save Draft Function
  const saveDraft = async () => {
    if (isPublishing.current || (!title && !description)) return;
    
    try {
      const features = {
        crossed_price: crossedPrice ? parseInt(crossedPrice) : null,
        pricing_model: pricingModel,
        status: 'draft',
        type: productType,
      };

      const productData = {
        title: title || 'Brouillon sans titre',
        description: description || '',
        price: parseInt(price || '0'),
        category: category || 'Éducation & Apprentissage',
        image_url: coverPreview && !coverPreview.startsWith('blob:') ? coverPreview : 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800',
        features: JSON.stringify(features),
        status: 'draft'
      };

      if (productId) {
        await adminSupabase.from('products').update(productData).eq('id', productId);
      } else {
        const { data } = await adminSupabase.from('products').insert([productData]).select('id').single();
        if (data && data.id) {
          setProductId(data.id);
          navigate({ to: '/admin/products/new', search: { type: productType, id: data.id }, replace: true });
        }
      }
    } catch (e) {
      console.error("Erreur auto-save", e);
    }
  };

  // Auto-save effect (every 2s on changes)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft();
    }, 2000);
    return () => clearTimeout(timer);
  }, [title, description, price, category, pricingModel, crossedPrice]);

  // Sync editor content when returning to step 2
  useEffect(() => {
    if (step === 2 && editorRef.current) {
      if (editorRef.current.innerHTML !== description) {
        editorRef.current.innerHTML = description;
      }
    }
  }, [step]);

  // Type config
  const typeConfig = {
    fichier: { color: 'text-blue-600', icon: File, title: 'Créez un produit téléchargeable', subtitle: 'Vendez des fichiers numériques livrés instantanément après achat.' },
    formation: { color: 'text-purple-600', icon: PlayCircle, title: 'Créez une formation', subtitle: 'Structurez vos leçons et modules dans un espace membre privé.' },
    service: { color: 'text-emerald-600', icon: Box, title: 'Créez un service', subtitle: 'Proposez vos prestations et consultations sur mesure.' },
  }[productType as 'fichier'|'formation'|'service'] || { color: 'text-blue-600', icon: File, title: 'Création de produit', subtitle: 'Paramétrez votre nouvelle offre.' };

  const TypeIcon = typeConfig.icon;

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductFile(file);
    }
  };

  const handleFormat = (e: React.MouseEvent, command: string, value?: string) => {
    e.preventDefault(); 
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setDescription(editorRef.current.innerHTML);
    }
  };

  const generateIADescription = async () => {
    setIsGenerating(true);
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        alert("La clé API Gemini n'est pas configurée ! Ajoutez VITE_GEMINI_API_KEY dans votre fichier .env");
        setIsGenerating(false);
        return;
      }

      const productName = title || 'un produit numérique';
      const promptText = `
Tu es un copywriter expert et vendeur d'élite.
Génère une description de produit hautement persuasive pour un produit nommé : "${productName}".

Détails de la demande :
- Mots-clés à inclure absolument : ${iaKeywords || 'Aucun mot-clé imposé'}
- Instructions spéciales : ${iaInstructions || 'Aucune instruction spéciale'}
- Tonalité : ${iaTone}

Contraintes de format (Très important) :
Renvoie UNIQUEMENT le code HTML, sans balise \`\`\`html, sans <html> ni <body>.
Utilise exclusivement ces balises HTML pour la mise en forme :
- <h1> pour le titre principal accrocheur (un seul)
- <h2> pour les sous-titres (ex: Ce que vous apprendrez, etc.)
- <h3> pour mettre en avant une garantie ou un bénéfice précis
- <p> pour les paragraphes
- <ul> et <li> pour les listes à puces (très important pour la lisibilité)
- <strong> pour mettre en gras les bénéfices et mots importants

Ne fais aucune introduction. Génère directement le contenu HTML final prêt à être affiché dans l'éditeur de texte.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });

      if (!response.ok) {
        let errorMsg = 'Erreur de communication avec Google AI';
        try {
          const errData = await response.json();
          errorMsg = errData.error?.message || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      let generatedHTML = data.candidates[0].content.parts[0].text;
      
      // Clean up markdown block if the AI still adds it
      generatedHTML = generatedHTML.replace(/```html/gi, '').replace(/```/g, '').trim();

      setDescription(generatedHTML);
      if (editorRef.current) {
        editorRef.current.innerHTML = generatedHTML;
      }
      
      setShowIAImproveModal(false);
    } catch (err: any) {
      console.error(err);
      alert("Erreur lors de la génération IA : " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    isPublishing.current = true;
    setLoading(true);
    try {
      let coverImageUrl = coverPreview && !coverPreview.startsWith('blob:') ? coverPreview : '';
      let fileUrl = '';

      if (coverImage) {
        const fileExt = coverImage.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const { error: uploadError } = await adminSupabase.storage
          .from('product_images')
          .upload(fileName, coverImage);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = adminSupabase.storage
          .from('product_images')
          .getPublicUrl(fileName);
        coverImageUrl = publicUrlData.publicUrl;
      }

      if (productFile) {
        const fileExt = productFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const { error: uploadError } = await adminSupabase.storage
          .from('product_files')
          .upload(fileName, productFile);
        if (uploadError) throw uploadError;
        fileUrl = fileName; 
      }

      const features = {
        crossed_price: crossedPrice ? parseInt(crossedPrice) : null,
        pricing_model: pricingModel,
        status: 'active',
        type: productType,
        file_url: fileUrl,
      };

      const productData = {
        title,
        description,
        price: parseInt(price || '0'),
        category,
        image_url: coverImageUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800',
        features: JSON.stringify(features),
        status: 'active'
      };

      if (productId) {
        const { error: dbError } = await adminSupabase
          .from('products')
          .update(productData)
          .eq('id', productId);
        if (dbError) throw dbError;
      } else {
        const { error: dbError } = await adminSupabase
          .from('products')
          .insert([productData]);
        if (dbError) throw dbError;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate({ to: '/admin/products' });
      }, 2000);

    } catch (err: any) {
      console.error(err);
      alert("Erreur lors de la publication: " + err.message);
      isPublishing.current = false;
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6 relative">
          <CheckCircle2 className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Produit publié avec succès !</h2>
        <p className="text-slate-500">Redirection vers votre catalogue...</p>
      </div>
    );
  }

  const isStepValid = () => {
    if (step === 1) return title.trim() !== '' && category !== '' && price !== '';
    if (step === 2) return true; 
    if (step === 3) return true; 
    if (step === 4) return true; 
    return true;
  };

  return (
    <div className="max-w-[700px] mx-auto pb-24 pt-8 font-sans">
      
      {/* Header & Progress */}
      <div className="mb-10 flex flex-col items-center text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center">
             <TypeIcon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h1 className="text-[17px] font-bold text-slate-900">{typeConfig.title}</h1>
            <p className="text-[13px] text-slate-500">{typeConfig.subtitle}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-[4px] w-full max-w-[500px] mx-auto mb-10">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div 
              key={i} 
              className={`h-[4px] flex-1 rounded-full transition-all duration-300 ${i < step ? 'bg-blue-600' : 'bg-slate-200'}`}
            ></div>
          ))}
        </div>
      </div>

      {/* Main Form Area */}
      <div className="max-w-[560px] mx-auto">
        
        {/* STEP 1: Details */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-[22px] font-medium text-slate-900 mb-6">Détails du produit</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[13px] font-medium text-[#111827] mb-1.5">Nom du produit <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Guide complet Facebook Ads 2026" 
                  className="w-full bg-white border border-[#D1D5DB] rounded-md px-3 py-2 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#111827] mb-1.5">Catégorie <span className="text-red-500">*</span></label>
                <select 
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-white border border-[#D1D5DB] rounded-md px-3 py-2 text-[14px] text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em' }}
                >
                  <option value="">Dans quelle catégorie classer ce produit ?</option>
                  <option value="Éducation & Apprentissage">Éducation & Apprentissage</option>
                  <option value="Marketing Digital">Marketing Digital</option>
                  <option value="Tech & Programmation">Tech & Programmation</option>
                  <option value="Business & Entrepreneuriat">Business & Entrepreneuriat</option>
                  <option value="Design">Design</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#111827] mb-1.5">Modèle de tarification <span className="text-red-500">*</span></label>
                <select 
                  value={pricingModel}
                  onChange={e => setPricingModel(e.target.value)}
                  className="w-full bg-white border border-[#D1D5DB] rounded-md px-3 py-2 text-[14px] text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em' }}
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
                      placeholder="" 
                      className="w-full bg-white border border-[#D1D5DB] rounded-md pl-3 pr-12 py-2 text-[14px] text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm"
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
                      placeholder="" 
                      className="w-full bg-white border border-[#D1D5DB] rounded-md pl-3 pr-12 py-2 text-[14px] text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-slate-400">FCFA</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Description (Working Rich Text Editor) */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-[22px] font-medium text-slate-900 mb-6">Ajouter la description du produit</h2>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[14px] font-medium text-slate-900">Décrivez votre produit <span className="text-red-500">*</span></label>
                
                {/* Assistant IA Dropdown Component */}
                <div className="relative">
                  <button 
                    onClick={() => setShowIADropdown(!showIADropdown)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-[8px] border border-[#E9D8FD] bg-gradient-to-r from-[#F0F5FF] to-[#FAF5FF] text-slate-800 text-[13px] font-bold hover:shadow-sm transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#6B46C1]" />
                    Assistant IA
                  </button>

                  {showIADropdown && (
                    <div className="absolute top-[120%] right-0 bg-white border border-[#E5E7EB] shadow-xl rounded-xl py-2 min-w-[240px] z-[60] animate-in slide-in-from-top-2 duration-200">
                      <button 
                        onClick={() => { setShowIADropdown(false); setShowIAImproveModal(true); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-slate-700 text-[14px] transition-colors"
                      >
                        <Rocket className="w-4 h-4 text-slate-600" />
                        Améliorer la description
                      </button>
                      <button 
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-slate-700 text-[14px] transition-colors"
                      >
                        <Languages className="w-4 h-4 text-slate-600" />
                        Traduire la description
                      </button>
                      <button 
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-slate-700 text-[14px] transition-colors"
                      >
                        <CheckCheck className="w-4 h-4 text-slate-600" />
                        Vérifier la grammaire
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border border-[#D1D5DB] rounded-lg bg-white shadow-sm flex flex-col h-[320px]">
                {/* Working Toolbar */}
                <div className="flex items-center gap-2 px-3 py-2 border-b border-[#E5E7EB] bg-[#F9FAFB] overflow-x-visible shrink-0 relative rounded-t-lg">
                  
                  {/* Format Dropdown (Custom like Chariow) */}
                  <div className="relative flex items-center">
                    <button 
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setShowFormatPopup(!showFormatPopup);
                        setShowLinkPopup(false);
                        setShowImagePopup(false);
                        setShowVideoPopup(false);
                      }} 
                      className={`text-[13px] flex items-center gap-1.5 bg-transparent text-slate-700 font-medium py-1.5 px-2 rounded-md hover:bg-slate-200 transition-colors ${showFormatPopup ? 'bg-slate-200' : ''}`}
                    >
                      {currentFormat}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>

                    {showFormatPopup && (
                      <div className="absolute top-[120%] left-0 bg-white border border-[#D1D5DB] shadow-lg flex flex-col z-[50] min-w-[150px] py-1.5 rounded-[4px]">
                        <button 
                          onMouseDown={(e) => {
                            e.preventDefault();
                            document.execCommand('formatBlock', false, 'H1');
                            setCurrentFormat('Heading 1');
                            setShowFormatPopup(false);
                            if (editorRef.current) setDescription(editorRef.current.innerHTML);
                          }}
                          className="text-left px-4 py-2 hover:bg-slate-50 text-slate-800 text-[22px] font-bold transition-colors"
                        >
                          Heading 1
                        </button>
                        <button 
                          onMouseDown={(e) => {
                            e.preventDefault();
                            document.execCommand('formatBlock', false, 'H2');
                            setCurrentFormat('Heading 2');
                            setShowFormatPopup(false);
                            if (editorRef.current) setDescription(editorRef.current.innerHTML);
                          }}
                          className="text-left px-4 py-2 hover:bg-slate-50 text-slate-800 text-[18px] font-bold transition-colors"
                        >
                          Heading 2
                        </button>
                        <button 
                          onMouseDown={(e) => {
                            e.preventDefault();
                            document.execCommand('formatBlock', false, 'H3');
                            setCurrentFormat('Heading 3');
                            setShowFormatPopup(false);
                            if (editorRef.current) setDescription(editorRef.current.innerHTML);
                          }}
                          className="text-left px-4 py-2 hover:bg-slate-50 text-slate-800 text-[15px] font-bold transition-colors"
                        >
                          Heading 3
                        </button>
                        <button 
                          onMouseDown={(e) => {
                            e.preventDefault();
                            document.execCommand('formatBlock', false, 'P');
                            setCurrentFormat('Normal');
                            setShowFormatPopup(false);
                            if (editorRef.current) setDescription(editorRef.current.innerHTML);
                          }}
                          className="text-left px-4 py-2 hover:bg-slate-50 text-slate-800 text-[13px] font-medium transition-colors"
                        >
                          Normal
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="w-px h-5 bg-slate-200 mx-1"></div>
                  <button onMouseDown={(e) => handleFormat(e, 'bold')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-md transition-colors"><Bold className="w-4 h-4" strokeWidth={2.5} /></button>
                  <button onMouseDown={(e) => handleFormat(e, 'italic')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-md transition-colors"><Italic className="w-4 h-4" strokeWidth={2.5} /></button>
                  <button onMouseDown={(e) => handleFormat(e, 'underline')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-md transition-colors"><Underline className="w-4 h-4" strokeWidth={2.5} /></button>
                  <button onMouseDown={(e) => handleFormat(e, 'strikeThrough')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-md transition-colors"><Strikethrough className="w-4 h-4" strokeWidth={2.5} /></button>
                  <div className="w-px h-5 bg-slate-200 mx-1"></div>
                  <button onMouseDown={(e) => handleFormat(e, 'insertUnorderedList')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-md transition-colors"><List className="w-4 h-4" strokeWidth={2.5} /></button>
                  <button onMouseDown={(e) => handleFormat(e, 'insertOrderedList')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-md transition-colors"><ListOrdered className="w-4 h-4" strokeWidth={2.5} /></button>
                  <div className="w-px h-5 bg-slate-200 mx-1"></div>
                  
                  {/* Link Popover Button */}
                  <div className="relative flex items-center">
                    <button 
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const selection = window.getSelection();
                        if (selection && selection.rangeCount > 0) {
                          setSavedRange(selection.getRangeAt(0));
                        }
                        setShowLinkPopup(!showLinkPopup);
                        setShowImagePopup(false);
                        setShowVideoPopup(false);
                        setShowFormatPopup(false);
                      }} 
                      className={`p-1.5 rounded-md transition-colors ${showLinkPopup ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-200'}`}
                    >
                      <LinkIcon className="w-4 h-4" strokeWidth={2.5} />
                    </button>

                    {showLinkPopup && (
                      <div className="absolute top-[120%] left-0 bg-white border border-[#D1D5DB] shadow-lg rounded-md p-1.5 flex items-center gap-2 z-[50] w-[320px]">
                        <span className="text-[13px] text-slate-700 font-medium pl-1 whitespace-nowrap">Enter link:</span>
                        <input 
                          type="text" 
                          placeholder="URL" 
                          value={linkUrlInput}
                          onChange={e => setLinkUrlInput(e.target.value)}
                          className="flex-1 border border-[#D1D5DB] rounded-[4px] px-2 py-1.5 text-[13px] outline-none focus:border-blue-500 transition-colors"
                          autoFocus
                        />
                        <button 
                          onMouseDown={(e) => {
                            e.preventDefault();
                            if (!linkUrlInput) return;
                            
                            if (savedRange) {
                              const selection = window.getSelection();
                              selection?.removeAllRanges();
                              selection?.addRange(savedRange);
                            }

                            document.execCommand('createLink', false, linkUrlInput);
                            if (editorRef.current) setDescription(editorRef.current.innerHTML);
                            
                            setShowLinkPopup(false);
                            setLinkUrlInput('');
                          }}
                          className="text-blue-600 text-[13px] font-medium px-2 hover:text-blue-700 cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Image Popover Button */}
                  <div className="relative flex items-center">
                    <button 
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const selection = window.getSelection();
                        if (selection && selection.rangeCount > 0) {
                          setSavedRange(selection.getRangeAt(0));
                        }
                        setShowImagePopup(!showImagePopup);
                        setShowLinkPopup(false);
                        setShowVideoPopup(false);
                        setShowFormatPopup(false);
                      }} 
                      className={`p-1.5 rounded-md transition-colors ${showImagePopup ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-200'}`}
                    >
                      <ImageIcon2 className="w-4 h-4" strokeWidth={2.5} />
                    </button>

                    {showImagePopup && (
                      <div className="absolute top-[120%] left-0 bg-white border border-[#D1D5DB] shadow-lg rounded-md p-1.5 flex items-center gap-2 z-[50] w-[320px]">
                        <span className="text-[13px] text-slate-700 font-medium pl-1 whitespace-nowrap">Enter image:</span>
                        <input 
                          type="text" 
                          placeholder="Image URL" 
                          value={imageUrlInput}
                          onChange={e => setImageUrlInput(e.target.value)}
                          className="flex-1 border border-[#D1D5DB] rounded-[4px] px-2 py-1.5 text-[13px] outline-none focus:border-blue-500 transition-colors"
                          autoFocus
                        />
                        <button 
                          onMouseDown={(e) => {
                            e.preventDefault();
                            if (!imageUrlInput) return;
                            
                            if (savedRange) {
                              const selection = window.getSelection();
                              selection?.removeAllRanges();
                              selection?.addRange(savedRange);
                            }

                            const html = `<div style="margin: 16px 0; text-align: center;"><img src="${imageUrlInput}" style="max-width: 100%; height: auto; border-radius: 8px;" /></div><p><br></p>`;
                            document.execCommand('insertHTML', false, html);
                            if (editorRef.current) setDescription(editorRef.current.innerHTML);
                            
                            setShowImagePopup(false);
                            setImageUrlInput('');
                          }}
                          className="text-blue-600 text-[13px] font-medium px-2 hover:text-blue-700 cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Video Popover Button */}
                  <div className="relative flex items-center">
                    <button 
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const selection = window.getSelection();
                        if (selection && selection.rangeCount > 0) {
                          setSavedRange(selection.getRangeAt(0));
                        }
                        setShowVideoPopup(!showVideoPopup);
                        setShowLinkPopup(false);
                        setShowImagePopup(false);
                        setShowFormatPopup(false);
                      }} 
                      className={`p-1.5 rounded-md transition-colors ${showVideoPopup ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-200'}`}
                    >
                      <Video className="w-4 h-4" strokeWidth={2.5} />
                    </button>

                    {showVideoPopup && (
                      <div className="absolute top-[120%] left-0 bg-white border border-[#D1D5DB] shadow-lg rounded-md p-1.5 flex items-center gap-2 z-[50] w-[320px]">
                        <span className="text-[13px] text-slate-700 font-medium pl-1 whitespace-nowrap">Enter video:</span>
                        <input 
                          type="text" 
                          placeholder="Embed URL" 
                          value={videoUrlInput}
                          onChange={e => setVideoUrlInput(e.target.value)}
                          className="flex-1 border border-[#D1D5DB] rounded-[4px] px-2 py-1.5 text-[13px] outline-none focus:border-blue-500 transition-colors"
                          autoFocus
                        />
                        <button 
                          onMouseDown={(e) => {
                            e.preventDefault();
                            if (!videoUrlInput) return;
                            
                            if (savedRange) {
                              const selection = window.getSelection();
                              selection?.removeAllRanges();
                              selection?.addRange(savedRange);
                            }

                            let embedUrl = videoUrlInput;
                            const iframeMatch = videoUrlInput.match(/src="([^"]+)"/);
                            if (iframeMatch) {
                              embedUrl = iframeMatch[1];
                            } else if (videoUrlInput.includes('youtube.com/watch?v=')) {
                              embedUrl = `https://www.youtube.com/embed/${videoUrlInput.split('v=')[1].split('&')[0]}`;
                            } else if (videoUrlInput.includes('youtu.be/')) {
                              embedUrl = `https://www.youtube.com/embed/${videoUrlInput.split('youtu.be/')[1].split('?')[0]}`;
                            } else if (videoUrlInput.includes('vimeo.com/')) {
                              embedUrl = `https://player.vimeo.com/video/${videoUrlInput.split('vimeo.com/')[1].split('?')[0]}`;
                            }

                            const html = `<div contenteditable="false" style="margin: 16px 0; text-align: center;"><iframe src="${embedUrl}" width="100%" height="315" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius: 8px; max-width: 100%;"></iframe></div><p><br></p>`;
                            
                            document.execCommand('insertHTML', false, html);
                            if (editorRef.current) setDescription(editorRef.current.innerHTML);
                            
                            setShowVideoPopup(false);
                            setVideoUrlInput('');
                          }}
                          className="text-blue-600 text-[13px] font-medium px-2 hover:text-blue-700 cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <style>{`
                  .custom-editor h1 {
                    font-size: 36px !important;
                    font-weight: 800 !important;
                    letter-spacing: -0.025em !important;
                    line-height: 1.2 !important;
                    margin-top: 0.5em !important;
                    margin-bottom: 0.25em !important;
                  }
                  .custom-editor h2 {
                    font-size: 26px !important;
                    font-weight: 700 !important;
                    margin-top: 0.5em !important;
                    margin-bottom: 0.25em !important;
                  }
                  .custom-editor h3 {
                    font-size: 20px !important;
                    font-weight: 700 !important;
                    margin-top: 0.5em !important;
                    margin-bottom: 0.25em !important;
                  }
                  .custom-editor > *:first-child {
                    margin-top: 0 !important;
                  }
                `}</style>
                <div 
                  ref={editorRef}
                  contentEditable
                  onInput={() => {
                    if (editorRef.current) {
                      setDescription(editorRef.current.innerHTML);
                    }
                  }}
                  className="custom-editor flex-1 p-4 text-[14px] text-slate-900 focus:outline-none overflow-y-auto prose prose-sm max-w-none prose-p:my-1"
                  style={{ minHeight: '200px' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Customize Page (Thumbnail) */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-[22px] font-medium text-slate-900 mb-6">Personnaliser la page produit</h2>
            
            <div className="space-y-8">
              <div>
                <label className="block text-[13px] font-medium text-slate-900 mb-2">Ajouter une vignette <span className="text-slate-400 font-normal">ⓘ</span></label>
                
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={imageInputRef} 
                  onChange={handleImageChange} 
                  className="hidden" 
                />

                <div 
                  onClick={() => imageInputRef.current?.click()}
                  className="w-[200px] h-[200px] border border-[#E5E7EB] bg-[#F9FAFB] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors relative overflow-hidden group shadow-sm"
                >
                  {coverPreview ? (
                    <>
                      <img src={coverPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                         <span className="text-white text-sm font-medium">Changer</span>
                      </div>
                    </>
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
                  )}
                </div>
                <p className="text-[12px] text-slate-500 mt-3 leading-relaxed max-w-[350px]">
                  Créez une vignette mémorable qui représente votre produit. Utilisez une image carrée (minimum 600x600px) au format JPG ou PNG pour de meilleurs résultats.
                </p>
              </div>

              {/* Banner Mock */}
              <div>
                <label className="block text-[13px] font-medium text-slate-900 mb-2">Ajouter une bannière <span className="text-slate-400 font-normal">ⓘ</span></label>
                <div className="w-full h-[160px] border border-[#E5E7EB] bg-[#F9FAFB] rounded-xl flex items-center justify-center border-dashed cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
                  <ImageIcon className="w-6 h-6 text-slate-400" strokeWidth={1.5} />
                </div>
                <p className="text-[12px] text-slate-500 mt-3 leading-relaxed max-w-lg">
                  Créez une bannière attrayante qui met en valeur votre produit. Utilisez une image rectangulaire de haute qualité (minimum 709x260px) au format JPG ou PNG pour de meilleurs résultats.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Content Upload */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-[22px] font-medium text-slate-900 mb-6">Ajoutez le contenu du produit</h2>
            
            <div>
              <label className="block text-[14px] font-medium text-slate-900 mb-3">Télécharger le contenu du produit</label>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />

              <div className="w-full border border-[#E5E7EB] bg-[#F9FAFB] border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
                
                {productFile ? (
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="font-semibold text-slate-900 text-[14px]">{productFile.name}</div>
                    <div className="text-[12px] text-slate-500 mt-1 mb-4">{(productFile.size / 1024 / 1024).toFixed(2)} MB</div>
                    <button 
                      onClick={() => setProductFile(null)}
                      className="text-[13px] font-medium text-red-500 hover:text-red-600"
                    >
                      Supprimer et choisir un autre fichier
                    </button>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-[#F59E0B] hover:bg-[#D97706] text-white px-5 py-2 rounded-md text-[13px] font-semibold transition-colors flex items-center gap-2 mb-3"
                    >
                      <UploadIcon /> Choisir un fichier
                    </button>
                    <p className="text-[12px] text-slate-500 max-w-[280px]">
                      Ajoutez des fichiers à votre produit pour que les clients puissent les télécharger après l'achat.
                    </p>
                  </>
                )}

              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Review and Publish */}
        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-[22px] font-medium text-slate-900 mb-6">Vérifier et publier</h2>
            
            <div className="bg-[#F9FAFB] rounded-xl p-5 border border-[#E5E7EB] mb-6 shadow-sm">
              <h3 className="text-[15px] font-bold text-slate-900 mb-4">Résumé du produit</h3>
              
              <div className="space-y-2">
                <div className="bg-white rounded-lg p-3 border border-[#E5E7EB]">
                  <div className="text-[11px] text-slate-500 font-semibold mb-0.5 uppercase tracking-wide">Nom du produit</div>
                  <div className="text-[14px] font-medium text-slate-900">{title || 'Non renseigné'}</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-[#E5E7EB]">
                  <div className="text-[11px] text-slate-500 font-semibold mb-0.5 uppercase tracking-wide">Catégorie</div>
                  <div className="text-[14px] font-medium text-slate-900">{category || 'Non renseignée'}</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-[#E5E7EB]">
                  <div className="text-[11px] text-slate-500 font-semibold mb-0.5 uppercase tracking-wide">Modèle de tarification</div>
                  <div className="text-[14px] font-medium text-slate-900">{pricingModel}</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-[#E5E7EB]">
                  <div className="text-[11px] text-slate-500 font-semibold mb-0.5 uppercase tracking-wide">Prix</div>
                  <div className="text-[14px] font-medium text-slate-900">{price || '0'} FCFA</div>
                </div>
              </div>
            </div>

            <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg p-3 flex items-center gap-3">
               <div className="w-5 h-5 rounded-full bg-[#10B981] flex items-center justify-center text-white shrink-0">
                 <CheckCircle2 className="w-3.5 h-3.5" />
               </div>
               <div>
                 <div className="text-[13px] font-bold text-[#065F46]">Prêt à publier</div>
                 <div className="text-[12px] text-[#047857]">Votre produit sera disponible dans votre boutique une fois publié.</div>
               </div>
            </div>

          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="mt-8 flex items-center justify-center gap-3">
          {step > 1 ? (
            <button 
              onClick={prevStep}
              className="px-5 py-2 rounded-md text-[13px] font-semibold text-slate-700 bg-white border border-[#D1D5DB] hover:bg-slate-50 transition-colors shadow-sm"
            >
              Retour
            </button>
          ) : (
            <button 
              onClick={() => navigate({ to: '/admin/products/create' })}
              className="px-5 py-2 rounded-md text-[13px] font-semibold text-slate-700 bg-white border border-[#D1D5DB] hover:bg-slate-50 transition-colors shadow-sm"
            >
              Annuler
            </button>
          )}

          {step < totalSteps ? (
            <button 
              onClick={nextStep}
              disabled={!isStepValid()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-[13px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Continuer
            </button>
          ) : (
            <button 
              onClick={handlePublish}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-[13px] font-semibold flex items-center gap-2 transition-colors disabled:opacity-70 shadow-sm"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Publier
            </button>
          )}
        </div>

      </div>

      {/* IA Modal */}
      {showIAImproveModal && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[500px] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-fuchsia-500" />
                <h3 className="font-bold text-[15px] text-slate-900">Améliorer la description</h3>
              </div>
              <button onClick={() => setShowIAImproveModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Mots-clés</label>
                <input 
                  type="text" 
                  value={iaKeywords}
                  onChange={(e) => setIaKeywords(e.target.value)}
                  className="w-full border border-[#D1D5DB] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-bold border border-slate-200">x</div>
                  Instructions spéciales
                </label>
                <input 
                  type="text" 
                  value={iaInstructions}
                  onChange={(e) => setIaInstructions(e.target.value)}
                  placeholder="Ajoutez des exigences spécifiques ou des points d'attention"
                  className="w-full border border-[#D1D5DB] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Tonalité de la description</label>
                <select 
                  value={iaTone}
                  onChange={(e) => setIaTone(e.target.value)}
                  className="w-full border border-[#D1D5DB] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 appearance-none bg-white"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em' }}
                >
                  <option value="Persuasif">Persuasif</option>
                  <option value="Convaincant">Convaincant</option>
                  <option value="Professionnel">Professionnel</option>
                  <option value="Amical">Amical</option>
                </select>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={generateIADescription}
                  disabled={isGenerating}
                  className="bg-[#FFB800] hover:bg-[#E6A600] text-slate-900 font-semibold px-5 py-2 rounded-lg text-[13px] transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Générer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
