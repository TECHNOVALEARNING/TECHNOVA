import fs from "fs";
import path from "path";

const METADATA: Record<string, { title: string; description: string; canonical: string }> = {
  "/about": {
    title: "À propos de nous — TECHNOVA Learning",
    description:
      "Découvrez notre mission, notre équipe et notre vision pour l'éducation technologique de qualité en Afrique francophone.",
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

  // Find key in METADATA
  const meta = METADATA[reqPath];
  if (!meta) {
    // If route has no specific metadata, just return index.html as is
    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(html);
  }

  // 3. Replace metadata in HTML
  let outputHtml = html;

  // Title replacement
  const titleRegex = /<title>[^<]*<\/title>/i;
  const newTitle = `<title>${meta.title}</title>`;
  if (titleRegex.test(outputHtml)) {
    outputHtml = outputHtml.replace(titleRegex, newTitle);
  } else {
    outputHtml = outputHtml.replace("</head>", `${newTitle}\n</head>`);
  }

  // Description meta replacement
  const descRegex = /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i;
  const newDesc = `<meta name="description" content="${meta.description}" />`;
  if (descRegex.test(outputHtml)) {
    outputHtml = outputHtml.replace(descRegex, newDesc);
  } else {
    outputHtml = outputHtml.replace("</head>", `${newDesc}\n</head>`);
  }

  // Open Graph description meta replacement
  const ogDescRegex = /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i;
  const newOgDesc = `<meta property="og:description" content="${meta.description}" />`;
  if (ogDescRegex.test(outputHtml)) {
    outputHtml = outputHtml.replace(ogDescRegex, newOgDesc);
  }

  // Open Graph title meta replacement
  const ogTitleRegex = /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i;
  const newOgTitle = `<meta property="og:title" content="${meta.title}" />`;
  if (ogTitleRegex.test(outputHtml)) {
    outputHtml = outputHtml.replace(ogTitleRegex, newOgTitle);
  }

  // Twitter title meta replacement
  const twTitleRegex = /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i;
  const newTwTitle = `<meta name="twitter:title" content="${meta.title}" />`;
  if (twTitleRegex.test(outputHtml)) {
    outputHtml = outputHtml.replace(twTitleRegex, newTwTitle);
  }

  // Twitter description meta replacement
  const twDescRegex = /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i;
  const newTwDesc = `<meta name="twitter:description" content="${meta.description}" />`;
  if (twDescRegex.test(outputHtml)) {
    outputHtml = outputHtml.replace(twDescRegex, newTwDesc);
  }

  // Inject Canonical link
  const newCanonical = `<link rel="canonical" href="${meta.canonical}" />`;
  outputHtml = outputHtml.replace("</head>", `${newCanonical}\n</head>`);

  // Inject OG url
  const newOgUrl = `<meta property="og:url" content="${meta.canonical}" />`;
  outputHtml = outputHtml.replace("</head>", `${newOgUrl}\n</head>`);

  res.setHeader("Content-Type", "text/html");
  return res.status(200).send(outputHtml);
}
