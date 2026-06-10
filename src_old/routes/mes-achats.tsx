import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';

export const Route = createFileRoute('/mes-achats')({
  component: MesAchatsLayout,
});

function MesAchatsLayout() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const s = localStorage.getItem('buyer_session');
    if (!s) {
      navigate({ to: '/buyer-login' });
      return;
    }
    setSession(JSON.parse(s));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('buyer_session');
    navigate({ to: '/buyer-login' });
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1E293B] flex items-center justify-center">
              <span className="text-white font-bold text-[14px]">T</span>
            </div>
            <span className="font-bold text-[16px] text-slate-900 hidden sm:block">TECHNOVALearning</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[13px] font-bold text-slate-600">
                {session.customerName?.charAt(0).toUpperCase() || session.email?.charAt(0).toUpperCase()}
              </div>
              <span className="text-[13px] font-medium text-slate-700 hidden sm:block">
                {session.customerName || session.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="py-8 text-center text-[13px] text-slate-400">
        Propulsé par <span className="font-bold">TechnovaLearning</span>
      </footer>
    </div>
  );
}
