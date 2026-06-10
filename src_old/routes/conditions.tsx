import { createFileRoute } from '@tanstack/react-router';
import { Header, Footer } from '@/components/site/shared';

export const Route = createFileRoute('/conditions')({
  component: Conditions,
});

function Conditions() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Header />
      <main className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl font-display font-bold mb-8 text-[color:var(--primary)]">Conditions d'Utilisation</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <p className="text-sm text-muted-foreground"><strong>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</strong></p>
          
          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Objet</h2>
            <p className="leading-relaxed">Les présentes Conditions d'Utilisation régissent l'accès et l'utilisation du site TECHNOVA Learning. En créant un compte ou en naviguant sur ce site, vous acceptez d'être lié par ces conditions.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Services proposés</h2>
            <p className="leading-relaxed">TECHNOVA met à disposition des formations numériques, e-books et outils logiciels. L'accès aux contenus payants nécessite la création d'un compte et un paiement valide.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Accès au compte</h2>
            <p className="leading-relaxed">Vous êtes responsable de la sécurité de votre compte et de vos identifiants. Toute activité effectuée sous votre compte vous incombe. L'accès aux formations est strictement personnel et ne peut être partagé.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Propriété intellectuelle</h2>
            <p className="leading-relaxed">L'ensemble des contenus (textes, vidéos, documents, codes) disponibles sur TECHNOVA sont protégés par le droit d'auteur. Il est formellement interdit de reproduire, distribuer, ou revendre ces contenus sans autorisation explicite.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Remboursements</h2>
            <p className="leading-relaxed">En raison de la nature numérique de nos produits, et sauf mention contraire explicite sur la page de vente, aucun remboursement n'est accordé une fois qu'un produit numérique a été livré ou consulté.</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Modification des conditions</h2>
            <p className="leading-relaxed">TECHNOVA se réserve le droit de modifier les présentes conditions à tout moment. Les utilisateurs seront informés des changements importants.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
