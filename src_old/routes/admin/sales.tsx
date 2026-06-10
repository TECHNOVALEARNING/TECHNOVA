import { createFileRoute } from '@tanstack/react-router';
import { Search, Filter, CheckCircle2, XCircle, CircleSlash, ExternalLink, FileText, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { adminSupabase } from '@/lib/supabase';

export const Route = createFileRoute('/admin/sales')({
  component: SalesPage,
});

type SaleStatus = 'Terminé' | 'Réglé' | 'Abandonné' | 'Échoué' | 'En attente';

interface Sale {
  id: string;
  productImage?: string;
  productName: string;
  isDigitalFile?: boolean;
  clientInitials: string;
  clientName: string;
  clientEmail: string;
  price: number;
  status: SaleStatus;
  date: string;
  rawDate: Date;
}

const StatusBadge = ({ status }: { status: SaleStatus }) => {
  switch (status) {
    case 'Terminé':
    case 'Réglé':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-[#E8F8EE]/80 text-[#1D9F57] border border-[#1D9F57]/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {status}
        </span>
      );
    case 'En attente':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-amber-50 text-amber-600 border border-amber-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {status}
        </span>
      );
    case 'Abandonné':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
          <CircleSlash className="w-3.5 h-3.5" />
          {status}
        </span>
      );
    case 'Échoué':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-[#F4F0FF]/80 text-[#6B46C1] border border-[#E9D8FD]">
          <XCircle className="w-3.5 h-3.5" />
          {status}
        </span>
      );
    default:
      return null;
  }
};

function SalesPage() {
  const [activeFilter, setActiveFilter] = useState('Tout');
  const [searchQuery, setSearchQuery] = useState('');
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const filters = [
    { label: 'Tout', dotColor: 'bg-slate-500' },
    { label: 'En attente', dotColor: 'bg-amber-400' },
    { label: 'Terminé', dotColor: 'bg-emerald-500' },
    { label: 'Réglé', dotColor: 'bg-emerald-700' },
  ];

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const { data: ordersData, error: ordersError } = await adminSupabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        const { data: productsData } = await adminSupabase
          .from('products')
          .select('*');

        const productMap = new Map();
        if (productsData) {
          productsData.forEach(p => {
            productMap.set(p.title, p);
            productMap.set(p.id, p);
          });
        }

        const mappedSales: Sale[] = (ordersData || []).map(order => {
          const product = productMap.get(order.product_id);
          const rawDate = new Date(order.created_at || Date.now());
          
          let status: SaleStatus = 'En attente';
          if (order.status === 'paid') status = 'Terminé'; // Forcing to 'Terminé' like Chariow for paid items
          if (order.status === 'failed') status = 'Échoué';
          if (order.status === 'abandoned') status = 'Abandonné';

          const firstName = order.customer_name?.split(' ')[0] || '';
          const lastName = order.customer_name?.split(' ').slice(1).join(' ') || '';
          const clientInitials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'C';

          return {
            id: order.id,
            productName: product ? product.title : (order.product_id || 'Produit inconnu'),
            productImage: product ? product.image_url : undefined,
            isDigitalFile: product ? product.features?.includes('fichier') : true,
            clientInitials,
            clientName: order.customer_name || 'Client',
            clientEmail: order.customer_email || 'email@inconnu.com',
            price: order.amount || 0,
            status,
            date: rawDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
            rawDate
          };
        });

        setSales(mappedSales);
      } catch (err) {
        console.error("Erreur récupération des ventes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  const filteredSales = sales.filter(sale => {
    const matchesFilter = activeFilter === 'Tout' || sale.status === activeFilter;
    const matchesSearch = sale.productName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sale.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sale.clientEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="w-full pb-12 font-sans">
      
      {/* Container principal */}
      <div className="bg-white rounded-[24px] overflow-hidden">
        
        {/* Top bar avec Recherche */}
        <div className="p-4 flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-11 pr-12 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-sm"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              <Filter className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        {/* Ligne des Filtres */}
        <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto border-b border-slate-100">
          {filters.map(filter => (
            <button
              key={filter.label}
              onClick={() => setActiveFilter(filter.label)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-colors whitespace-nowrap ${
                activeFilter === filter.label 
                  ? 'bg-slate-100 text-slate-900' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${filter.dotColor}`}></span>
              {filter.label}
            </button>
          ))}
        </div>

        {/* Liste des ventes */}
        <div className="flex flex-col">
          {loading ? (
            <div className="py-24 flex justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="py-24 text-center px-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <FileText className="w-6 h-6 text-slate-300" />
              </div>
              <h3 className="text-lg font-display font-semibold text-slate-900 mb-1">Aucune vente trouvée</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                {searchQuery || activeFilter !== 'Tout' ? "Aucun résultat ne correspond à votre recherche." : "Dès que vous commencerez à ajouter des produits et générer du trafic, vos ventes, paiements échoués et paniers abandonnés apparaîtront ici."}
              </p>
            </div>
          ) : (
            filteredSales.map((sale, idx) => (
              <div key={sale.id} className={`grid grid-cols-5 gap-4 px-6 py-4 items-center hover:bg-slate-50/80 transition-colors group ${idx !== filteredSales.length - 1 ? 'border-b border-slate-100' : ''}`}>
                
                {/* Colonne Produit (prend plus de place) */}
                <div className="col-span-2 flex items-center gap-3">
                  {sale.productImage ? (
                    <div className="relative w-[42px] h-[42px] rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-100">
                      <img src={sale.productImage} alt={sale.productName} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-[42px] h-[42px] rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 font-medium text-slate-900 text-[14px]">
                    {sale.productName}
                    <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  </div>
                </div>

                {/* Colonne Client */}
                <div className="col-span-1 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-600 flex-shrink-0 border border-slate-200">
                    {sale.clientInitials}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-slate-900">{sale.clientName}</span>
                    <span className="text-[12px] text-slate-500 truncate max-w-[150px]">{sale.clientEmail}</span>
                  </div>
                </div>

                {/* Colonne Prix & Statut */}
                <div className="col-span-1 flex items-center justify-end gap-6">
                  <div className="text-[13px] font-medium text-slate-900 whitespace-nowrap">
                    {sale.price === 0 ? '0 FCFA' : `${sale.price.toLocaleString('fr-FR')} FCFA`}
                  </div>
                  <div className="w-24 flex justify-start">
                    <StatusBadge status={sale.status} />
                  </div>
                </div>

                {/* Colonne Date */}
                <div className="col-span-1 flex justify-end text-[13px] text-slate-600 font-medium">
                  {sale.date}
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
