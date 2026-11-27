/* Termes d’offre EXIOR. Seule source des montants, du délai et du paiement.
   Décision Guillaume, 19.11.2026. Le document 01 fixe les phrases publiques. */
var EXIOR_OFFRE = {
  marque: "EXIOR",
  produit: "Architecture évolutive de votre entreprise",
  prix: "990\u00a0€",
  prixHt: "990\u00a0€ HT",
  prixMontant: "990",
  devise: "EUR",
  paiement: "paiement unique",
  delai: "7 jours ouvrés",
  declencheur: "après réception du dossier complet",
  perimetre: "Conception seulement.",
  hors: "Le déploiement, l’Espace EXIOR, l’hébergement et l’exploitation sont sur devis séparé.",
  cta: "Obtenir mon architecture — 990 €",
  stripe: "https://buy.stripe.com/fZu5kC0Zqenp5VF6h77IY05",
  email: "exior.tech@gmail.com"
};

function exiorEsc(value) {
  return String(value).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}
