import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Search, Calendar, Mail, MessageSquare, Phone, CheckCircle2, ShoppingBag, Tag, CreditCard, CalendarDays, Download, X, Edit2, FileText, Loader2 } from 'lucide-react';
import { adminSupabase } from '@/lib/supabase';

export const Route = createFileRoute('/admin/customers')({
  component: CustomersPage,
});

// Types based on the required UI structure
interface CustomerPurchase {
  id: string;
  productName: string;
  productImage?: string;
  price: number;
  status: 'Réglé' | 'Échoué' | 'En attente';
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  joinedDate: string;
  avatarUrl?: string;
  stats: {
    totalSales: number;
    totalRevenue: number;
    totalDiscounts: number;
    averageCart: number;
    firstPurchaseDate: string;
    lastPurchaseDate: string;
    totalProducts: number;
    totalDownloads: number;
  };
  purchases: CustomerPurchase[];
}

function CustomersPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data: orders, error } = await adminSupabase.from('orders').select('*');
        if (error) throw error;
        
        const customerMap = new Map<string, Customer>();

        (orders || []).forEach(order => {
          const email = order.customer_email;
          if (!email) return;

          if (!customerMap.has(email)) {
            customerMap.set(email, {
              id: email,
              firstName: order.customer_name?.split(' ')[0] || 'Client',
              lastName: order.customer_name?.split(' ').slice(1).join(' ') || '',
              email: email,
              phone: order.customer_phone || '',
              joinedDate: new Date(order.created_at || Date.now()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
              stats: {
                totalSales: 0,
                totalRevenue: 0,
                totalDiscounts: 0,
                averageCart: 0,
                firstPurchaseDate: order.created_at || new Date().toISOString(),
                lastPurchaseDate: order.created_at || new Date().toISOString(),
                totalProducts: 0,
                totalDownloads: 0
              },
              purchases: []
            });
          }

          const customer = customerMap.get(email)!;
          
          customer.purchases.push({
            id: order.id,
            productName: order.product_id || 'Produit',
            price: order.amount || 0,
            status: order.status === 'paid' ? 'Réglé' : order.status === 'failed' ? 'Échoué' : 'En attente'
          });

          if (order.status === 'paid') {
            customer.stats.totalSales += 1;
            customer.stats.totalRevenue += (order.amount || 0);
            customer.stats.totalProducts += 1;
          }

          if (order.created_at) {
            if (new Date(order.created_at) < new Date(customer.stats.firstPurchaseDate)) {
              customer.stats.firstPurchaseDate = order.created_at;
            }
            if (new Date(order.created_at) > new Date(customer.stats.lastPurchaseDate)) {
              customer.stats.lastPurchaseDate = order.created_at;
            }
          }
        });

        const finalCustomers = Array.from(customerMap.values()).map(c => {
          c.stats.averageCart = c.stats.totalSales > 0 ? Math.round(c.stats.totalRevenue / c.stats.totalSales) : 0;
          c.stats.firstPurchaseDate = new Date(c.stats.firstPurchaseDate).toLocaleDateString('fr-FR');
          c.stats.lastPurchaseDate = new Date(c.stats.lastPurchaseDate).toLocaleDateString('fr-FR');
          return c;
        });

        setCustomers(finalCustomers);
      } catch (err) {
        console.error("Erreur récupération clients:", err);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Function to safely get initials
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase() || 'C';
  };

  const filteredCustomers = customers.filter(c => 
    c.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.lastName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone && c.phone.includes(searchQuery))
  );

  return (
    <div className="w-full pb-12 font-sans relative flex">
      
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${selectedCustomer ? 'pr-[400px]' : ''}`}>
        
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
             <h1 className="text-[20px] font-display font-semibold text-slate-900">Clients</h1>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72 hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Trouvez n'importe quoi..."
                className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-4 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
              />
            </div>
            <div className="w-full sm:w-auto bg-white border border-slate-200 rounded-full px-4 py-2 flex items-center justify-between shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-2 text-slate-600 text-[13px] font-medium whitespace-nowrap">
                <Calendar className="w-4 h-4 text-slate-400" />
                Toutes les dates
              </div>
            </div>
          </div>
        </div>

        {/* Customers Table container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
          
          {/* Table Headers */}
          <div className="grid grid-cols-[2fr_1fr_100px] gap-4 px-6 py-4 border-b border-slate-100 text-[13px] font-semibold text-slate-500">
            <div>Nom du client</div>
            <div>Date d'ajout</div>
            <div className="text-right">Actions</div>
          </div>

          {/* Table Body */}
          <div className="flex flex-col">
            {loading ? (
              <div className="py-24 flex justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="py-24 text-center px-4 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                  <FileText className="w-6 h-6 text-slate-300" />
                </div>
                <h3 className="text-[15px] font-medium text-slate-700 mb-1">Aucun client trouvé</h3>
                <p className="text-slate-500 text-[13px] max-w-sm mx-auto">
                  {searchQuery ? "Aucun client ne correspond à votre recherche." : "Vos futurs clients apparaîtront ici dès qu'ils auront effectué une tentative d'achat."}
                </p>
              </div>
            ) : (
              filteredCustomers.map((customer, idx) => (
                <div 
                  key={customer.id} 
                  onClick={() => setSelectedCustomer(customer)}
                  className={`grid grid-cols-[2fr_1fr_100px] gap-4 px-6 py-3 items-center hover:bg-slate-50/50 transition-colors cursor-pointer group ${idx !== filteredCustomers.length - 1 ? 'border-b border-slate-100' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    {customer.avatarUrl ? (
                      <img src={customer.avatarUrl} alt={customer.firstName} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 flex-shrink-0">
                        {getInitials(customer.firstName, customer.lastName)}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-slate-800 line-clamp-1">
                        {customer.firstName} {customer.lastName}
                      </span>
                      <span className="text-[13px] text-slate-500">{customer.email}</span>
                    </div>
                  </div>
                  <div className="text-[13px] text-slate-600">
                    {customer.joinedDate}
                  </div>
                  <div className="flex items-center justify-end">
                    <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors">
                      <Mail className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Pagination mockup */}
          {filteredCustomers.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-center gap-4">
              <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                <span className="text-lg">‹</span>
              </button>
              <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                <span className="text-lg">›</span>
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Side Slide-Over Modal for Customer Details */}
      {selectedCustomer && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity xl:hidden"
            onClick={() => setSelectedCustomer(null)}
          />
          <div className="fixed top-[73px] right-0 bottom-0 w-[400px] bg-white border-l border-slate-200 shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out">
            
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold text-slate-900">
                  {selectedCustomer.firstName} {selectedCustomer.lastName}
                </h2>
                <button 
                  onClick={() => setSelectedCustomer(null)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Edit Email Button */}
              <button className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 mb-6">
                <Edit2 className="w-4 h-4" />
                Changer l'email
              </button>

              {/* Customer Profile Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {selectedCustomer.avatarUrl ? (
                      <img src={selectedCustomer.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-lg font-bold text-slate-600">
                        {getInitials(selectedCustomer.firstName, selectedCustomer.lastName)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{selectedCustomer.firstName} {selectedCustomer.lastName}</span>
                        <div className="cursor-pointer text-slate-400 hover:text-slate-600"><FileText className="w-3.5 h-3.5" /></div>
                      </div>
                      <div className="text-xs text-slate-500">Client depuis le {selectedCustomer.joinedDate}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors">
                      <MessageSquare className="w-4 h-4" /> {/* Assuming WhatsApp icon here */}
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Mail className="w-4 h-4" /> Email
                    </div>
                    <div className="flex items-center gap-2 font-medium text-slate-900">
                      {selectedCustomer.email}
                      <div className="cursor-pointer text-slate-400 hover:text-slate-600"><FileText className="w-3.5 h-3.5" /></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Phone className="w-4 h-4" /> Téléphone
                    </div>
                    <div className="flex items-center gap-2 font-medium text-slate-900">
                      {selectedCustomer.phone || 'Non renseigné'}
                      {selectedCustomer.phone && <div className="cursor-pointer text-slate-400 hover:text-slate-600"><FileText className="w-3.5 h-3.5" /></div>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Grid */}
              <h3 className="font-bold text-slate-900 mb-4">Statistiques</h3>
              <div className="grid grid-cols-2 gap-3 mb-8">
                <StatCard icon={<ShoppingBag />} label="Ventes" value={selectedCustomer.stats.totalSales.toString()} color="bg-emerald-50 text-emerald-600" />
                <StatCard icon={<CreditCard />} label="Revenu total" value={`${selectedCustomer.stats.totalRevenue} FCFA`} color="bg-blue-50 text-blue-600" />
                <StatCard icon={<Tag />} label="Réductions" value={`${selectedCustomer.stats.totalDiscounts} FCFA`} color="bg-amber-50 text-amber-600" />
                <StatCard icon={<CreditCard />} label="Panier moyen" value={`${selectedCustomer.stats.averageCart} FCFA`} color="bg-slate-50 text-slate-600" />
                <StatCard icon={<CalendarDays />} label="Premier achat" value={selectedCustomer.stats.firstPurchaseDate} color="bg-purple-50 text-purple-600" />
                <StatCard icon={<CalendarDays />} label="Dernier achat" value={selectedCustomer.stats.lastPurchaseDate} color="bg-pink-50 text-pink-600" />
                <StatCard icon={<ShoppingBag />} label="Produits" value={selectedCustomer.stats.totalProducts.toString()} color="bg-emerald-50 text-emerald-600" />
                <StatCard icon={<Download />} label="Téléchargements" value={selectedCustomer.stats.totalDownloads.toString()} color="bg-blue-50 text-blue-600" />
              </div>

              {/* Purchases List */}
              <h3 className="font-bold text-slate-900 mb-4">Achats</h3>
              <div className="space-y-3">
                {selectedCustomer.purchases.length === 0 ? (
                  <div className="text-center text-slate-500 text-sm py-4 border border-slate-100 rounded-xl bg-slate-50">
                    Aucun achat enregistré.
                  </div>
                ) : (
                  selectedCustomer.purchases.map(purchase => (
                    <div key={purchase.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        {purchase.productImage ? (
                          <img src={purchase.productImage} className="w-10 h-10 rounded-lg object-cover" alt="" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                        <span className="text-sm font-bold text-slate-900 line-clamp-1">{purchase.productName}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-bold text-slate-900">{purchase.price} FCFA</span>
                        {purchase.status === 'Réglé' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Réglé
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        </>
      )}

    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-6 h-6 rounded-md flex items-center justify-center [&>svg]:w-3.5 [&>svg]:h-3.5 ${color}`}>
          {icon}
        </div>
        <span className="text-xs font-semibold text-slate-500">{label}</span>
      </div>
      <div className="text-sm font-bold text-slate-900">{value}</div>
    </div>
  );
}
