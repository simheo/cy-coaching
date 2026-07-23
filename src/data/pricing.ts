export interface PriceGroup {
  title: string;
  note?: string;
  items: { label: string; price: string }[];
}

export const pricing: readonly PriceGroup[] = [
  {
    title: "Coaching individuel",
    items: [
      { label: "À l'unité", price: "60 €" },
      { label: "Carnet de 10 séances", price: "550 €" },
      { label: "Carnet de 20 séances + 1 accessoire fitness", price: "1000 € (50 €/séance)" },
    ],
  },
  {
    title: "Mini-groupe (2 à 5 personnes)",
    note: "par personne",
    items: [
      { label: "À deux", price: "35 €" },
      { label: "À trois", price: "30 €" },
      { label: "Quatre et plus", price: "25 €" },
    ],
  },
  {
    title: "Programmes à distance",
    note: "par mois",
    items: [
      { label: "Découverte — programmation générique pour découvrir les bases", price: "40 €/mois" },
      { label: "Débutant — programme personnalisé + retours vidéo hebdo", price: "80 €/mois" },
      { label: "Confirmé — programme + analyses vidéo + plan alimentaire + retours 7j/7", price: "120 €/mois" },
    ],
  },
];
