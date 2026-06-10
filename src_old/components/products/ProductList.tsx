import { ShoppingCart, Star } from 'lucide-react';
import localProducts from '@/data/products.json';

export const ProductList = () => {
  const products = localProducts;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 mb-4">
          Nos <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Programmes Phares</span>
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto text-lg">
          Découvre les formations les plus demandées sur le marché de la tech africaine. Apprends des compétences concrètes et rentables.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product: any) => (
          <div key={product.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group flex flex-col">
            <div className="relative h-60 overflow-hidden">
              <img 
                src={product.image_url} 
                alt={product.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-blue-700 shadow-sm">
                {product.category}
              </div>
            </div>
            
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-1 mb-3 text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <span className="text-slate-400 text-xs ml-1">(4.9/5)</span>
              </div>
              
              <h3 className="font-display font-bold text-xl text-slate-900 mb-2 leading-tight">
                {product.title}
              </h3>
              <p className="text-slate-500 text-sm mb-6 flex-grow">
                {product.description}
              </p>
              
              <div className="space-y-2 mb-6">
                {product.features?.map((feat: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {feat}
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-2xl font-bold text-slate-900">
                  {product.price.toLocaleString('fr-FR')} <span className="text-base text-slate-500">FCFA</span>
                </span>
                <button className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
