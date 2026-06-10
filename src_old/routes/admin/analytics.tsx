import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Filter, Info, ChevronDown, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Route = createFileRoute('/admin/analytics')({
  component: AnalyticsPage,
});

const TABS = ['Résumé', 'Ventes', 'Visites', 'Clients', 'Taux de conversion'];

// Mock data based on user screenshots
const visitData = [
  { date: 'mai 06', visits: 0 },
  { date: 'mai 08', visits: 0 },
  { date: 'mai 10', visits: 0 },
  { date: 'mai 12', visits: 0 },
  { date: 'mai 14', visits: 0 },
  { date: 'mai 16', visits: 0 },
  { date: 'mai 18', visits: 0 },
  { date: 'mai 20', visits: 0 },
  { date: 'mai 22', visits: 0 },
  { date: 'mai 24', visits: 0 },
  { date: 'mai 26', visits: 0 },
  { date: 'mai 28', visits: 0 },
  { date: 'mai 30', visits: 0 },
  { date: 'juin 01', visits: 0 },
  { date: 'juin 03', visits: 0 },
  { date: 'juin 05', visits: 0 },
];

const revenueData = visitData.map(d => ({ date: d.date, revenue: d.visits * 1500 }));

function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('Résumé');

  return (
    <div className="max-w-[1200px] mx-auto pb-12 font-sans space-y-6">
      
      {/* Top Bar with Date Picker */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between shadow-sm max-w-3xl">
          <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
            <Calendar className="w-4 h-4 text-slate-400" />
            May 6, 2026 - June 5, 2026
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
        <button className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 shadow-sm relative">
          <Filter className="w-4 h-4" />
          <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-2
              ${activeTab === tab 
                ? 'bg-slate-100 text-slate-900' 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
          >
            {tab === 'Résumé' && <span className="w-3 h-3 flex items-center justify-center border border-current rounded-sm text-[8px]">!</span>}
            {tab === 'Ventes' && <span className="w-2 h-2 rounded-full bg-emerald-400"></span>}
            {tab === 'Visites' && <span className="w-2 h-2 rounded-full bg-blue-400"></span>}
            {tab === 'Clients' && <span className="w-2 h-2 rounded-full bg-teal-400"></span>}
            {tab === 'Taux de conversion' && <span className="w-2 h-2 rounded-full bg-amber-400"></span>}
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        
        {/* TAB: RÉSUMÉ */}
        {activeTab === 'Résumé' && (
          <div className="space-y-6">
            {/* Ventes Section */}
            <div>
              <h3 className="text-lg font-display font-bold text-slate-900 mb-3">Ventes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card title="Revenu total" value="0 FCFA" />
                <Card title="Panier moyen" value="0 FCFA" />
                <Card title="Produits vendus" value="0" />
                <Card title="Total des ventes" value="0" />
              </div>
            </div>

            {/* Visites Section */}
            <div>
              <h3 className="text-lg font-display font-bold text-slate-900 mb-3">Visites</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card title="Nombre total de visites" value="0" />
                <Card title="Taux de conversion" value="0%" />
              </div>
            </div>

            {/* Clients Section */}
            <div>
              <h3 className="text-lg font-display font-bold text-slate-900 mb-3">Clients</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card title="Nombre total de clients" value="0" />
                <Card title="Nouveaux clients" value="0" />
              </div>
            </div>
          </div>
        )}

        {/* TAB: VENTES */}
        {activeTab === 'Ventes' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card title="Chiffre d'affaire" value="0 FCFA" />
              <Card title="Total des ventes" value="0" />
              <Card title="Total des produits vendus" value="0" />
              <Card title="Panier moyen" value="0 FCFA" />
              <Card title="Panier moyen des nouveaux clients" value="0 FCFA" />
              <Card title="Panier moyen des clients récurrents" value="0 FCFA" />
              <Card title="Conversion" value="0%" />
              <Card title="Panier abandonné" value="0%" />
              <Card title="Achat répété" value="0%" />
              <Card title="Fréquence d'achat" value="0" />
            </div>

            <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100">
              <h3 className="text-base font-bold text-slate-900 mb-6">Chiffre d'affaire quotidien</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(val) => `${val/1000}k`} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <ListCard title="Ventes par produit" items={[]} />
              <ListCard title="Ventes par pays" items={[]} />
            </div>
          </div>
        )}

        {/* TAB: VISITES */}
        {activeTab === 'Visites' && (
          <div className="space-y-6">
            <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100 relative">
              <div className="absolute top-6 right-6">
                <Info className="w-5 h-5 text-slate-400" />
              </div>
              <div className="text-4xl font-display font-bold text-slate-900 mb-1">0</div>
              <div className="text-sm font-medium text-slate-500">Nombre total de visites</div>
            </div>

            <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100">
              <h3 className="text-base font-bold text-slate-900 mb-6">Visites quotidiennes</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={visitData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="visits" stroke="#FBBF24" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ListCard title="Visites par pays" hasBars items={[]} />
              
              <ListCard title="Appareils" hasBars items={[]} />
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-6 mb-6 border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 border-b-2 border-slate-900 pb-2 -mb-[2px]">Sources de trafic (Medium)</h3>
                  <h3 className="text-sm font-semibold text-slate-500 pb-2">Sources de trafic</h3>
                  <h3 className="text-sm font-semibold text-slate-500 pb-2">Référents</h3>
                </div>
                <div className="space-y-4">
                  <div className="text-center text-slate-500 text-sm py-4">
                    Aucune donnée disponible pour la période sélectionnée
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CLIENTS & TAUX (Empty states for now) */}
        {(activeTab === 'Clients' || activeTab === 'Taux de conversion') && (
          <div className="py-20 text-center bg-white rounded-[1.5rem] border border-slate-100">
            <p className="text-slate-500 font-medium">Données détaillées en cours de collecte...</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Subcomponents
function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100 relative">
      <div className="absolute bottom-6 right-6">
        <Info className="w-4 h-4 text-slate-400" />
      </div>
      <div className="text-3xl font-display font-bold text-slate-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-slate-500 pr-8">{title}</div>
    </div>
  );
}

function ListCard({ title, items, hasBars }: { title: string, items: any[], hasBars?: boolean }) {
  return (
    <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100">
      <h3 className="text-base font-bold text-slate-900 mb-6">{title}</h3>
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center text-slate-500 text-sm py-4">
            Aucune donnée disponible
          </div>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {item.img && <img src={item.img} className="w-10 h-10 rounded-lg object-cover" alt="" />}
                {item.flag && <span className="text-xl">{item.flag}</span>}
                {item.icon && <span className="text-xl">{item.icon}</span>}
                
                <div className="flex flex-col w-full">
                  {hasBars ? (
                    <div className="flex items-center h-8 rounded bg-blue-50 w-full relative overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 bg-blue-100 transition-all" style={{ width: `${item.pct}%` }}></div>
                      <span className="relative z-10 text-sm font-medium text-slate-700 px-3">{item.label}</span>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-bold text-slate-900">{item.label}</span>
                      {item.sub && <span className="text-xs text-slate-500">{item.sub}</span>}
                    </>
                  )}
                </div>
              </div>
              <div className="text-sm font-bold text-slate-600 pl-4 text-right">
                {item.value}
              </div>
            </div>
          ))
        )}
      </div>
      {items.length > 3 && (
        <div className="mt-6 text-center">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            Voir tout
          </button>
        </div>
      )}
    </div>
  );
}
