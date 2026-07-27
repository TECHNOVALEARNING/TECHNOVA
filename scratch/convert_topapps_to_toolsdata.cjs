const fs = require('fs');

const rawTools = JSON.parse(fs.readFileSync('scratch/all_topapps_tools.json', 'utf8'));

console.log(`Loaded ${rawTools.length} raw tools`);

function mapCategory(cat) {
  switch (cat) {
    case 'Calcul & Science':
      return ["Calcul & Science", "Productivité & Automatisation"];
    case 'Développement':
      return ["Développement & Code", "Productivité & Automatisation"];
    case 'Productivité':
      return ["Productivité & Automatisation"];
    case 'Design':
      return ["Graphisme & Design"];
    case 'Texte':
      return ["Rédaction & Texte", "Productivité & Automatisation"];
    case 'Maison & Admin':
      return ["Utilitaires & Quotidien", "Productivité & Automatisation"];
    case 'Voyage & Nature':
      return ["Utilitaires & Quotidien"];
    case 'Éducation & Musique':
      return ["Productivité & Automatisation"];
    case 'Santé & Sport':
      return ["Utilitaires & Quotidien"];
    case 'Cuisine & Loisirs':
      return ["Utilitaires & Quotidien"];
    default:
      return ["Productivité & Automatisation"];
  }
}

function getFavicon(url, name) {
  if (url && url.startsWith('http')) {
    try {
      const parsed = new URL(url);
      return `https://www.google.com/s2/favicons?sz=256&domain_url=${parsed.hostname}`;
    } catch (e) {}
  }
  return `https://www.google.com/s2/favicons?sz=256&domain_url=${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
}

const formattedTools = rawTools.map((t, idx) => {
  const categories = mapCategory(t.category);
  const websiteUrl = t.url && t.url.startsWith('http') ? t.url : `https://topapps.fr/outils/${t.id}`;
  const logoUrl = getFavicon(websiteUrl, t.name);

  return {
    id: t.id,
    name: t.name,
    description: t.description,
    websiteUrl,
    categories,
    logoUrl,
    isFeatured: idx < 25,
  };
});

console.log(`Formatted ${formattedTools.length} tools!`);
fs.writeFileSync('scratch/formatted_tools.json', JSON.stringify(formattedTools, null, 2));
