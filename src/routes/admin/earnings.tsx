import { createFileRoute } from '@tanstack/react-router';
import { adminSupabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { FileText, Loader2, CreditCard } from 'lucide-react';

export const Route = createFileRoute('/admin/earnings')({
  component: AdminEarnings,
});

function AdminEarnings() {
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const { data: orders, error } = await adminSupabase
          .from('orders')
          .select('amount, status');

        if (error) throw error;

        let total = 0;
        if (orders) {
          orders.forEach(order => {
            if (order.status === 'paid') {
              total += (order.amount || 0);
            }
          });
        }
        setTotalEarnings(total);
      } catch (err) {
        console.error("Erreur de récupération des revenus:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  return (
    <div className="w-full pb-12 font-sans space-y-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 mt-4">
        <h2 className="text-[24px] font-semibold text-slate-900">Revenus</h2>
        <button className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-[14px] font-semibold rounded-full transition-colors border border-slate-200">
          Retirer des fonds
        </button>
      </div>

      {/* BALANCE CARD */}
      <div className="bg-white rounded-[24px] overflow-hidden p-8 border border-slate-100 shadow-sm relative min-h-[300px] flex flex-col justify-between">
        <div>
          <div className="text-[14px] font-medium text-slate-500 mb-2">Solde disponible</div>
          <div className="text-[40px] font-display font-semibold text-slate-900 leading-none">
            {loading ? <Loader2 className="w-8 h-8 animate-spin text-slate-300" /> : `${totalEarnings.toLocaleString('fr-FR')} FCFA`}
          </div>
        </div>
        
        {/* Placeholder for chart */}
        <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end px-8 pb-8 opacity-20">
          {/* A simple decorative bar chart mockup */}
          <div className="w-full h-full flex items-end gap-2">
            {[20, 40, 30, 60, 50, 80, 40, 90, 70, 100, 60, 80].map((height, i) => (
              <div key={i} className="flex-1 bg-slate-300 rounded-t-sm" style={{ height: `${height}%` }}></div>
            ))}
          </div>
        </div>
      </div>

      {/* WITHDRAWALS HISTORY */}
      <div className="bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-[16px] font-semibold text-slate-900">Retraits précédents</h3>
        </div>
        <div className="py-24 flex flex-col items-center justify-center">
          <div className="w-[56px] h-[56px] bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
            <FileText className="w-6 h-6 text-slate-400" />
          </div>
          <h4 className="text-[15px] font-medium text-slate-700">Aucun retrait effectué.</h4>
          <p className="text-[13px] text-slate-500 mt-1 max-w-sm text-center">
            Vos demandes de retrait apparaîtront ici une fois que vous en aurez effectué.
          </p>
        </div>
      </div>

    </div>
  );
}
