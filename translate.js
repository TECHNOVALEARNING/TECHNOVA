const fs = require('fs');

let index = fs.readFileSync('src/routes/index.tsx', 'utf8');
const iRep = [
  ['>Plateforme #1 en Afrique<', '>{lang === "fr" ? "Plateforme #1 en Afrique" : "#1 Platform in Africa"}<'],
  ['Maîtrisez la Tech de <span className="tn-hero-span">Demain</span>.', '{lang === "fr" ? <>Maîtrisez la Tech de <span className="tn-hero-span">Demain</span>.</> : <>Master the Tech of <span className="tn-hero-span">Tomorrow</span>.</>}'],
  ['TECHNOVA Courses est la plateforme ultime pour apprendre le développement, la data science et le design. Formez-vous aux compétences recherchées par les recruteurs.', '{lang === "fr" ? "TECHNOVA Courses est la plateforme ultime pour apprendre le développement, la data science et le design. Formez-vous aux compétences recherchées par les recruteurs." : "TECHNOVA Courses is the ultimate platform to learn development, data science, and design. Learn the skills recruiters are looking for."}'],
  ['>Pourquoi choisir TECHNOVA ?<', '>{lang === "fr" ? "Pourquoi choisir TECHNOVA ?" : "Why choose TECHNOVA?"}<'],
  ['>Nos Formations Phares<', '>{lang === "fr" ? "Nos Formations Phares" : "Featured Courses"}<'],
  ['>Voir toutes les formations<', '>{lang === "fr" ? "Voir toutes les formations" : "View all courses"}<'],
  ['>Informez-vous<', '>{lang === "fr" ? "Informez-vous" : "Stay Informed"}<'],
  ['>Qui Sommes-Nous ?<', '>{lang === "fr" ? "Qui Sommes-Nous ?" : "About Us"}<'],
  ['>Ils ont réussi avec nous<', '>{lang === "fr" ? "Ils ont réussi avec nous" : "They succeeded with us"}<'],
  ['>Payez facilement<', '>{lang === "fr" ? "Payez facilement" : "Pay easily"}<'],
  ['>Prêt à changer de vie ?<', '>{lang === "fr" ? "Prêt à changer de vie ?" : "Ready to change your life?"}<'],
  ['>Démarrer maintenant<', '>{lang === "fr" ? "Démarrer maintenant" : "Start now"}<'],
  ['>Nos Chiffres<', '>{lang === "fr" ? "Nos Chiffres" : "Our Numbers"}<']
];
iRep.forEach(([s, r]) => index = index.replace(s, r));
fs.writeFileSync('src/routes/index.tsx', index);

let form = fs.readFileSync('src/routes/formations.tsx', 'utf8');
const fRep = [
  ['> La référence des formations numériques', '>{lang === "fr" ? " La référence des formations numériques" : " The reference for digital courses"}'],
  ['>Explorez Nos Formations<', '>{lang === "fr" ? "Explorez Nos Formations" : "Explore Our Courses"}<'],
  ['>Passez au niveau supérieur avec nos programmes conçus par des experts de l\\'industrie.<', '>{lang === "fr" ? "Passez au niveau supérieur avec nos programmes conçus par des experts de l\\'industrie." : "Take it to the next level with our industry expert-designed programs."}<'],
  ['>Plus récents<', '>{lang === "fr" ? "Plus récents" : "Most recent"}<'],
  ['>Prix croissant<', '>{lang === "fr" ? "Prix croissant" : "Price: Low to High"}<'],
  ['>Prix décroissant<', '>{lang === "fr" ? "Prix décroissant" : "Price: High to Low"}<'],
  ['>Aucune formation trouvée<', '>{lang === "fr" ? "Aucune formation trouvée" : "No courses found"}<'],
  ['>Essayez un autre mot-clé ou catégorie.<', '>{lang === "fr" ? "Essayez un autre mot-clé ou catégorie." : "Try another keyword or category."}<'],
  ['>Effacer le filtre<', '>{lang === "fr" ? "Effacer le filtre" : "Clear filter"}<'],
  ['>Voir le programme<', '>{lang === "fr" ? "Voir le programme" : "View program"}<'],
  ['>formations disponibles<', '>{lang === "fr" ? "formations disponibles" : "courses available"}<'],
  ['placeholder="Rechercher une formation..."', 'placeholder={lang === "fr" ? "Rechercher une formation..." : "Search for a course..."}']
];
fRep.forEach(([s, r]) => form = form.replace(s, r));
fs.writeFileSync('src/routes/formations.tsx', form);
