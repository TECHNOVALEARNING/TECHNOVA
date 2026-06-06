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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F8EE] text-[#1D9F57]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {status}
        </span>
      );
    case 'En attente':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {status}
        </span>
      );
    case 'Abandonné':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
          <CircleSlash className="w-3.5 h-3.5" />
          {status}
        </span>
      );
    case 'Échoué':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F4F0FF] text-[#6B46C1] border border-[#E9D8FD]">
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
    { label: 'Tout', color: 'bg-slate-400' },
    { label: 'En attente', color: 'bg-amber-400' },
    { label: 'Réglé', color: 'bg-emerald-500' },
    { label: 'Échoué', color: 'bg-purple-500' },
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
            productMap.set(p.title, p); // Map by title since product_id in orders seems to be the title based on customers.tsx
            productMap.set(p.id, p); // Also map by ID just in case
          });
        }

        const mappedSales: Sale[] = (ordersData || []).map(order => {
          const product = productMap.get(order.product_id);
          const rawDate = new Date(order.created_at || Date.now());
          
          let status: SaleStatus = 'En attente';
          if (order.status === 'paid') status = 'Réglé';
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
            date: rawDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
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
    <div className="max-w-[1200px] mx-auto pb-12">
      
      {/* Container principal style Card */}
      <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Top bar avec Recherche */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher par client, email, produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-full pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-slate-300 transition-colors shadow-sm"
            />
          </div>
          <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Ligne des Filtres */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
          {filters.map(filter => (
            <button
              key={filter.label}
              onClick={() => setActiveFilter(filter.label)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
                activeFilter === filter.label 
                  ? 'bg-slate-100 text-slate-900' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${filter.color}`}></span>
              {filter.label}
            </button>
          ))}
        </div>

        {/* En-têtes du tableau */}
        <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr] gap-4 px-6 py-4 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
          <div>Produit</div>
          <div>Client</div>
          <div>Prix</div>
          <div>Statut</div>
          <div>Date</div>
        </div>

        {/* Liste des ventes */}
        <div className="divide-y divide-slate-100">
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
            filteredSales.map((sale) => (
              <div key={sale.id} className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr] gap-4 px-6 py-4 items-center hover:bg-slate-50/50 transition-colors group">
                
                {/* Colonne Produit */}
                <div className="flex items-center gap-3">
                  {sale.productImage ? (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-100">
                      <img src={sale.productImage} alt={sale.productName} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 font-medium text-slate-900 text-sm">
                    {sale.productName}
                    {sale.isDigitalFile && <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </div>
                </div>

                {/* Colonne Client */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0 border border-slate-200">
                    {sale.clientInitials}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-900">{sale.clientName}</span>
                    <span className="text-xs text-slate-500">{sale.clientEmail}</span>
                  </div>
                </div>

                {/* Colonne Prix */}
                <div className="text-sm font-medium text-slate-900">
                  {sale.price === 0 ? '0 FCFA' : `${sale.price.toLocaleString('fr-FR')} FCFA`}
                </div>

                {/* Colonne Statut */}
                <div>
                  <StatusBadge status={sale.status} />
                </div>

                {/* Colonne Date */}
                <div className="text-xs text-slate-600 font-medium">
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
