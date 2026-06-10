import { createFileRoute, Link } from '@tanstack/react-router';
import { Settings, Globe, Code2, Users, HeadphonesIcon, ArrowRight } from 'lucide-react';

export const Route = createFileRoute('/admin/settings/')({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="w-full pb-12 font-sans">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[24px] font-display font-semibold text-slate-900 mb-1">Paramètres</h1>
        <p className="text-slate-500 text-[14px]">Gérez les préférences de votre boutique Technova.</p>
      </div>

      <div className="space-y-12">
        {/* Section: Boutique */}
        <section>
          <h2 className="text-[20px] font-display font-medium text-slate-800 mb-6">Boutique</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <SettingCard 
              icon={<Settings className="w-5 h-5 text-pink-600" />}
              iconBg="bg-pink-100"
              title="Identité de la boutique"
              description="Définissez le nom, le logo, la description et les réseaux sociaux de votre boutique."
              to="/admin/settings/identity"
            />

          </div>
        </section>

        {/* Section: Marketing */}
        <section>
          <h2 className="text-[20px] font-display font-medium text-slate-800 mb-6">Marketing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <SettingCard 
              icon={<Globe className="w-5 h-5 text-blue-600" />}
              iconBg="bg-blue-100"
              title="SEO & Référencement"
              description="Optimisez les titres, descriptions et métadonnées pour les moteurs de recherche."
              to="/admin/settings/seo"
            />

            <SettingCard 
              icon={<Code2 className="w-5 h-5 text-emerald-600" />}
              iconBg="bg-emerald-100"
              title="Pixels et Tracking"
              description="Connectez Facebook Pixel, Google Tag Manager, TikTok Pixel et ajoutez vos scripts."
              to="/admin/settings/tracking"
            />

          </div>
        </section>

        {/* Section: Avancé / Équipe */}
        <section>
          <h2 className="text-[20px] font-display font-medium text-slate-800 mb-6">Général</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <SettingCard 
              icon={<HeadphonesIcon className="w-5 h-5 text-purple-600" />}
              iconBg="bg-purple-100"
              title="Support Client"
              description="Configurez votre adresse de contact et les messages d'aide pour vos clients."
              to="/admin/settings/support"
            />

            <SettingCard 
              icon={<Users className="w-5 h-5 text-amber-600" />}
              iconBg="bg-amber-100"
              title="Équipe & Collaborateurs"
              description="Invitez des membres de votre équipe et gérez leurs permissions."
              to="/admin/settings/team"
            />

          </div>
        </section>

      </div>
    </div>
  );
}

function SettingCard({ icon, iconBg, title, description, to }: { icon: React.ReactNode, iconBg: string, title: string, description: string, to: string }) {
  // Now we have the SEO page, we can link directly to the provided "to" prop.
  // For pages that don't exist yet (like Identity, Support, Team), they will just do a hard reload to a 404 or their placeholder.
  
  return (
    <a href={to} className="bg-[#fafafa] hover:bg-[#f0f0f0] transition-colors cursor-pointer rounded-[20px] p-5 flex items-start justify-between group">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <div className="flex flex-col mt-0.5">
          <h3 className="text-[15px] font-semibold text-slate-900 mb-1">{title}</h3>
          <p className="text-[13px] text-slate-500 leading-relaxed pr-4">
            {description}
          </p>
        </div>
      </div>
      <div className="flex-shrink-0 mt-3 mr-1 text-slate-400 group-hover:text-slate-700 transition-colors">
        <ArrowRight className="w-5 h-5" />
      </div>
    </a>
  );
}
