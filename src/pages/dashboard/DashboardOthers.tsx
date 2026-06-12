import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useNavigate } from "react-router-dom";
import {
  Users, Key, DollarSign, Wallet, BadgeCheck, Megaphone,
  Link2, Zap, Webhook, MessageCircle, Settings, HelpCircle
} from "lucide-react";

const otherMenus = [
  { title: "Clients", description: "Gérez vos clients", icon: Users, path: "/dashboard/clients" },
  { title: "Licences", description: "Clés de licence", icon: Key, path: "/dashboard/licenses" },
  { title: "Revenus", description: "Historique des paiements", icon: DollarSign, path: "/dashboard/revenue" },
  { title: "Wallet", description: "Votre portefeuille", icon: Wallet, path: "/dashboard/wallet" },
  { title: "Badge Verify", description: "Obtenir votre badge", icon: BadgeCheck, path: "/dashboard/badge" },
  { title: "Marketing", description: "Codes promo & campagnes", icon: Megaphone, path: "/dashboard/marketing" },
  { title: "Affiliation", description: "Programme partenaire", icon: Link2, path: "/dashboard/affiliation" },
  { title: "Automatisations", description: "Workflows & API", icon: Zap, path: "/dashboard/automations" },
  { title: "Webhooks", description: "Écouteurs d'événements", icon: Webhook, path: "/dashboard/webhooks" },
  { title: "Messages", description: "Support client & litiges", icon: MessageCircle, path: "/dashboard/support" },
  { title: "Paramètres", description: "Configuration boutique", icon: Settings, path: "/dashboard/settings" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function DashboardOthers() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-1"
        >
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Autres</h1>
          <p className="text-sm text-muted-foreground">
            Accédez à tous vos outils secondaires, paramètres et fonctionnalités avancées.
          </p>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {otherMenus.map((menu) => (
            <motion.div
              key={menu.title}
              variants={item}
              onClick={() => navigate(menu.path)}
              className="group cursor-pointer rounded-xl bg-white border border-border p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
            >
              <div className="flex flex-col gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <menu.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                    {menu.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {menu.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
