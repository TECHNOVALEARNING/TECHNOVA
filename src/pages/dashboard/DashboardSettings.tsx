import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, User, Palette, Settings, ExternalLink, Activity, Globe, Send, Scale, ArrowRight, ShieldCheck, CreditCard, Search } from "lucide-react";
import DashboardProfileTab from "@/components/dashboard/DashboardProfileTab";
import DashboardAppearanceTab from "@/components/dashboard/DashboardAppearanceTab";
import DashboardAccountTab from "@/components/dashboard/DashboardAccountTab";
import DashboardPixelsTab from "@/components/dashboard/DashboardPixelsTab";
import DashboardDomainTab from "@/components/dashboard/DashboardDomainTab";
import DashboardTelegramTab from "@/components/dashboard/DashboardTelegramTab";
import DashboardLegalTab from "@/components/dashboard/DashboardLegalTab";
import DashboardOrderLookupTab from "@/components/dashboard/DashboardOrderLookupTab";
import { useActiveStore } from "@/hooks/useActiveStore";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const translations = {
  fr: {
    title: "Paramètres",
    detailedConfig: "Configuration détaillée",
    subtitle: "Gérer votre boutique, votre apparence et votre compte",
    visitStore: "Visiter la boutique",
    catStore: "Boutique",
    catMarketing: "Marketing & Communication",
    catAccount: "Compte & Sécurité",
    tabProfileTitle: "Identité de la boutique",
    tabProfileDesc: "Définissez le nom, le logo et la description de votre boutique.",
    tabAppearanceTitle: "Apparence & Thème",
    tabAppearanceDesc: "Modifiez le thème, les couleurs et la mise en page.",
    tabDomainTitle: "Nom de domaine",
    tabDomainDesc: "Connectez et personnalisez le domaine de votre boutique.",
    tabLegalTitle: "Pages légales",
    tabLegalDesc: "Gérer vos mentions légales, politique de confidentialité, etc.",
    tabOrdersTitle: "Recherche Commande",
    tabOrdersDesc: "Recherchez et gérez les commandes via leur numéro.",
    tabPixelsTitle: "Pixels & Tracking",
    tabPixelsDesc: "Connectez Facebook Pixel, GTM et ajoutez vos scripts de suivi.",
    tabTelegramTitle: "Notifications Telegram",
    tabTelegramDesc: "Gérer les alertes pour suivre l'activité de votre boutique.",
    tabAccountTitle: "Mon Profil & KYC",
    tabAccountDesc: "Gérer vos informations personnelles et vérifiez votre identité.",
  },
  en: {
    title: "Settings",
    detailedConfig: "Detailed configuration",
    subtitle: "Manage your shop, appearance, and account",
    visitStore: "Visit Shop",
    catStore: "Shop",
    catMarketing: "Marketing & Communication",
    catAccount: "Account & Security",
    tabProfileTitle: "Shop Identity",
    tabProfileDesc: "Define the name, logo, and description of your shop.",
    tabAppearanceTitle: "Appearance & Theme",
    tabAppearanceDesc: "Modify the theme, colors, and layout.",
    tabDomainTitle: "Domain Name",
    tabDomainDesc: "Connect and customize your shop's domain.",
    tabLegalTitle: "Legal Pages",
    tabLegalDesc: "Manage your legal notices, privacy policy, etc.",
    tabOrdersTitle: "Order Lookup",
    tabOrdersDesc: "Search and manage orders by their number.",
    tabPixelsTitle: "Pixels & Tracking",
    tabPixelsDesc: "Connect Facebook Pixel, GTM, and add tracking scripts.",
    tabTelegramTitle: "Telegram Notifications",
    tabTelegramDesc: "Manage alerts to track your shop's activity.",
    tabAccountTitle: "My Profile & KYC",
    tabAccountDesc: "Manage your personal information and verify your identity.",
  }
};

