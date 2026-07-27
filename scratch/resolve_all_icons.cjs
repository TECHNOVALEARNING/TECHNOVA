const fs = require('fs');

const code = fs.readFileSync('scratch/topapps_asset.js', 'utf8');
const rawTools = JSON.parse(fs.readFileSync('scratch/all_topapps_tools.json', 'utf8'));

// Find tool definitions in code with Icon property
const regex = /\{id:"([^"]+)",name:"([^"]+)",description:"([^"]+)",category:"([^"]+)",Icon:([a-zA-Z0-9_$]+)/g;

let match;
const toolVarMap = {};

while ((match = regex.exec(code)) !== null) {
  const [full, id, name, description, category, iconVar] = match;
  toolVarMap[id] = iconVar;
}

// Find definitions for each iconVar in the bundle
// In lucide-react, createLucideIcon or icon helper takes (name, iconNode)
// e.g. Xg=e("Type",[...]) or Xg=createLucideIcon("Type",...) or Xg=...("Type",...)
const iconVarToName = {};

// Regex to capture `VAR=something("IconName",` or `VAR=something('IconName',`
for (const [id, iconVar] of Object.entries(toolVarMap)) {
  const regexVar = new RegExp(`\\b${iconVar}\\s*=\\s*[a-zA-Z0-9_$]+\\s*\\(\\s*["']([a-zA-Z0-9]+)["']`, 'g');
  const m = regexVar.exec(code);
  if (m) {
    iconVarToName[iconVar] = m[1];
  } else {
    // Search for var definition in code: e.g. `var Xg=` or `Xg=`
    const idx = code.indexOf(`${iconVar}=`);
    if (idx !== -1) {
      const snippet = code.substring(idx, idx + 100);
      const strMatch = snippet.match(/["']([A-Z][a-zA-Z0-9]+)["']/);
      if (strMatch) {
        iconVarToName[iconVar] = strMatch[1];
      }
    }
  }
}

// Category fallback icon mapping for any unmapped items
function getFallbackIcon(category, name) {
  const lower = name.toLowerCase();
  if (lower.includes('calcul') || lower.includes('compteur') || lower.includes('pourcentage') || lower.includes('tva')) return 'Calculator';
  if (lower.includes('code') || lower.includes('json') || lower.includes('html') || lower.includes('css') || lower.includes('sql') || lower.includes('regex')) return 'Code';
  if (lower.includes('texte') || lower.includes('mot') || lower.includes('casse') || lower.includes('lorem') || lower.includes('email')) return 'FileText';
  if (lower.includes('couleur') || lower.includes('gradient') || lower.includes('palette') || lower.includes('image') || lower.includes('svg') || lower.includes('logo') || lower.includes('design')) return 'Palette';
  if (lower.includes('qr') || lower.includes('barcode')) return 'QrCode';
  if (lower.includes('horloge') || lower.includes('chrono') || lower.includes('minuteur') || lower.includes('temps') || lower.includes('date')) return 'Clock';
  if (lower.includes('convert') || lower.includes('unite')) return 'ArrowLeftRight';
  if (lower.includes('fichier') || lower.includes('pdf') || lower.includes('csv')) return 'File';
  if (lower.includes('mot de passe') || lower.includes('password') || lower.includes('crypto') || lower.includes('hash')) return 'Lock';
  if (lower.includes('musique') || lower.includes('bpm') || lower.includes('frequence')) return 'Music';
  if (lower.includes('sante') || lower.includes('imc') || lower.includes('calorie')) return 'Activity';
  if (lower.includes('carte') || lower.includes('gps') || lower.includes('distance')) return 'MapPin';
  if (lower.includes('monnaie') || lower.includes('euro') || lower.includes('dollar') || lower.includes('devise') || lower.includes('finance') || lower.includes('pret')) return 'Coins';

  switch (category) {
    case 'Calcul & Science': return 'Calculator';
    case 'Développement': return 'Code';
    case 'Productivité': return 'Zap';
    case 'Design': return 'Palette';
    case 'Texte': return 'FileText';
    case 'Maison & Admin': return 'Building';
    case 'Voyage & Nature': return 'Compass';
    case 'Éducation & Musique': return 'BookOpen';
    case 'Santé & Sport': return 'Heart';
    case 'Cuisine & Loisirs': return 'Utensils';
    default: return 'Wrench';
  }
}

const finalIconMap = {};
let resolvedCount = 0;

rawTools.forEach(t => {
  const iconVar = toolVarMap[t.id];
  const iconName = (iconVar && iconVarToName[iconVar]) ? iconVarToName[iconVar] : getFallbackIcon(t.category, t.name);
  finalIconMap[t.id] = iconName;
  if (iconVar && iconVarToName[iconVar]) resolvedCount++;
});

console.log(`Successfully mapped ${Object.keys(finalIconMap).length} tools (${resolvedCount} exact Lucide icons extracted from topapps bundle!)`);

fs.writeFileSync('scratch/final_icon_map.json', JSON.stringify(finalIconMap, null, 2));
