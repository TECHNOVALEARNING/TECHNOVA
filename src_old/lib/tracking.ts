declare global {
  interface Window {
    fbq?: any;
    ttq?: any;
    dataLayer?: any[];
  }
}

export type TrackingEventName = 
  | 'PageView'
  | 'ViewContent'       // Produit vu
  | 'AddToCart'         // Ajout au panier
  | 'InitiateCheckout'  // Début du paiement (Formulaire rempli)
  | 'AddPaymentInfo'    // Info de paiement ajoutée
  | 'Purchase'          // Achat réussi
  | 'PaymentFailed'     // Paiement échoué (Event custom/spécifique)
  | 'AbandonedCart';    // Panier abandonné (Event custom)

export interface TrackingEventData {
  content_name?: string;
  content_ids?: string[];
  value?: number;
  currency?: string;
  order_id?: string;
}

export const trackEvent = (eventName: TrackingEventName, data?: TrackingEventData) => {
  if (typeof window === 'undefined') return;

  const defaultCurrency = 'XOF'; // Par défaut Francs CFA, ajustable selon la devise de la boutique
  const value = data?.value || 0;
  const currency = data?.currency || defaultCurrency;

  // 1. FACEBOOK PIXEL
  if (window.fbq) {
    switch (eventName) {
      case 'PageView':
        window.fbq('track', 'PageView');
        break;
      case 'ViewContent':
        window.fbq('track', 'ViewContent', { content_name: data?.content_name, value, currency });
        break;
      case 'AddToCart':
        window.fbq('track', 'AddToCart', { content_name: data?.content_name, value, currency });
        break;
      case 'InitiateCheckout':
        window.fbq('track', 'InitiateCheckout', { value, currency });
        break;
      case 'AddPaymentInfo':
        window.fbq('track', 'AddPaymentInfo', { value, currency });
        break;
      case 'Purchase':
        window.fbq('track', 'Purchase', { value, currency, content_ids: data?.content_ids });
        break;
      case 'PaymentFailed':
        window.fbq('trackCustom', 'PaymentFailed', { value, currency, order_id: data?.order_id });
        break;
      case 'AbandonedCart':
        window.fbq('trackCustom', 'AbandonedCart', { value, currency });
        break;
    }
  }

  // 2. TIKTOK PIXEL
  if (window.ttq) {
    switch (eventName) {
      case 'PageView':
        // TikTok a déjà été appelé au load initial, mais pour les SPA on peut rappeler ttq.page()
        window.ttq.page();
        break;
      case 'ViewContent':
        window.ttq.track('ViewContent', { content_name: data?.content_name, value, currency });
        break;
      case 'AddToCart':
        window.ttq.track('AddToCart', { content_name: data?.content_name, value, currency });
        break;
      case 'InitiateCheckout':
        window.ttq.track('InitiateCheckout', { value, currency });
        break;
      case 'AddPaymentInfo':
        window.ttq.track('AddPaymentInfo', { value, currency });
        break;
      case 'Purchase':
        window.ttq.track('CompletePayment', { value, currency, content_id: data?.content_ids?.[0] });
        break;
      case 'PaymentFailed':
        // Custom events for TT require setup in dashboard, but we send it
        window.ttq.track('PaymentFailed', { value, currency });
        break;
      case 'AbandonedCart':
        window.ttq.track('AbandonedCart', { value, currency });
        break;
    }
  }

  // 3. GOOGLE TAG MANAGER / DATA LAYER
  if (window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ecommerce: data ? {
        value,
        currency,
        items: data.content_ids?.map(id => ({ item_id: id, item_name: data.content_name })) || []
      } : undefined
    });
  }
};
