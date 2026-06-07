export type LocationConfig = {
  slug: string;
  city: string;
  url: string;
  title: string;
  description: string;
  heroTitle: string;
  heroSub: string;
  heroTagline: string;
  heroPromise: string;
  solutionArea: string;
  resultArea: string;
  urgencyZoneText: string;
  reassuranceText: string;
  nearbyCities: string[];
  neighboringSlugs: string[];
  footerLabel: string;
};

export const locations: LocationConfig[] = [
  {
    slug: "",
    city: "Toulouse",
    url: "/",
    title: "Serrurier à Toulouse | Intervention rapide 24h/24",
    description:
      "Serrurier à Toulouse disponible 24h/24 et 7j/7 pour ouverture de porte, serrure bloquée, remplacement de serrure et urgence serrurerie. Tarif annoncé avant intervention.",
    heroTitle: "SOS SERRURIER À TOULOUSE",
    heroSub: "Vous êtes bloqué à Toulouse ?",
    heroTagline: "On intervient partout dans Toulouse et son agglomération 24h/24, 7j/7.",
    heroPromise: "Prix annoncés avant intervention. Zéro surprise, 100% transparence.",
    solutionArea: "Toulouse & toute l'agglomération",
    resultArea: "Interventions à Toulouse et communes proches",
    urgencyZoneText: "Interventions en cours à Toulouse et agglomération. Délai actuel : moins de 30 min.",
    reassuranceText:
      "Un serrurier de confiance à Toulouse, disponible pour sécuriser votre porte et vous dépanner sans mauvaise surprise.",
    nearbyCities: ["Balma", "Labège", "Colomiers", "Blagnac", "Muret"],
    neighboringSlugs: ["serrurier-balma", "serrurier-labege", "serrurier-colomiers", "serrurier-blagnac", "serrurier-tournefeuille"],
    footerLabel: "Toulouse",
  },
  {
    slug: "serrurier-balma",
    city: "Balma",
    url: "/serrurier-balma",
    title: "Serrurier à Balma | Intervention rapide 24h/24",
    description:
      "Serrurier à Balma disponible 24h/24 et 7j/7. Intervention rapide pour porte claquée, serrure bloquée, changement de cylindre et dépannage urgent. Prix annoncé avant intervention.",
    heroTitle: "SOS SERRURIER À BALMA",
    heroSub: "Porte claquée ou serrure bloquée à Balma ?",
    heroTagline: "Un serrurier intervient à Balma et à l'est de Toulouse 24h/24, 7j/7.",
    heroPromise: "Tarif annoncé avant déplacement. Intervention claire, rapide et sans frais cachés.",
    solutionArea: "Balma, Gramont & Est toulousain",
    resultArea: "Interventions à Balma, Gramont et quartiers proches",
    urgencyZoneText: "Technicien mobilisable à Balma, Gramont et vers Toulouse Est. Délai actuel : moins de 30 min.",
    reassuranceText:
      "À Balma, l'intervention reste transparente : diagnostic, tarif annoncé, puis accord avant tout travail.",
    nearbyCities: ["Toulouse", "L'Union", "Quint-Fonsegrives", "Montrabé", "Labège"],
    neighboringSlugs: ["", "serrurier-labege", "serrurier-saint-orens-de-gameville", "serrurier-ramonville-saint-agne"],
    footerLabel: "Balma",
  },
  {
    slug: "serrurier-labege",
    city: "Labège",
    url: "/serrurier-labege",
    title: "Serrurier à Labège | Dépannage serrurerie 24h/24",
    description:
      "Serrurier à Labège disponible 24h/24 pour ouverture de porte, serrure bloquée, clés perdues et remplacement de serrure. Prix annoncé avant intervention.",
    heroTitle: "SOS SERRURIER À LABÈGE",
    heroSub: "Besoin d'un serrurier à Labège ?",
    heroTagline: "Intervention rapide à Labège, Innopole et au Sud-Est de Toulouse 24h/24, 7j/7.",
    heroPromise: "Un prix clair avant intervention, même en urgence.",
    solutionArea: "Labège, Innopole & Sud-Est toulousain",
    resultArea: "Interventions à Labège, Innopole et communes proches",
    urgencyZoneText: "Interventions possibles à Labège, Innopole, Escalquens et Ramonville. Délai actuel : moins de 30 min.",
    reassuranceText:
      "À Labège, nous privilégions une ouverture propre et une solution adaptée au niveau de sécurité de votre porte.",
    nearbyCities: ["Ramonville-Saint-Agne", "Escalquens", "Saint-Orens-de-Gameville", "Toulouse", "Balma"],
    neighboringSlugs: ["serrurier-ramonville-saint-agne", "serrurier-saint-orens-de-gameville", "", "serrurier-balma"],
    footerLabel: "Labège",
  },
  {
    slug: "serrurier-colomiers",
    city: "Colomiers",
    url: "/serrurier-colomiers",
    title: "Serrurier à Colomiers | Dépannage serrurerie 7j/7",
    description:
      "Serrurier à Colomiers disponible 24h/24 et 7j/7 pour dépannage urgent, porte claquée, serrure cassée ou changement de cylindre. Tarif annoncé avant intervention.",
    heroTitle: "SOS SERRURIER À COLOMIERS",
    heroSub: "Vous êtes bloqué à Colomiers ?",
    heroTagline: "Dépannage serrurerie à Colomiers et dans l'Ouest toulousain 24h/24, 7j/7.",
    heroPromise: "Prix annoncé à l'avance. Pas de frais cachés, pas de surfacturation abusive.",
    solutionArea: "Colomiers & Ouest toulousain",
    resultArea: "Interventions à Colomiers, Tournefeuille et Blagnac",
    urgencyZoneText: "Technicien disponible vers Colomiers, Airbus, Tournefeuille et Blagnac. Délai actuel : moins de 30 min.",
    reassuranceText:
      "À Colomiers, le dépannage est expliqué avant intervention afin de garder le contrôle sur le prix et la solution.",
    nearbyCities: ["Tournefeuille", "Blagnac", "Toulouse", "Cugnaux", "Pibrac"],
    neighboringSlugs: ["serrurier-tournefeuille", "serrurier-blagnac", "", "serrurier-cugnaux"],
    footerLabel: "Colomiers",
  },
  {
    slug: "serrurier-blagnac",
    city: "Blagnac",
    url: "/serrurier-blagnac",
    title: "Serrurier à Blagnac | Intervention rapide 24h/24",
    description:
      "Serrurier à Blagnac disponible jour et nuit pour ouverture de porte, serrure bloquée, tentative d'effraction et remplacement de serrure. Tarif annoncé avant intervention.",
    heroTitle: "SOS SERRURIER À BLAGNAC",
    heroSub: "Urgence serrurerie à Blagnac ?",
    heroTagline: "Intervention à Blagnac, secteur aéroport et Nord-Ouest toulousain 24h/24, 7j/7.",
    heroPromise: "Un tarif communiqué avant intervention, avec validation avant tout dépannage.",
    solutionArea: "Blagnac, aéroport & Nord-Ouest toulousain",
    resultArea: "Interventions à Blagnac, aéroport et communes voisines",
    urgencyZoneText: "Interventions à Blagnac, secteur aéroport, Beauzelle et Colomiers. Délai actuel : moins de 30 min.",
    reassuranceText:
      "À Blagnac, nous intervenons pour ouvrir, réparer ou sécuriser votre accès avec une approche claire et professionnelle.",
    nearbyCities: ["Colomiers", "Beauzelle", "Toulouse", "Tournefeuille", "Cornebarrieu"],
    neighboringSlugs: ["serrurier-colomiers", "", "serrurier-tournefeuille", "serrurier-cugnaux"],
    footerLabel: "Blagnac",
  },
  {
    slug: "serrurier-tournefeuille",
    city: "Tournefeuille",
    url: "/serrurier-tournefeuille",
    title: "Serrurier à Tournefeuille | Urgence serrurerie 24h/24",
    description:
      "Serrurier à Tournefeuille disponible 24h/24 et 7j/7 pour porte claquée, clés perdues, serrure bloquée et remplacement de cylindre. Prix annoncé avant intervention.",
    heroTitle: "SOS SERRURIER À TOURNEFEUILLE",
    heroSub: "Porte fermée ou clés perdues à Tournefeuille ?",
    heroTagline: "Dépannage rapide à Tournefeuille, Plaisance-du-Touch et Ouest toulousain.",
    heroPromise: "Devis clair avant intervention. Vous validez avant que le travail commence.",
    solutionArea: "Tournefeuille & communes de l'Ouest",
    resultArea: "Interventions à Tournefeuille, Colomiers et Cugnaux",
    urgencyZoneText: "Technicien mobilisable à Tournefeuille, Plaisance-du-Touch, Colomiers et Cugnaux. Délai actuel : moins de 30 min.",
    reassuranceText:
      "À Tournefeuille, nous privilégions une intervention propre, sans casse lorsque la situation le permet.",
    nearbyCities: ["Colomiers", "Cugnaux", "Plaisance-du-Touch", "Toulouse", "Blagnac"],
    neighboringSlugs: ["serrurier-colomiers", "serrurier-cugnaux", "", "serrurier-blagnac"],
    footerLabel: "Tournefeuille",
  },
  {
    slug: "serrurier-muret",
    city: "Muret",
    url: "/serrurier-muret",
    title: "Serrurier à Muret | Dépannage urgent 24h/24",
    description:
      "Serrurier à Muret disponible 24h/24 pour urgence serrurerie, ouverture de porte, serrure bloquée, remplacement de cylindre et sécurisation après effraction.",
    heroTitle: "SOS SERRURIER À MURET",
    heroSub: "Besoin d'un dépannage serrurier à Muret ?",
    heroTagline: "Intervention à Muret et au Sud de Toulouse 24h/24, 7j/7.",
    heroPromise: "Tarif annoncé avant intervention. Aucun travail sans accord préalable.",
    solutionArea: "Muret & Sud toulousain",
    resultArea: "Interventions à Muret, Portet-sur-Garonne et sud toulousain",
    urgencyZoneText: "Interventions à Muret, Seysses, Portet-sur-Garonne et communes proches. Délai actuel : moins de 30 min.",
    reassuranceText:
      "À Muret, nous sécurisons rapidement votre accès après perte de clés, porte claquée ou tentative d'effraction.",
    nearbyCities: ["Portet-sur-Garonne", "Seysses", "Cugnaux", "Toulouse", "Tournefeuille"],
    neighboringSlugs: ["serrurier-cugnaux", "serrurier-tournefeuille", ""],
    footerLabel: "Muret",
  },
  {
    slug: "serrurier-cugnaux",
    city: "Cugnaux",
    url: "/serrurier-cugnaux",
    title: "Serrurier à Cugnaux | Intervention rapide 7j/7",
    description:
      "Serrurier à Cugnaux disponible 24h/24 pour ouverture de porte, dépannage de serrure, clés perdues et remplacement de serrure. Prix annoncé avant déplacement.",
    heroTitle: "SOS SERRURIER À CUGNAUX",
    heroSub: "Urgence serrurier à Cugnaux ?",
    heroTagline: "Intervention rapide à Cugnaux, Villeneuve-Tolosane et Sud-Ouest toulousain.",
    heroPromise: "Prix clair avant déplacement et intervention validée avec vous.",
    solutionArea: "Cugnaux & Sud-Ouest toulousain",
    resultArea: "Interventions à Cugnaux, Tournefeuille et Muret",
    urgencyZoneText: "Technicien mobilisable à Cugnaux, Villeneuve-Tolosane, Tournefeuille et Muret. Délai actuel : moins de 30 min.",
    reassuranceText:
      "À Cugnaux, nous vous aidons à retrouver l'accès à votre logement avec une intervention expliquée et maîtrisée.",
    nearbyCities: ["Tournefeuille", "Villeneuve-Tolosane", "Muret", "Colomiers", "Toulouse"],
    neighboringSlugs: ["serrurier-tournefeuille", "serrurier-muret", "serrurier-colomiers", ""],
    footerLabel: "Cugnaux",
  },
  {
    slug: "serrurier-saint-orens-de-gameville",
    city: "Saint-Orens-de-Gameville",
    url: "/serrurier-saint-orens-de-gameville",
    title: "Serrurier à Saint-Orens-de-Gameville | Intervention 24h/24",
    description:
      "Serrurier à Saint-Orens-de-Gameville disponible 24h/24 pour porte claquée, serrure bloquée, dépannage urgent et remplacement de serrure. Tarif annoncé avant intervention.",
    heroTitle: "SOS SERRURIER À SAINT-ORENS",
    heroSub: "Serrure bloquée à Saint-Orens-de-Gameville ?",
    heroTagline: "Dépannage à Saint-Orens-de-Gameville et au Sud-Est de Toulouse 24h/24, 7j/7.",
    heroPromise: "Tarif annoncé avant intervention. Une solution claire avant tout dépannage.",
    solutionArea: "Saint-Orens & Sud-Est toulousain",
    resultArea: "Interventions à Saint-Orens, Labège et Ramonville",
    urgencyZoneText: "Interventions à Saint-Orens-de-Gameville, Labège, Quint-Fonsegrives et Ramonville. Délai actuel : moins de 30 min.",
    reassuranceText:
      "À Saint-Orens-de-Gameville, nous intervenons pour dépanner et sécuriser votre porte avec transparence.",
    nearbyCities: ["Labège", "Ramonville-Saint-Agne", "Quint-Fonsegrives", "Balma", "Toulouse"],
    neighboringSlugs: ["serrurier-labege", "serrurier-ramonville-saint-agne", "serrurier-balma", ""],
    footerLabel: "Saint-Orens",
  },
  {
    slug: "serrurier-ramonville-saint-agne",
    city: "Ramonville-Saint-Agne",
    url: "/serrurier-ramonville-saint-agne",
    title: "Serrurier à Ramonville-Saint-Agne | Dépannage 24h/24",
    description:
      "Serrurier à Ramonville-Saint-Agne disponible 24h/24 pour ouverture de porte, serrure bloquée, changement de cylindre et urgence serrurerie. Prix annoncé avant intervention.",
    heroTitle: "SOS SERRURIER À RAMONVILLE",
    heroSub: "Besoin d'un serrurier à Ramonville-Saint-Agne ?",
    heroTagline: "Intervention à Ramonville-Saint-Agne, Rangueil et Sud-Est toulousain 24h/24, 7j/7.",
    heroPromise: "Un prix annoncé avant intervention, avec accord avant tout travail.",
    solutionArea: "Ramonville, Rangueil & Sud-Est toulousain",
    resultArea: "Interventions à Ramonville, Labège et Toulouse sud",
    urgencyZoneText: "Interventions à Ramonville-Saint-Agne, Rangueil, Labège et Saint-Orens. Délai actuel : moins de 30 min.",
    reassuranceText:
      "À Ramonville-Saint-Agne, nous intervenons rapidement pour les urgences de serrurerie avec une facturation transparente.",
    nearbyCities: ["Labège", "Saint-Orens-de-Gameville", "Toulouse Rangueil", "Balma", "Cugnaux"],
    neighboringSlugs: ["serrurier-labege", "serrurier-saint-orens-de-gameville", "", "serrurier-balma"],
    footerLabel: "Ramonville",
  },
];

export const mainLocation = locations[0];

export function getLocalPageLocations() {
  return locations.filter((location) => location.slug);
}

export function getLocationBySlug(slug: string) {
  return locations.find((location) => location.slug === slug);
}

export function getNeighborLocations(location: LocationConfig, limit = 5) {
  const configured = location.neighboringSlugs
    .map((slug) => getLocationBySlug(slug))
    .filter((item): item is LocationConfig => Boolean(item));
  const fallback = locations.filter((item) => item.url !== location.url && !configured.some((linked) => linked.url === item.url));

  return [...configured, ...fallback].slice(0, limit);
}

export function absoluteUrl(path: string) {
  return `https://serruriertoulouse.fr${path}`;
}
