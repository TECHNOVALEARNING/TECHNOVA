import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, Loader2, Save } from 'lucide-react';
import { adminSupabase } from '@/lib/supabase';

export const Route = createFileRoute('/admin/settings/tracking')({
  component: TrackingSettingsPage,
});

function TrackingSettingsPage() {
  const [pixels, setPixels] = useState({
    gtm: { enabled: false, value: '' },
    facebook: { enabled: false, value: '' },
    fbConversion: { enabled: false, value: '' },
    tiktok: { enabled: false, value: '' },
    customJs: { enabled: false, value: '' }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data, error } = await adminSupabase
          .from('store_settings')
          .select('pixels')
          .eq('id', 'default')
          .single();
          
        if (data && data.pixels) {
          setPixels(data.pixels);
        }
      } catch (err) {
        console.error("Impossible de charger (la table store_settings n'existe pas encore ?)", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleToggle = (key: keyof typeof pixels) => {
    setPixels(prev => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled }
    }));
  };

  const handleChange = (key: keyof typeof pixels, value: string) => {
    setPixels(prev => ({
      ...prev,
      [key]: { ...prev[key], value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const { error } = await adminSupabase
        .from('store_settings')
        .upsert({ id: 'default', pixels });
        
      if (error) throw error;
      setMessage('Paramètres enregistrés avec succès !');
      
      // Force un rechargement dur de la page après 1.5 secondes pour satisfaire le besoin d'un "vrai" rafraîchissement
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (err: any) {
      console.error(err);
      setMessage('Erreur : ' + (err.message || 'Impossible de sauvegarder'));
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="w-full pb-12 font-sans max-w-5xl mx-auto">
      
      {/* Top Header with Back Button */}
      <div className="flex items-center gap-4 mb-10 border-b border-slate-100 pb-6">
        <Link to="/admin/settings" className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-[20px] font-display font-semibold text-slate-900">Paramètres des pixels</h1>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Left Column: Description */}
        <div className="w-full lg:w-1/3">
          <h2 className="text-[18px] font-semibold text-slate-900 mb-3">Pixels</h2>
          <p className="text-[14px] text-slate-500 leading-relaxed mb-3">
            Ajoutez des pixels de suivi comme Facebook Pixel, Google Tag Manager, TikTok Pixel et du code JavaScript personnalisé pour surveiller les performances de votre boutique.
          </p>
          <a href="#" className="text-[13px] text-slate-900 underline underline-offset-2 hover:text-slate-600 transition-colors">
            En savoir plus
          </a>
        </div>

        {/* Right Column: Settings */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6 relative">
          
          {loading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center backdrop-blur-sm rounded-xl">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          )}
          
          {/* GTM */}
          <PixelItem 
            icon={<GoogleTagManagerIcon />}
            title="ID Google Tag Manager"
            description="Ajoutez votre ID Google Tag Manager pour suivre le trafic de votre boutique"
            enabled={pixels.gtm.enabled}
            onToggle={() => handleToggle('gtm')}
          >
            <div className="mt-4 ml-[52px]">
              <label className="block text-[13px] text-slate-700 mb-1.5">ID Google Tag Manager</label>
              <input 
                type="text" 
                value={pixels.gtm.value}
                onChange={(e) => handleChange('gtm', e.target.value)}
                placeholder="GTM-XXXXXXX"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
              />
            </div>
          </PixelItem>

          {/* Facebook Pixel */}
          <PixelItem 
            icon={<FacebookIcon />}
            title="ID Pixel Facebook"
            description="Ajoutez votre ID Pixel Facebook pour suivre le trafic de votre boutique"
            enabled={pixels.facebook.enabled}
            onToggle={() => handleToggle('facebook')}
          >
            <div className="mt-4 ml-[52px]">
              <label className="block text-[13px] text-slate-700 mb-1.5">ID Pixel Facebook</label>
              <input 
                type="text" 
                value={pixels.facebook.value}
                onChange={(e) => handleChange('facebook', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all font-medium text-slate-800"
              />
            </div>
          </PixelItem>

          {/* Facebook Conversions API */}
          <PixelItem 
            icon={<FacebookIcon />}
            title="Jeton d'API de Conversion Facebook"
            description="Ajoutez votre Jeton d'API de Conversion Facebook pour améliorer le suivi des conversions"
            enabled={pixels.fbConversion.enabled}
            onToggle={() => handleToggle('fbConversion')}
          >
            <div className="mt-4 ml-[52px]">
              <label className="block text-[13px] text-slate-700 mb-1.5">Jeton d'API de Conversion Facebook</label>
              <input 
                type="text" 
                value={pixels.fbConversion.value}
                onChange={(e) => handleChange('fbConversion', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all font-medium text-slate-800"
              />
            </div>
          </PixelItem>

          {/* TikTok Pixel */}
          <PixelItem 
            icon={<TikTokIcon />}
            title="ID Pixel TikTok"
            description="Ajoutez votre ID Pixel TikTok pour suivre le trafic et les conversions de votre boutique"
            enabled={pixels.tiktok.enabled}
            onToggle={() => handleToggle('tiktok')}
          >
            <div className="mt-4 ml-[52px]">
              <label className="block text-[13px] text-slate-700 mb-1.5">ID Pixel TikTok</label>
              <input 
                type="text" 
                value={pixels.tiktok.value}
                onChange={(e) => handleChange('tiktok', e.target.value)}
                placeholder="Ex: CXXXXX..."
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
              />
            </div>
          </PixelItem>

          {/* Custom JS */}
          <PixelItem 
            icon={<JsIcon />}
            title="Code JavaScript personnalisé"
            description="Ajoutez du code JavaScript personnalisé à votre boutique pour suivre les événements de conversion et améliorer l'expérience client."
            enabled={pixels.customJs.enabled}
            onToggle={() => handleToggle('customJs')}
          >
            <div className="mt-4 ml-[52px]">
              <label className="block text-[13px] text-slate-700 mb-1.5">Code JavaScript personnalisé</label>
              <textarea 
                value={pixels.customJs.value}
                onChange={(e) => handleChange('customJs', e.target.value)}
                placeholder="<script>...</script>"
                rows={4}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
              />
            </div>
          </PixelItem>

          <div className="flex items-center justify-between mt-4">
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
    </div>
  );
}

// Reusable component for each pixel setting
function PixelItem({ icon, title, description, enabled, onToggle, children }: { icon: React.ReactNode, title: string, description: string, enabled: boolean, onToggle: () => void, children?: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-start gap-4">
        {/* Custom Toggle / Status Button */}
        <button 
          onClick={onToggle}
          className={`flex-shrink-0 w-9 h-5 rounded-full relative transition-colors mt-1 focus:outline-none ${enabled ? 'bg-slate-900' : 'bg-slate-100 border border-slate-200'}`}
        >
          <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform flex items-center justify-center ${enabled ? 'translate-x-4' : 'translate-x-0'}`}>
            {enabled ? (
              <Check className="w-2.5 h-2.5 text-slate-900" strokeWidth={3} />
            ) : (
              <X className="w-2.5 h-2.5 text-slate-400" strokeWidth={2.5} />
            )}
          </div>
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              {icon}
            </div>
            <h3 className="text-[14px] font-semibold text-slate-800">{title}</h3>
          </div>
          <p className="text-[13px] text-slate-400 leading-relaxed pr-8">
            {description}
          </p>
        </div>
      </div>
      
      {/* Collapsible Content */}
      <div className={`transition-all duration-300 overflow-hidden ${enabled ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );
}

// Pixel Perfect SVGs instead of generated images for ultra-professional look
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-blue-600" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 16.9913 5.65684 21.1283 10.4375 21.881V14.8906H7.89844V12H10.4375V9.79688C10.4375 7.29063 11.9305 5.90625 14.2146 5.90625C15.3088 5.90625 16.4531 6.10156 16.4531 6.10156V8.5625H15.1921C13.95 8.5625 13.5625 9.33334 13.5625 10.1242V12H16.3359L15.8926 14.8906H13.5625V21.881C18.3432 21.1283 22 16.9913 22 12Z" fill="currentColor"/>
    </svg>
  );
}

function GoogleTagManagerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-500" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" opacity="0.8" />
      <path d="M12 22l-10-5v-5l10 5 10-5v5l-10 5z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-900" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.37-3.4-5.74.04-1.92 1.09-3.75 2.75-4.76 1.45-.85 3.21-1.15 4.88-.86.13.02.26.04.39.06V15.7c-.16-.04-.32-.07-.48-.09-1.19-.18-2.45.17-3.32 1.01-.84.81-1.21 2.05-1.02 3.22.18 1.15 1.04 2.14 2.15 2.52 1.18.4 2.53.25 3.58-.41.97-.61 1.62-1.63 1.76-2.77.1-1.05.04-2.11.04-3.16V.02h4.2z" />
    </svg>
  );
}

function JsIcon() {
  return (
    <div className="w-5 h-5 bg-[#F7DF1E] flex items-end justify-end p-0.5 rounded-sm">
      <span className="text-[10px] font-bold text-black leading-none tracking-tighter">JS</span>
    </div>
  );
}
