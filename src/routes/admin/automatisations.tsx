import { createFileRoute } from '@tanstack/react-router';
import { adminSupabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Zap, Mail, Users, ArrowRight, Play, Check, X, Plus } from 'lucide-react';

export const Route = createFileRoute('/admin/automatisations')({
  component: Automations,
});

function Automations() {
  const [automations, setAutomations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Dialog
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState('purchase');
  const [actionType, setActionType] = useState('send_email');
  const [actionDetails, setActionDetails] = useState('');

  useEffect(() => {
    adminSupabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null));
  }, []);

  useEffect(() => {
    if (userId) loadAutomations();
  }, [userId]);

  const loadAutomations = async () => {
    setLoading(true);
    const { data, error } = await adminSupabase
      .from('automations')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });
    
    if (!error && data) setAutomations(data);
    setLoading(false);
  };

  const toggleAutomation = async (id: string, active: boolean) => {
    const { error } = await adminSupabase.from('automations').update({ is_active: active }).eq('id', id);
    if (!error) {
      setAutomations(automations.map(a => a.id === id ? { ...a, is_active: active } : a));
    }
  };

  const handleCreate = async () => {
    if (!name || !actionDetails) return toast.error('Veuillez remplir tous les champs');
    
    setSaving(true);
    try {
      const { data, error } = await adminSupabase.from('automations').insert({
        name,
        trigger_type: triggerType,
        action_type: actionType,
        action_details: actionDetails,
        creator_id: userId,
        is_active: true
      }).select().single();

      if (error) throw error;
      setAutomations([data, ...automations]);
      setShowDialog(false);
      toast.success('Automatisation créée !');
      
      setName('');
      setActionDetails('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteAutomation = async (id: string) => {
    if (!confirm('Supprimer cette automatisation ?')) return;
    const { error } = await adminSupabase.from('automations').delete().eq('id', id);
    if (!error) {
      setAutomations(automations.filter(a => a.id !== id));
      toast.success('Supprimée');
    }
  };


  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[24px] font-bold text-slate-900">Automatisations</h1>
            <p className="text-slate-500 mt-1">Automatisez vos tâches marketing et gagnez du temps.</p>
          </div>
          <button
            onClick={() => setShowDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1E293B] text-white text-[14px] font-semibold rounded-xl hover:bg-[#0F172A]"
          >
            <Plus className="w-4 h-4" /> Créer un flux
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Chargement...</div>
        ) : automations.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <Zap className="w-12 h-12 mx-auto text-amber-400 mb-4" />
            <h3 className="text-[18px] font-bold text-slate-900">Aucune automatisation</h3>
            <p className="text-[14px] text-slate-500 mt-2 mb-6 max-w-md mx-auto">
              Créez des scénarios automatiques (ex: envoyer un email de bienvenue après un achat).
            </p>
            <button
              onClick={() => setShowDialog(true)}
              className="px-6 py-2.5 bg-slate-100 text-slate-900 font-semibold rounded-xl hover:bg-slate-200 text-[14px]"
            >
              Créer mon premier flux
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {automations.map(auto => (
              <div key={auto.id} className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-slate-900 text-[16px]">{auto.name}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAutomation(auto.id, !auto.is_active)}
                      className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors ${auto.is_active ? 'bg-green-500' : 'bg-slate-200'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${auto.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[13px] font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex flex-col items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] uppercase block">Déclencheur</span>
                    {auto.trigger_type === 'purchase' ? 'Nouvel achat' : 
                     auto.trigger_type === 'abandoned_cart' ? 'Panier abandonné' : 'Inscription newsletter'}
                  </div>
                </div>

                <div className="flex justify-center my-2">
                  <ArrowRight className="w-4 h-4 text-slate-300 rotate-90" />
                </div>

                <div className="flex items-center gap-3 text-[13px] font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                  <div className="flex flex-col items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-600 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-slate-400 text-[11px] uppercase block">Action</span>
                    <span className="truncate block">
                      {auto.action_type === 'send_email' ? 'Envoyer email : ' : 'Ajouter au segment : '}
                      {auto.action_details}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
                   <button onClick={() => deleteAutomation(auto.id)} className="text-[12px] font-medium text-red-500 hover:text-red-700">Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* DIALOG */}
      {showDialog && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-[18px] font-bold">Nouveau flux automatisé</h2>
              <button onClick={() => setShowDialog(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4"/></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold mb-1">Nom du flux</label>
                <input value={name} onChange={e=>setName(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-[13px]" placeholder="Ex: Bienvenue nouveaux clients" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold mb-1">Quand ceci arrive (Déclencheur)</label>
                <select value={triggerType} onChange={e=>setTriggerType(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-[13px]">
                  <option value="purchase">Un client achète un produit</option>
                  <option value="abandoned_cart">Un client abandonne son panier (Bientôt)</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold mb-1">Faire ceci (Action)</label>
                <select value={actionType} onChange={e=>setActionType(e.target.value)} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-[13px] mb-2">
                  <option value="send_email">Envoyer un email automatique</option>
                </select>
                {actionType === 'send_email' && (
                  <textarea 
                    value={actionDetails} 
                    onChange={e=>setActionDetails(e.target.value)} 
                    className="w-full h-24 p-3 border border-slate-200 rounded-lg text-[13px] resize-none" 
                    placeholder="Sujet de l'email ou ID du template..." 
                  />
                )}
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={saving}
              className="w-full py-2.5 bg-[#1E293B] text-white font-bold rounded-xl hover:bg-[#0F172A] disabled:opacity-50"
            >
              {saving ? 'Création...' : 'Créer le flux'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
