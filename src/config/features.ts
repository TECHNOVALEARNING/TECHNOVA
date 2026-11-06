// Interrupteurs d'affichage du site.
// Passer à true pour réafficher la rubrique sans rien recoder.

/** Technova Games : section de l'accueil, lien "Plateformes" de la navbar, apps de jeu */
export const SHOW_TECHNOVA_GAMES = false;

/**
 * Inscription vendeur publique (bouton « Devenir vendeur », page /register).
 * false : seuls les comptes créés ou activés par l'administrateur accèdent au tableau de bord vendeur.
 */
export const PUBLIC_SELLER_SIGNUP = false;

/** Les comptes créés avant cette date restent vendeurs (vendeurs déjà inscrits). */
export const SELLER_GRANDFATHER_CUTOFF = "2026-11-06T00:00:00Z";
