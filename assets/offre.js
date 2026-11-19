/* Termes d’offre EXIOR. Seule source éditable.
   Décision de Guillaume, 19.11.2026. */
var EXIOR_OFFRE = {
  marque: "EXIOR",
  produit: "Architecture personnalisée",
  prix: "990\u00a0€ HT",
  prixMontant: "990",
  devise: "EUR",
  paiement: "paiement unique",
  delai: "7\u00a0jours ouvrés",
  declencheur: "après réception du dossier complet",
  perimetre: "Conception seulement.",
  hors: "Le déploiement, l’Espace EXIOR, l’hébergement et l’exploitation sont sur devis séparé.",
  cta: "Obtenir mon architecture",
  signature: "EXIOR transforme l’innovation mondiale en avantage compétitif.",
  email: "exior.tech@gmail.com",
  description: "EXIOR conçoit une architecture personnalisée. 990\u00a0€ HT, paiement unique, livrée en 7\u00a0jours ouvrés après réception du dossier complet. Conception seulement."
};

function exiorEsc(value) {
  return String(value).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function exior(key) {
  var value = EXIOR_OFFRE[key];
  if (value == null) return;
  document.write(exiorEsc(value));
}
