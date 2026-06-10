import { createFileRoute } from '@tanstack/react-router';
import { Header, Footer } from '@/components/site/shared';

export const Route = createFileRoute('/confidentialite')({
  component: Confidentialite,
});

function Confidentialite() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Header />
      <main className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl font-display font-bold mb-8 text-[color:var(--primary)]">Politique de Confidentialité</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <p className="text-sm text-muted-foreground"><strong>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</strong></p>
          
          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Collecte des données</h2>
            <p className="leading-relaxed">Nous collectons les données suivantes : adresse e-mail, informations de profil (nom, prénom) lors de votre inscription via Google ou par e-mail, ainsi que les données relatives à vos achats sur la plateforme TECHNOVA.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Utilisation des données</h2>
            <p className="leading-relaxed">Vos données sont utilisées exclusivement pour :</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Créer et gérer votre espace membre</li>
              <li>Vous donner accès aux formations et produits achetés</li>
              <li>Vous envoyer des communications relatives à votre compte ou à nos services</li>
              <li>Assurer la sécurité de notre plateforme</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Protection et Sécurité</h2>
            <p className="leading-relaxed">Vos données sont sécurisées et hébergées sur des infrastructures conformes aux normes de sécurité modernes. Nous ne revendons en aucun cas vos données personnelles à des tiers.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Cookies</h2>
            <p className="leading-relaxed">Notre site utilise des cookies essentiels au fonctionnement de la plateforme (comme le maintien de votre session de connexion) et pour mémoriser vos préférences (langue, thème). Nous utilisons également des outils d'analyse anonymisés pour améliorer nos services.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Vos droits</h2>
            <p className="leading-relaxed">Vous disposez d'un droit d'accès, de rectification, et de suppression de vos données personnelles. Vous pouvez exercer ce droit à tout moment en nous contactant directement via notre support.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
