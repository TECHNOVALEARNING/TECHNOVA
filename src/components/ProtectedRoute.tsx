import { useAuth } from "@/contexts/AuthContext";
import { Link, Navigate, useLocation } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PUBLIC_SELLER_SIGNUP, SELLER_GRANDFATHER_CUTOFF } from "@/config/features";

/**
 * Accès vendeur : comptes créés/activés par l'administrateur (app_metadata.seller,
 * modifiable uniquement côté serveur) ou vendeurs inscrits avant la fermeture des inscriptions.
 */
export function isApprovedSeller(user: User | null, isAdmin: boolean) {
  if (!user) return false;
  if (isAdmin || PUBLIC_SELLER_SIGNUP) return true;
  if (user.app_metadata?.seller === true) return true;
  return Boolean(user.created_at) && new Date(user.created_at) < new Date(SELLER_GRANDFATHER_CUTOFF);
}

const SellerAccessDenied = () => {
  const { signOut } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Store className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Espace vendeur réservé</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Les comptes vendeurs sont créés par l'administrateur TECHNOVA. Votre compte n'a pas encore
          d'accès vendeur. Pour retrouver vos achats, utilisez l'espace « Mes achats ».
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button asChild>
            <Link to="/buyer-login">Mes achats</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/contact">Contacter l'administrateur</Link>
          </Button>
          <Button variant="ghost" onClick={() => signOut()}>
            Se déconnecter
          </Button>
        </div>
      </div>
    </div>
  );
};

const ProtectedRoute = ({
  children,
  requireAdmin,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) => {
  const { user, profile, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!isApprovedSeller(user, isAdmin)) return <SellerAccessDenied />;

  // Redirect to onboarding if not completed (unless already on onboarding page)
  if (profile && !profile.onboarding_completed && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
