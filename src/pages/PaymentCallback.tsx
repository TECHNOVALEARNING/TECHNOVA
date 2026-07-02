import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail } from "lucide-react";

// Note: With PawaPay, payment confirmation happens inside the CheckoutDialog
// (no external redirect). This page exists as a fallback landing route.
const PaymentCallback = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center space-y-6 py-20">
          <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
            <CheckCircle className="h-9 w-9 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Merci !</h1>
          <p className="text-muted-foreground">
            Si votre paiement a été validé, vous recevrez un email de confirmation immédiatement.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            <span>Pensez à vérifier vos spams</span>
          </div>
          <div className="flex gap-3 justify-center pt-4">
            <Button onClick={() => navigate("/buyer/login")}>Voir mes achats</Button>
            <Button onClick={() => navigate("/")} variant="outline">
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;
