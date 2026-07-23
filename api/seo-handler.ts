import fs from "fs";
import path from "path";

const METADATA: Record<string, { title: string; description: string; canonical: string; image?: string }> = {
  "/about": {
    title: "À propos de nous — TECHNOVA Learning",
    description:
      "Découvrez notre mission, notre équipe et notre vision pour l'éducation technologique de qualité dans le monde.",
    canonical: "https://www.technovalearning.com/about",
  },
  "/formations": {
    title: "Formations Tech Certifiantes — Intelligence Artificielle, Cybersécurité, Data",
    description:
      "Découvrez nos formations certifiantes en IA, data science, cybersécurité et design. Apprenez à votre rythme et payez via Mobile Money ou Visa.",
    canonical: "https://www.technovalearning.com/formations",
  },
  "/cours": {
    title: "Formations Tech Certifiantes — Intelligence Artificielle, Cybersécurité, Data",
    description:
      "Découvrez nos formations certifiantes en IA, data science, cybersécurité et design. Apprenez à votre rythme et payez via Mobile Money ou Visa.",
    canonical: "https://www.technovalearning.com/formations",
  },
  "/blog": {
    title: "Blog & Ressources Tech — TECHNOVA Learning",
    description:
      "Lisez nos derniers articles de blog sur l'intelligence artificielle, le marketing digital, les hacks de productivité et l'entrepreneuriat.",
    canonical: "https://www.technovalearning.com/blog",
  },
  "/actualites": {
    title: "Actualités & Événements Tech — TECHNOVA Learning",
    description:
      "Suivez les dernières actualités technologiques, nos lancements officiels et nos événements communautaires.",
    canonical: "https://www.technovalearning.com/actualites",
  },
  "/store": {
    title: "Boutique de Produits Numériques — TECHNOVA Learning",
    description:
      "Parcourez et téléchargez nos e-books, templates Notion/Canva et ressources pratiques pour accélérer vos compétences tech.",
    canonical: "https://www.technovalearning.com/store",
  },
  "/boutique": {
    title: "Boutique de Produits Numériques — TECHNOVA Learning",
    description:
      "Parcourez et téléchargez nos e-books, templates Notion/Canva et ressources pratiques pour accélérer vos compétences tech.",
    canonical: "https://www.technovalearning.com/store",
  },
  "/terms": {
    title: "Conditions Générales d'Utilisation — TECHNOVA Learning",
    description:
      "Conditions générales d'utilisation et de vente de la plateforme TECHNOVA Learning.",
    canonical: "https://www.technovalearning.com/terms",
  },
  "/privacy": {
    title: "Politique de Confidentialité — TECHNOVA Learning",
    description:
      "Politique de confidentialité et de respect de la vie privée des utilisateurs de TECHNOVA Learning.",
    canonical: "https://www.technovalearning.com/privacy",
  },
  "/legal": {
    title: "Mentions Légales — TECHNOVA Learning",
    description:
      "Mentions légales de l'éditeur, de l'hébergeur et des responsables de TECHNOVA Learning.",
    canonical: "https://www.technovalearning.com/legal",
  },
  "/refund-policy": {
    title: "Politique de Remboursement — TECHNOVA Learning",
    description:
      "Politique de remboursement et conditions de retour des produits de TECHNOVA Learning.",
    canonical: "https://www.technovalearning.com/refund-policy",
  },
};

