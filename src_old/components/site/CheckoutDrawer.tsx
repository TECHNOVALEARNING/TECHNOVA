import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Gift, Tag, ChevronDown, ChevronUp, HelpCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import { COUNTRIES } from '@/lib/countries';
import { adminSupabase } from '@/lib/supabase';

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
  
  // Phone state
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES.find(c => c.code === 'BJ') || COUNTRIES[0]);
  const [isCountrySelectOpen, setIsCountrySelectOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  
  // Sections state
  const [showPromo, setShowPromo] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const countrySelectRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countrySelectRef.current && !countrySelectRef.current.contains(event.target as Node)) {
        setIsCountrySelectOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const fullPhone = `${selectedCountry.dialCode}${phone.replace(/^0+/, '')}`;

    if (product.price === 0) {
      setIsSubmitting(true);
      try {
        // 1. Create paid order for free
        const emailLower = email.trim().toLowerCase();
        const { data: order, error: orderError } = await adminSupabase.from('orders').insert({
          product_id: product.id,
          amount: 0,
          currency: 'XOF',
          status: 'paid',
          customer_name: `${firstName} ${lastName}`.trim(),
          customer_email: emailLower
        }).select().single();
        if (orderError) throw orderError;

        // 2. Log user in locally
        localStorage.setItem('buyer_session', JSON.stringify({
          email: emailLower,
          customerName: `${firstName} ${lastName}`.trim(),
          authenticatedAt: Date.now()
        }));

        toast.success('Accès débloqué avec succès !');
        window.location.href = `/success?purchaseId=${order.id}`;
      } catch (err: any) {
        toast.error("Erreur lors de l'accès au produit gratuit : " + err.message);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          firstName,
          lastName,
          email,
          phone: fullPhone
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error((data.error || 'Erreur de paiement') + (data.details ? ' - ' + JSON.stringify(data.details) : ''));
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error('URL de paiement manquante');
      }
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue lors de la préparation du paiement.');
      setIsSubmitting(false);
    }
  };

  const filteredCountries = COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) || 
    c.dialCode.includes(countrySearch)
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[480px] bg-white z-50 flex flex-col shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500 bg-gray-50"
                >
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-[15px] font-semibold text-gray-800">Finaliser votre achat</h2>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <HelpCircle className="w-3.5 h-3.5" /> Aide
              </button>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <h3 className="font-semibold text-[15px] text-gray-900 mb-5">Informations personnelles</h3>
              
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4 flex-1">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-gray-700 flex items-center gap-1">Prénom <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-gray-700 flex items-center gap-1">Nom <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-gray-700 flex items-center gap-1">Adresse email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all text-sm"
                  />
                </div>

                <div className="space-y-1.5 relative" ref={countrySelectRef}>
                  <label className="text-[13px] font-medium text-gray-700 flex items-center gap-1">Numéro de téléphone (WhatsApp de préférence) <span className="text-red-500">*</span></label>
                  <div className="flex relative rounded-lg border border-gray-200 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-all bg-white">
                    <button
                      type="button"
                      onClick={() => setIsCountrySelectOpen(!isCountrySelectOpen)}
                      className="flex items-center gap-1.5 pl-3.5 pr-2 py-2.5 bg-gray-50 border-r border-gray-200 hover:bg-gray-100 rounded-l-lg transition-colors"
                    >
                      <img 
                        src={`https://flagcdn.com/w20/${selectedCountry.code.toLowerCase()}.png`}
                        srcSet={`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png 2x`}
                        width="20"
                        alt={selectedCountry.name}
                        className="rounded-sm shrink-0"
                      />
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 w-full px-3.5 py-2.5 bg-transparent outline-none text-sm"
                      placeholder="Numéro de téléphone"
                    />
                  </div>

                  {/* Country Dropdown */}
                  <AnimatePresence>
                    {isCountrySelectOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute top-full left-0 mt-1 w-[280px] bg-white rounded-xl shadow-xl border border-gray-100 z-30 overflow-hidden"
                      >
                        <div className="p-2 border-b border-gray-50">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              value={countrySearch}
                              onChange={(e) => setCountrySearch(e.target.value)}
                              placeholder="Rechercher..."
                              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border-none rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {filteredCountries.map(country => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(country);
                                setIsCountrySelectOpen(false);
                                setCountrySearch('');
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
                            >
                              <img 
                                src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`}
                                srcSet={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png 2x`}
                                width="20"
                                alt={country.name}
                                className="rounded-sm shrink-0"
                              />
                              <span className="w-6 text-sm font-semibold text-gray-900">{country.code}</span>
                              <span className="flex-1 text-sm text-gray-600 truncate">{country.name}</span>
                              <span className="text-xs text-gray-400 font-medium">{country.dialCode}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="pt-2 space-y-3">
                  <button type="button" className="flex items-center gap-2 text-[13px] text-gray-700 font-medium hover:text-blue-600 transition-colors">
                    <Gift className="w-4 h-4" /> Offrir ce produit
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowPromo(!showPromo)}
                    className="flex items-center gap-2 text-[13px] text-gray-700 font-medium hover:text-blue-600 transition-colors"
                  >
                    <Tag className="w-4 h-4" /> Ajouter un code de réduction
                  </button>
                </div>

                <div className="mt-8 border-t border-gray-100 pt-6">
                  <button 
                    type="button"
                    onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                    className="w-full flex items-center justify-between py-2 text-sm font-bold text-gray-900"
                  >
                    <div className="flex items-center gap-2">
                      Résumé 
                      {isSummaryOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                    <span>{product.price > 0 ? `${product.price.toLocaleString('fr-FR')} FCFA` : 'Gratuit'}</span>
                  </button>

                  <AnimatePresence>
                    {isSummaryOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="py-4 space-y-4">
                          {showPromo && (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                                placeholder="Code de réduction"
                                className="flex-1 px-3.5 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all text-sm"
                              />
                              <button 
                                type="button"
                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                              >
                                Appliquer
                              </button>
                            </div>
                          )}

                          <div className="flex justify-between items-center text-[13px] text-gray-600">
                            <span>Sous-total</span>
                            <span className="font-semibold text-gray-900">{product.price > 0 ? `${product.price.toLocaleString('fr-FR')} FCFA` : 'Gratuit'}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-between items-center py-4 border-t border-gray-100 mt-2">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-xl font-black text-gray-900">{product.price > 0 ? `${product.price.toLocaleString('fr-FR')} FCFA` : 'Gratuit'}</span>
                  </div>
                </div>

              </form>

              <div className="mt-4 pt-2">
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="w-full bg-[#0055D4] text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 hover:bg-[#0047B3] transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Patientez...
                    </>
                  ) : (
                    product.price > 0 ? 'Payer maintenant' : 'Obtenir gratuitement'
                  )}
                </button>
                <p className="text-center mt-3 text-[11px] text-gray-500 leading-relaxed px-4">
                  En cliquant sur le bouton « {product.price > 0 ? 'Payer maintenant' : 'Obtenir gratuitement'} », vous acceptez nos <a href="#" className="underline hover:text-gray-700">termes et conditions</a> et la <a href="#" className="underline hover:text-gray-700">politique de confidentialité</a>.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
