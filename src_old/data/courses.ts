import c1 from "@/assets/c1.png";
import c2 from "@/assets/c2.png";
import c3 from "@/assets/c3.png";
import c4 from "@/assets/c4.png";
import c5 from "@/assets/c5.png";
import c6 from "@/assets/c6.png";
import c7 from "@/assets/c7.png";
import c8 from "@/assets/c8.png";

import type { Course } from "@/components/site/shared";

export const ALL_COURSES: Course[] = [
  { slug: "cybersecurite", title: "Cybersécurité de débutant à expert", cover: c1, category: "Sécurité", level: "Tous niveaux", price: "2 500 F", oldPrice: "15 000 F", duration: "Accès à vie" },
  { slug: "data", title: "Data Analyste Débutant à expert", cover: c2, category: "Data", level: "Tous niveaux", price: "2 000 F", oldPrice: "12 000 F", duration: "Accès à vie" },
  { slug: "ia-premium", title: "ACCES aux IA PREMIUM", cover: c3, category: "Intelligence Artificielle", level: "Tous niveaux", price: "3 500 F", oldPrice: "20 000 F", duration: "Accès à vie" },
  { slug: "design-video", title: "PACK DESIGN GRAPHIQUE & MONTAGE VIDEO", cover: c4, category: "Design", level: "Tous niveaux", price: "2 300 F", oldPrice: "18 000 F", duration: "Accès à vie" },
  { slug: "bundle-200", title: "200 PACKS de Formations en ligne", cover: c5, category: "Pack Bundle", level: "Tous niveaux", price: "1 500 F", oldPrice: "10 000 F", duration: "Accès à vie" },
  { slug: "excel", title: "Bureautique Excel", cover: c6, category: "Bureautique", level: "Débutant", price: "1 500 F", oldPrice: "10 000 F", duration: "Accès à vie" },
  { slug: "ecommerce", title: "Comment Vendre et écouler tout ton stock", cover: c7, category: "E-commerce", level: "Tous niveaux", price: "1 500 F", oldPrice: "10 000 F", duration: "Accès à vie" },
  { slug: "web-mobile", title: "DEVELOPPEMENT WEB ET MOBILE", cover: c8, category: "Développement", level: "Tous niveaux", price: "1 500 F", oldPrice: "12 000 F", duration: "Accès à vie" },
];
