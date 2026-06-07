import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';

const EBOOK_DIR = 'C:\\\\Users\\\\isido\\\\Desktop\\\\EBOOK TECHNOVA';
const PUBLIC_PRODUCTS_DIR = path.join(process.cwd(), 'public', 'products');
const url = 'https://jcfrlevtrnhrmyovmuza.supabase.co/pg_meta/default/query';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZnJsZXZ0cm5ocm15b3ZtdXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDYxOTcwOCwiZXhwIjoyMDk2MTk1NzA4fQ.SoooDQeybIK2kqnHiAWbV7EIx6GlieQLdUbh_vDR_3I';

// Créer le dossier public/products s'il n'existe pas
if (!fs.existsSync(PUBLIC_PRODUCTS_DIR)) {
  fs.mkdirSync(PUBLIC_PRODUCTS_DIR, { recursive: true });
}

const PRODUCTS_JSON = path.join(process.cwd(), 'src', 'data', 'products.json');

// Nettoyer les quotes pour le SQL
const escapeSql = (str) => str.replace(/'/g, "''");

async function importProducts() {
  const folders = fs.readdirSync(EBOOK_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  console.log("🔍 Trouvé " + folders.length + " dossiers de produits.");

  const allProducts = [];

  for (const folder of folders) {
    const folderPath = path.join(EBOOK_DIR, folder);
    const files = fs.readdirSync(folderPath);

    let pdfFile = files.find(f => f.toLowerCase().endsWith('.pdf'));
    let docxFile = files.find(f => f.toLowerCase().endsWith('.docx') || f.toLowerCase().endsWith('.doc'));
    let images = files.filter(f => f.toLowerCase().match(/\\.(jpg|jpeg|png)$/));

    // Titre basé sur le dossier, ou affiné avec le nom du PDF
    let title = folder;
    if (pdfFile) {
      // Parfois le PDF a un titre plus propre
      title = pdfFile.replace(/\\.pdf$/i, '').replace(/[_-]/g, ' ');
    }

    // Catégorie (on utilise un terme général basé sur le dossier)
    let category = 'Ebook & Formation';
    if (folder.toLowerCase().includes('marketing') || folder.toLowerCase().includes('vente')) category = 'Marketing';
    else if (folder.toLowerCase().includes('excel') || folder.toLowerCase().includes('compta')) category = 'Finance & Outils';
    else if (folder.toLowerCase().includes('cyber')) category = 'Cybersécurité';

    // Description (Extraite du fichier Word)
    let description = 'Découvrez cette formation complète pour propulser vos compétences.';
    if (docxFile) {
      try {
        const docPath = path.join(folderPath, docxFile);
        const result = await mammoth.extractRawText({ path: docPath });
        const text = result.value.trim();
        // Prendre les 250 premiers caractères comme description
        if (text.length > 10) {
          description = text.substring(0, 250) + (text.length > 250 ? '...' : '');
        }
      } catch (e) {
        console.log("⚠️ Impossible de lire le word pour " + folder);
      }
    }

    // Image (Copie de la première image trouvée)
    let imageUrl = 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&q=80&w=800'; // Fallback
    if (images.length > 0) {
      // Prendre la première image comme image produit
      const imgName = images[0];
      const sourceImg = path.join(folderPath, imgName);
      // Nettoyer le nom pour l'URL
      const safeImgName = folder.replace(/[^a-z0-9]/gi, '_').toLowerCase() + path.extname(imgName);
      const destImg = path.join(PUBLIC_PRODUCTS_DIR, safeImgName);
      
      fs.copyFileSync(sourceImg, destImg);
      imageUrl = "/products/" + safeImgName; // Chemin relatif pour le web
    }

    // Prix (aléatoire pour le test, ou standardisé à 5000 FCFA)
    const price = 5000;

    allProducts.push({
      id: folder,
      title: title,
      description: description,
      price: price,
      category: category,
      image_url: imageUrl,
      features: ["Certificat inclus", "Format PDF", "Accès à vie"]
    });
    console.log("✅ Produit prêt : " + title);
  }
  
  fs.writeFileSync(PRODUCTS_JSON, JSON.stringify(allProducts, null, 2));
  console.log('🎉 Importation terminée et sauvegardée dans src/data/products.json !');
}

importProducts();