export default async function handler(req: any, res: any) {
  // 1. Locate and read the index.html file
  let html = "";
  let htmlPath = "";
  try {
    const prodPath = path.join(process.cwd(), "dist", "index.html");
    const devPath = path.join(process.cwd(), "index.html");

    if (fs.existsSync(prodPath)) {
      htmlPath = prodPath;
    } else if (fs.existsSync(devPath)) {
      htmlPath = devPath;
    } else {
      const fallbackPath = path.join(__dirname, "..", "dist", "index.html");
      const fallbackDevPath = path.join(__dirname, "..", "index.html");
      if (fs.existsSync(fallbackPath)) {
        htmlPath = fallbackPath;
      } else if (fs.existsSync(fallbackDevPath)) {
        htmlPath = fallbackDevPath;
      }
    }

    if (!htmlPath) {
      throw new Error("index.html could not be found in any expected location");
    }

    html = fs.readFileSync(htmlPath, "utf8");
  } catch (err) {
    console.error("Error reading index.html:", err);
    return res.status(500).send("Internal Server Error");
  }

  // 2. Identify the path
  const urlObj = new URL(req.url, "https://www.technovalearning.com");
  const reqPath = urlObj.pathname;

  let meta = METADATA[reqPath];

  // Dynamically fetch metadata for news detail and blog detail routes
  if (!meta && (reqPath.startsWith("/actualites/") || reqPath.startsWith("/blog/"))) {
    const isActualites = reqPath.startsWith("/actualites/");
    const id = reqPath.substring(isActualites ? "/actualites/".length : "/blog/".length);

    if (id && id !== "index.html") {
      // Default fallback meta in case API fails
      meta = {
        title: isActualites ? "Actualités & Événements Tech — TECHNOVA" : "Blog & Ressources Tech — TECHNOVA",
        description: "Découvrez les dernières nouveautés et analyses sur TECHNOVA Learning.",
        canonical: `https://www.technovalearning.com${reqPath}`,
        image: "https://www.technovalearning.com/news-fallback.jpg",
      };

      try {
        const host = req.headers.host || "www.technovalearning.com";
        const protocol = req.headers["x-forwarded-proto"] || "https";
        const fetchUrl = `${protocol}://${host}/api/blog?id=${encodeURIComponent(id)}`;

        const response = await fetch(fetchUrl);
        if (response.ok) {
          const article = await response.json();
          if (article && article.title) {
            meta = {
              title: `${article.title} — TECHNOVA Learning`,
              description: article.excerpt || article.description || meta.description,
              canonical: `https://www.technovalearning.com${reqPath}`,
              image: article.image || meta.image,
            };
          }
        }
      } catch (err) {
        console.warn("Failed to fetch article meta in seo-handler:", err);
      }
    }
  }

  if (!meta) {
    // If route has no specific metadata, just return index.html as is
    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(html);
  }

  // Helper to escape values for HTML attribute inclusion
  const escapeHtmlAttr = (str: string) => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  };

  const escapedTitle = escapeHtmlAttr(meta.title);
  const escapedDesc = escapeHtmlAttr(meta.description);
  const escapedCanonical = escapeHtmlAttr(meta.canonical);
  const escapedImage = meta.image ? escapeHtmlAttr(meta.image) : "https://www.technovalearning.com/og-image.png";

  // 3. Replace metadata in HTML
  let outputHtml = html;

  // Title replacement
  const titleRegex = /<title>[^<]*<\/title>/i;
  const newTitle = `<title>${escapedTitle}</title>`;
  if (titleRegex.test(outputHtml)) {
    outputHtml = outputHtml.replace(titleRegex, newTitle);
  } else {
    outputHtml = outputHtml.replace("</head>", `${newTitle}\n</head>`);
  }

  // Description meta replacement
  const descRegex = /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i;
  const newDesc = `<meta name="description" content="${escapedDesc}" />`;
  if (descRegex.test(outputHtml)) {
    outputHtml = outputHtml.replace(descRegex, newDesc);
  } else {
    outputHtml = outputHtml.replace("</head>", `${newDesc}\n</head>`);
  }

  // Open Graph description meta replacement
  const ogDescRegex = /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i;
  const newOgDesc = `<meta property="og:description" content="${escapedDesc}" />`;
  if (ogDescRegex.test(outputHtml)) {
    outputHtml = outputHtml.replace(ogDescRegex, newOgDesc);
  }

  // Open Graph title meta replacement
  const ogTitleRegex = /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i;
  const newOgTitle = `<meta property="og:title" content="${escapedTitle}" />`;
  if (ogTitleRegex.test(outputHtml)) {
    outputHtml = outputHtml.replace(ogTitleRegex, newOgTitle);
  }

  // Open Graph image replacement
  const ogImgRegex = /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i;
  const newOgImg = `<meta property="og:image" content="${escapedImage}" />`;
  if (ogImgRegex.test(outputHtml)) {
    outputHtml = outputHtml.replace(ogImgRegex, newOgImg);
  } else {
    outputHtml = outputHtml.replace("</head>", `${newOgImg}\n</head>`);
  }

  // Open Graph secure image replacement
  const ogSecureImgRegex = /<meta\s+property="og:image:secure_url"\s+content="[^"]*"\s*\/?>/i;
  const newOgSecureImg = `<meta property="og:image:secure_url" content="${escapedImage}" />`;
  if (ogSecureImgRegex.test(outputHtml)) {
    outputHtml = outputHtml.replace(ogSecureImgRegex, newOgSecureImg);
  }

  // Twitter title meta replacement
  const twTitleRegex = /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i;
  const newTwTitle = `<meta name="twitter:title" content="${escapedTitle}" />`;
  if (twTitleRegex.test(outputHtml)) {
    outputHtml = outputHtml.replace(twTitleRegex, newTwTitle);
  }

  // Twitter description meta replacement
  const twDescRegex = /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i;
  const newTwDesc = `<meta name="twitter:description" content="${escapedDesc}" />`;
  if (twDescRegex.test(outputHtml)) {
    outputHtml = outputHtml.replace(twDescRegex, newTwDesc);
  }

  // Twitter image meta replacement
  const twImgRegex = /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i;
  const newTwImg = `<meta name="twitter:image" content="${escapedImage}" />`;
  if (twImgRegex.test(outputHtml)) {
    outputHtml = outputHtml.replace(twImgRegex, newTwImg);
  } else {
    outputHtml = outputHtml.replace("</head>", `${newTwImg}\n</head>`);
  }

  // Inject/Replace Canonical link
  const newCanonical = `<link rel="canonical" href="${escapedCanonical}" />`;
  if (outputHtml.includes('rel="canonical"')) {
    outputHtml = outputHtml.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, newCanonical);
  } else {
    outputHtml = outputHtml.replace("</head>", `${newCanonical}\n</head>`);
  }

  // Inject/Replace OG url
  const newOgUrl = `<meta property="og:url" content="${escapedCanonical}" />`;
  if (outputHtml.includes('property="og:url"')) {
    outputHtml = outputHtml.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, newOgUrl);
  } else {
    outputHtml = outputHtml.replace("</head>", `${newOgUrl}\n</head>`);
  }

  // Cache control headers for crawler performance
  res.setHeader(
    "Cache-Control",
    "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400"
  );
  res.setHeader("Content-Type", "text/html");
  return res.status(200).send(outputHtml);
}
