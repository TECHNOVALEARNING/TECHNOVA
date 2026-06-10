import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export function SeoProvider() {
  const storeId = 'default_store'; // Identifiant de la boutique

  const { data: seoData } = useQuery({
    queryKey: ['store_seo', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('seo')
        .eq('id', storeId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data?.seo || null;
    },
    staleTime: 5 * 60 * 1000, // Cache de 5 minutes
  });

  useEffect(() => {
    if (!seoData) return;

    // Fonction utilitaire pour mettre à jour ou créer une balise meta
    const setMetaTag = (attrName: string, attrValue: string, content: string) => {
      if (!content) return;
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Mettre à jour le Titre
    if (seoData.title) {
      document.title = seoData.title;
      setMetaTag('property', 'og:title', seoData.title);
      setMetaTag('name', 'twitter:title', seoData.title);
    }

    // Mettre à jour la Description
    if (seoData.description) {
      setMetaTag('name', 'description', seoData.description);
      setMetaTag('property', 'og:description', seoData.description);
      setMetaTag('name', 'twitter:description', seoData.description);
    }

    // Mettre à jour l'Image (Miniature)
    if (seoData.thumbnail) {
      setMetaTag('property', 'og:image', seoData.thumbnail);
      setMetaTag('name', 'twitter:image', seoData.thumbnail);
      setMetaTag('name', 'twitter:card', 'summary_large_image');
    }

    // Mettre à jour les Mots-clés
    if (seoData.keywords && seoData.keywords.length > 0) {
      setMetaTag('name', 'keywords', seoData.keywords.join(', '));
    }

  }, [seoData]);

  return null; // Ce composant est invisible, il ne fait qu'injecter le SEO
}
