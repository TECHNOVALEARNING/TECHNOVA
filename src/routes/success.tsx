import { createFileRoute, Link } from '@tanstack/react-router';
import { Header, Footer } from '@/components/site/shared';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const Route = createFileRoute('/success')({
  component: SuccessPage,
});

function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 pt-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Paiement réussi !</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Félicitations pour votre achat. Votre transaction a bien été validée et votre formation est maintenant débloquée.
          </p>
          <Link 
            to="/dashboard"
            className="w-full text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg"
            style={{ backgroundColor: '#034694', boxShadow: '0 8px 24px -8px rgba(3, 70, 148, 0.5)' }}
          >
            Accéder à ma formation
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
