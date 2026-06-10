import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, X, UploadCloud, Loader2, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export const Route = createFileRoute('/admin/settings/seo')({
  component: SeoSettingsPage,
});

// A component to display keywords as tags
function KeywordsInput({ keywords, setKeywords }: { keywords: string[], setKeywords: (k: string[]) => void }) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!keywords.includes(inputValue.trim())) {
        setKeywords([...keywords, inputValue.trim()]);
      }
      setInputValue('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter(k => k !== keywordToRemove));
  };

  return (
    <div className="space-y-3">
      <input 
        type="text" 
        placeholder="Entrez des mots clés (Appuyez sur Entrée)" 
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-[14px]"
      />
      
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {keywords.map(keyword => (
            <div key={keyword} className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-[13px] text-slate-700 shadow-sm">
              <span>{keyword}</span>
              <button 
                onClick={() => removeKeyword(keyword)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SeoSettingsPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const storeId = 'default_store'; // On utilise un ID unique pour le moment

  // Charger les données SEO au démarrage
  useEffect(() => {
    const fetchSeo = async () => {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('seo')
          .eq('id', storeId)
          .single();
          
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = pas trouvé
        
        if (data?.seo) {
          setTitle(data.seo.title || '');
          setDescription(data.seo.description || '');
          setKeywords(data.seo.keywords || []);
          setThumbnail(data.seo.thumbnail || '');
        }
      } catch (err) {
        console.error('Erreur de chargement SEO:', err);
      }
    };
    
    fetchSeo();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const seoData = { title, description, keywords, thumbnail };
      
      const { error } = await supabase
        .from('store_settings')
        .upsert({ 
          id: storeId, 
          seo: seoData 
        }, { onConflict: 'id' });
        
      if (error) throw error;
      
      setMessage('Paramètres SEO enregistrés avec succès !');
      setTimeout(() => window.location.reload(), 1500);
      
    } catch (err: any) {
      console.error(err);
      setMessage('Erreur (N\'oubliez pas d\'ajouter la colonne "seo" JSONB dans la table store_settings)');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <a href="/admin/settings" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <h1 className="text-2xl font-bold text-slate-900">SEO</h1>
        </div>
      </div>

      <div className="space-y-12">
        {/* Aperçu Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-[17px] font-bold text-slate-900 mb-2">Aperçu</h2>
          </div>
          <div className="md:col-span-2">
            <div className="flex justify-end mb-4">
              <button className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 text-purple-700 px-4 py-2 rounded-full text-[13px] font-semibold hover:shadow-sm transition-all">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Optimiser le SEO avec l'IA
              </button>
            </div>
            
            <div className="bg-white rounded-[20px] p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-6 items-center">
              {/* Fake thumbnail */}
              <div className="w-48 h-32 bg-blue-600 text-white flex items-center justify-center font-bold text-5xl rounded-xl shrink-0 overflow-hidden relative">
                {thumbnail ? (
                  <img src={thumbnail} alt="SEO Thumbnail" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                    {title ? title.substring(0, 2).toUpperCase() : 'DE'}
                  </>
                )}
              </div>
              
              {/* Google Search Result Preview */}
              <div className="flex-1 min-w-0">
                <h3 className="text-[18px] text-[#1a0dab] group-hover:underline cursor-pointer font-medium truncate">
                  {title || 'Titre de votre boutique - Slogan accrocheur'}
                </h3>
                <p className="text-[13px] text-[#006621] mb-1 truncate">
                  https://votreboutique.com
                </p>
                <p className="text-[13px] text-[#545454] line-clamp-2 leading-relaxed">
                  {description || 'Découvrez notre boutique de produits au design unique. Qualité et style pour tous. Explorez nos créations exclusives dès aujourd\'hui.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Titre et Meta description */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-[17px] font-bold text-slate-900 mb-2">Titre et Meta description</h2>
            <p className="text-[13px] text-slate-500 leading-relaxed pr-4">
              Le titre et la description apparaissent dans les résultats de recherche en mettant la description qui correspond le plus à votre audience.
            </p>
          </div>
          <div className="md:col-span-2 space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Titre</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-[14px]"
                placeholder="Ex: Ma Super Boutique | Produits de Luxe"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Description</label>
              <textarea 
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-[14px] resize-none"
                placeholder="Ex: Découvrez la meilleure sélection de produits de luxe..."
              ></textarea>
            </div>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Miniature */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-[17px] font-bold text-slate-900 mb-2">Miniature</h2>
            <p className="text-[13px] text-slate-500 leading-relaxed pr-4">
              Donnez un aperçu du contenu du lien sur lequel vos prospects s'apprêtent à cliquer. Pour une meilleure présentation, veuillez respecter le format d'image suivant : 1200 x 627px
            </p>
          </div>
          <div className="md:col-span-2">
            <div className="border-2 border-dashed border-slate-200 rounded-2xl bg-[#fafafa] p-8 flex flex-col items-center justify-center text-center group hover:bg-slate-50 hover:border-blue-300 transition-colors cursor-pointer relative overflow-hidden">
              {thumbnail ? (
                <>
                  <img src={thumbnail} alt="Thumbnail preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                  <div className="relative z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-slate-700">Image sélectionnée</p>
                    <button onClick={(e) => { e.stopPropagation(); setThumbnail(''); }} className="text-xs text-red-500 font-semibold mt-1">Supprimer</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <p className="text-[14px] font-medium text-slate-700 mb-1">
                    Cliquez pour ajouter une image
                  </p>
                  <p className="text-[12px] text-slate-500">
                    SVG, PNG, JPG ou GIF (max. 5MB)
                  </p>
                </>
              )}
            </div>
            {/* Dans un vrai système, on utiliserait le Storage Supabase. Ici, on simule l'input avec une URL pour faire simple. */}
            <div className="mt-4">
               <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Ou entrez l'URL de l'image (pour tester)</label>
               <input 
                type="text" 
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-[14px]"
                placeholder="https://..."
              />
            </div>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Mots clés */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-[17px] font-bold text-slate-900 mb-2">Mots clés</h2>
            <p className="text-[13px] text-slate-500 leading-relaxed pr-4">
              Spécifiez les informations de votre boutique telles que les titres, les descriptions et métadonnées afin d'améliorer votre positionnement sur les moteurs de recherche.
            </p>
          </div>
          <div className="md:col-span-2">
            <KeywordsInput keywords={keywords} setKeywords={setKeywords} />
          </div>
        </section>
        
        {/* Save Button */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100">
          <div className="text-[13px] font-medium text-blue-600">
            {message}
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-[#fafafa] hover:bg-[#f0f0f0] border border-slate-200 text-slate-900 font-semibold px-6 py-2.5 rounded-full transition-colors text-[14px] flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
        
      </div>
    </div>
  );
}
