import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Zap, ShieldCheck, DownloadCloud, PlayCircle, Users, Calendar, Check } from 'lucide-react';

export const Route = createFileRoute('/admin/products/create')({
  component: CreateProductTypePage,
});

type ProductType = 'fichier' | 'formation' | 'service';

const productTypes = [
  {
    id: 'fichier' as ProductType,
    title: 'Fichiers',
    image: '/file_icon.png',
    color: '#FFB800', 
    borderClass: 'border-[#FFB800]',
    description: 'E-books, templates, fichiers audio : vos clients téléchargent instantanément après achat.',
    features: [
      { icon: Zap, text: 'Livraison automatique' },
      { icon: DownloadCloud, text: 'Tous formats acceptés (PDF, ZIP, MP3, etc.)' },
      { icon: ShieldCheck, text: 'Protection anti-piratage intégrée' }
    ]
  },
  {
    id: 'formation' as ProductType,
    title: 'Formations',
    image: '/course_icon.png',
    color: '#3B82F6', 
    borderClass: 'border-blue-500',
    description: 'Créez un espace membre privé avec des modules, des leçons vidéo et des quiz.',
    features: [
      { icon: PlayCircle, text: 'Hébergement vidéo inclus' },
      { icon: Users, text: 'Espace membre sécurisé' },
      { icon: ShieldCheck, text: 'Suivi de progression des élèves' }
    ]
  },
  {
    id: 'service' as ProductType,
    title: 'Services',
    image: '/service_icon.png',
    color: '#475569', 
    borderClass: 'border-slate-600',
    description: 'Vendez vos prestations, consultations, coaching ou travaux en freelance.',
    features: [
      { icon: Calendar, text: 'Prise de rendez-vous facile' },
      { icon: Zap, text: 'Paiement sécurisé à la commande' },
      { icon: FileTextIcon, text: 'Gestion des livrables' } // Fixed icon for FileText
    ]
  }
];

// Helper icon
function FileTextIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <line x1="10" y1="9" x2="8" y2="9"></line>
    </svg>
  );
}

function CreateProductTypePage() {
  const [selectedType, setSelectedType] = useState<ProductType>('fichier');
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate({ to: '/admin/products/new', search: { type: selectedType } as any });
  };

  const selectedData = productTypes.find(p => p.id === selectedType);

  return (
    <div className="max-w-[800px] mx-auto pb-20 pt-8 font-sans px-4">
      
      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-[28px] font-display font-bold text-slate-900 mb-3">
          Quel type de produit désirez-vous créer ?
        </h1>
        <p className="text-slate-500 text-sm max-w-lg mx-auto">
          Sélectionnez la catégorie qui correspond le mieux à ce que vous souhaitez vendre.
        </p>
      </div>

      {/* Cards Selection Grid */}
      <div className="flex flex-wrap justify-center gap-6 mb-12">
        {productTypes.map((type) => {
          const isSelected = selectedType === type.id;
          
          return (
            <div 
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`relative cursor-pointer rounded-2xl transition-all duration-300 w-[180px] h-[160px] bg-white flex flex-col p-4 border ${isSelected ? type.borderClass + ' shadow-md scale-105' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}
            >
              {/* Radio Button Absolute Top Right */}
              <div className="absolute top-3 right-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${isSelected ? type.borderClass + ' bg-white' : 'border-slate-300 bg-slate-50'}`}>
                  {isSelected && (
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center`} style={{ backgroundColor: type.color }}>
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
              </div>

              {/* 3D Generated Icon */}
              <div className="flex-1 flex items-center justify-center mb-2 mt-2">
                <img 
                  src={type.image} 
                  alt={type.title}
                  className={`object-contain transition-all duration-300 ${isSelected ? 'w-20 h-20' : 'w-16 h-16 opacity-70 grayscale-[30%]'}`}
                  style={{ mixBlendMode: 'multiply' }}
                />
              </div>

              {/* Title */}
              <h3 className={`text-center text-[14px] font-bold mt-auto ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                {type.title}
              </h3>
            </div>
          );
        })}
      </div>

      {/* Selected Type Details */}
      {selectedData && (
        <div className="max-w-[600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-[#f8f9fa] rounded-2xl p-8 border border-slate-200 shadow-sm">
            
            <h2 className="text-xl font-bold text-slate-900 mb-2">{selectedData.title}</h2>
            <p className="text-[#6b7280] text-[15px] mb-8 leading-relaxed">
              {selectedData.description}
            </p>

            <div className="space-y-4 mb-10">
              {selectedData.features.map((feature, idx) => {
                const FeatureIcon = feature.icon;
                return (
                  <div key={idx} className="flex items-center gap-3 text-slate-600">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center bg-white shadow-sm border border-slate-100">
                      <FeatureIcon className="w-3.5 h-3.5 text-slate-500" strokeWidth={2.5} />
                    </div>
                    <span className="text-[14px] font-medium text-slate-600">{feature.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Changed to main blue color of the site */}
            <button 
              onClick={handleContinue}
              className="w-full py-3.5 px-6 rounded-xl text-white font-bold text-[15px] transition-all hover:-translate-y-0.5 shadow-md hover:shadow-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
            >
              Continuer
            </button>
          </div>
          
          <div className="text-center mt-6">
            <a href="#" className="text-xs text-slate-400 hover:text-blue-600 font-medium transition-colors">
              Besoin d'aide pour choisir ? <span className="underline">Consultez notre guide</span>
            </a>
          </div>
        </div>
      )}

    </div>
  );
}