const VALID_TABS = ["profile", "appearance", "pixels", "account", "domain", "telegram", "legal", "orders"];

const DashboardSettings = () => {
  const { activeStore } = useActiveStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const navigate = useNavigate();

  const [lang, setLang] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem("technova_lang") || "fr") : "fr");

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem("technova_lang") || "fr");
    window.addEventListener("technova_lang_changed", handleLangChange);
    return () => window.removeEventListener("technova_lang_changed", handleLangChange);
  }, []);

  const t = translations[lang === 'en' ? 'en' : 'fr'];
  
  const activeTab = tabParam && VALID_TABS.includes(tabParam) ? tabParam : null;

  const categories = [
    {
      title: t.catStore,
      items: [
        { id: "profile", title: t.tabProfileTitle, desc: t.tabProfileDesc, icon: User },
        { id: "appearance", title: t.tabAppearanceTitle, desc: t.tabAppearanceDesc, icon: Palette },
        { id: "domain", title: t.tabDomainTitle, desc: t.tabDomainDesc, icon: Globe },
        { id: "legal", title: t.tabLegalTitle, desc: t.tabLegalDesc, icon: Scale },
        { id: "orders", title: t.tabOrdersTitle, desc: t.tabOrdersDesc, icon: Search },
      ]
    },
    {
      title: t.catMarketing,
      items: [
        { id: "pixels", title: t.tabPixelsTitle, desc: t.tabPixelsDesc, icon: Activity },
        { id: "telegram", title: t.tabTelegramTitle, desc: t.tabTelegramDesc, icon: Send },
      ]
    },
    {
      title: t.catAccount,
      items: [
        { id: "account", title: t.tabAccountTitle, desc: t.tabAccountDesc, icon: ShieldCheck },
      ]
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "profile": return <DashboardProfileTab />;
      case "appearance": return <DashboardAppearanceTab />;
      case "pixels": return <DashboardPixelsTab />;
      case "account": return <DashboardAccountTab />;
      case "domain": return <DashboardDomainTab />;
      case "telegram": return <DashboardTelegramTab />;
      case "legal": return <DashboardLegalTab />;
      case "orders": return <DashboardOrderLookupTab />;
      default: return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] w-full pb-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            {activeTab && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-full bg-muted/50 hover:bg-muted shrink-0" 
                onClick={() => setSearchParams({})}
              >
                <ArrowLeft className="h-4 w-4 text-foreground" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl sm:text-[26px] font-bold text-foreground tracking-tight">{t.title}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {activeTab ? t.detailedConfig : t.subtitle}
              </p>
            </div>
          </div>

          {activeStore?.slug && !activeTab && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-full shadow-sm"
              onClick={() => window.open(`https://technovalearning.com/store/${activeStore.slug}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              {t.visitStore}
            </Button>
          )}
        </div>

        {/* Dynamic Content */}
        {!activeTab ? (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {categories.map((category) => (
              <div key={category.title}>
                <h2 className="text-lg font-serif font-semibold text-foreground mb-4 pl-1">{category.title}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSearchParams({ tab: item.id })}
                      className="group cursor-pointer p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(37,99,235,0.08)] hover:border-blue-100 transition-all duration-300 flex flex-col items-center justify-center gap-2 sm:gap-3 text-center aspect-square sm:aspect-auto sm:min-h-[160px]"
                    >
                      <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-xl sm:rounded-2xl bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:scale-105 transition-all duration-300">
                        <item.icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.5} />
                      </div>
                      <div className="w-full">
                        <h3 className="font-semibold text-[13px] sm:text-[15px] text-gray-900 group-hover:text-blue-700 transition-colors leading-tight px-1">
                          {item.title}
                        </h3>
                        <p className="hidden sm:block text-[13px] text-gray-500 mt-1.5 leading-relaxed line-clamp-2">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-2 duration-300">
            {renderContent()}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardSettings;
