import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    price: number;
    image_url: string;
  };
}

export function CheckoutDrawer({ isOpen, onClose, product }: CheckoutDrawerProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          firstName,
          lastName,
          email,
          phone
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error((data.error || 'Erreur de paiement') + (data.details ? ' - ' + JSON.stringify(data.details) : ''));
      }

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error('URL de paiement manquante');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Une erreur est survenue lors de la préparation du paiement.');
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
              <h2 className="text-lg font-bold text-gray-900">Finaliser votre achat</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <h3 className="font-semibold text-gray-900 mb-4">Informations personnelles</h3>
              
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Prénom *</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                      placeholder="Jean"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Nom *</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                      placeholder="Dupont"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Adresse email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="jean.dupont@email.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Numéro de téléphone (WhatsApp de préférence) *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="+229 00 00 00 00"
                  />
                </div>

                <div className="mt-8 bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 font-medium">Résumé</span>
                    <span className="font-bold text-gray-900">{product.price.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                    </div>
                    <span className="line-clamp-2">{product.title}</span>
                  </div>
                </div>
              </form>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="w-full bg-[#0047b3] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#003d99] transition-colors disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Redirection...
                    </>
                  ) : (
                    'Payer maintenant'
                  )}
                </button>
                <div className="flex items-center justify-center gap-1 mt-3 text-[11px] text-gray-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                  <span>En cliquant sur "Payer maintenant", vous acceptez nos termes et conditions. Paiement 100% sécurisé.</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
