import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X, ChevronDown, LayoutDashboard, ShoppingBag, Store } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const productLinks = [
  { label: "Fichiers", href: "/fichiers" },
  { label: "Cours", href: "/cours" },
  { label: "Licences", href: "/licences" },
];

const moreLinks = [
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  return (
    <motion.nav
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass"
    >
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="TECHNOVA" className="h-8 w-8 rounded-lg object-contain" />
          <span className="text-lg font-bold text-foreground tracking-tight">TECHNOVA</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 lg:flex">
          <div className="relative group">
            <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Produits <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <div className="absolute top-full left-0 mt-2 w-44 rounded-xl border border-border bg-card p-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              {productLinks.map((l) => (
                <Link key={l.label} to={l.href} className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <Link to="/marketplace" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Marketplace</Link>
          <Link to="/outils-digitaux" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Productivité</Link>
          <Link to="/pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Tarifs</Link>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="text-sm font-medium gap-2">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Button>
              </Link>
              <Link to="/dashboard/profile">
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {profile?.display_name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </>
          ) : (
            <>
              <Link to="/buyer-login">
                <Button variant="ghost" size="sm" className="text-sm font-medium gap-2 text-muted-foreground">
                  <ShoppingBag className="h-4 w-4" /> Mes achats
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-sm font-medium text-muted-foreground">Connexion vendeur</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="text-sm font-semibold gap-2">
                  <Store className="h-4 w-4" /> Devenir vendeur
                </Button>
              </Link>
            </>
          )}
        </div>

        <button className="lg:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="lg:hidden border-t border-border bg-background px-6 py-4 space-y-2 max-h-[calc(100vh-72px)] overflow-y-auto">
          <button onClick={() => setProductsOpen(!productsOpen)} className="flex items-center justify-between w-full py-2 text-sm font-medium text-foreground">
            Produits <ChevronDown className={`h-4 w-4 transition-transform ${productsOpen ? "rotate-180" : ""}`} />
          </button>
          {productsOpen && (
            <div className="pl-4 space-y-1">
              {productLinks.map((l) => (
                <Link key={l.label} to={l.href} onClick={() => setMobileOpen(false)} className="block py-1.5 text-sm text-muted-foreground hover:text-foreground">{l.label}</Link>
              ))}
            </div>
          )}
          <Link to="/marketplace" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-foreground">Marketplace</Link>
          <Link to="/outils-digitaux" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-foreground">Productivité</Link>
          <Link to="/pricing" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-foreground">Tarifs</Link>
          {moreLinks.map((l) => (
            <Link key={l.label} to={l.href} onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-muted-foreground hover:text-foreground">{l.label}</Link>
          ))}
          <div className="flex gap-3 pt-4 border-t border-border">
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex-1">
                  <Button className="w-full" size="sm">Dashboard</Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => { signOut(); setMobileOpen(false); }}>Déconnexion</Button>
              </>
            ) : (
              <>
                <Link to="/buyer-login" onClick={() => setMobileOpen(false)} className="flex-1">
                  <Button variant="outline" className="w-full gap-2" size="sm">
                    <ShoppingBag className="h-4 w-4" /> Mes achats
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1">
                  <Button className="w-full gap-2" size="sm">
                    <Store className="h-4 w-4" /> Devenir vendeur
                  </Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
