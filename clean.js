const fs = require('fs');
let t = fs.readFileSync('src/data/toolsData.ts', 'utf8');

const replacements = [
  { p: /Cr?ation/g, r: 'Création' },
  { p: /Productivit?/g, r: 'Productivité' },
  { p: /G?n?rez/g, r: 'Générez' },
  { p: /qualit?/g, r: 'qualité' },
  { p: /d?crivant/g, r: 'décrivant' },
  { p: /avanc?/g, r: 'avancé' },
  { p: /D?veloppez/g, r: 'Développez' },
  { p: /d?ployez/g, r: 'déployez' },
  { p: /lumire/g, r: 'lumière' },
  { p: / la vitesse/g, r: 'à la vitesse' },
  { p: /Artifiielle/g, r: 'Artificielle' },
  { p: /r?diger/g, r: 'rédiger' },
  { p: /synthse/g, r: 'synthèse' },
  { p: /l'criture/g, r: \"l'écriture\" },
  { p: /r?f?rence/g, r: 'référence' },
  { p: /g?n?ration/g, r: 'génération' },
  { p: /ultra-r?alistes/g, r: 'ultra-réalistes' },
  { p: /poustouflantes/g, r: 'époustouflantes' },
  { p: / partir/g, r: 'à partir' },
  { p: /Cr?ez/g, r: 'Créez' },
  { p: /vid?os/g, r: 'vidéos' },
  { p: /id?es/g, r: 'idées' },
  { p: /cr?atifs/g, r: 'créatifs' },
  { p: /d?veloppement/g, r: 'développement' },
  { p: /int?gr?/g, r: 'intégré' },
  { p: /d?di?e/g, r: 'dédiée' },
  { p: /v?ritable/g, r: 'véritable' },
  { p: /strat?gie/g, r: 'stratégie' },
  { p: /pr?sence/g, r: 'présence' },
  { p: /matrisez/g, r: 'maîtrisez' },
  { p: /btissez/g, r: 'bâtissez' },
  { p: /systme/g, r: 'système' },
  { p: /s?curis?s/g, r: 'sécurisés' },
  { p: /cr?er/g, r: 'créer' },
  { p: /g?rer/g, r: 'gérer' },
  { p: /volutive/g, r: 'évolutive' },
  { p: / /g, r: 'à ' }
];

// Fallback replacements for remaining generic broken characters
const fallback = [
  { p: /?/g, r: 'é' },
  { p: //g, r: 'à' }, 
  { p: /+®/g, r: 'é' },
  { p: /+á/g, r: 'à' },
  { p: /+¿/g, r: 'è' }
];

replacements.forEach(x => { t = t.replace(x.p, x.r); });
fallback.forEach(x => { t = t.replace(x.p, x.r); });

// Fix any lingering double quotes issues or weird spaces
t = t.replace(/Artifiielle/g, 'Artificielle');

fs.writeFileSync('src/data/toolsData.ts', t, 'utf8');
console.log('Done cleaning toolsData.ts');
