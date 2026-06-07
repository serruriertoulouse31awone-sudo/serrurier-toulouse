import { mainLocation, type LocationConfig } from "@/data/locations";

export type FaqItem = {
  question: string;
  answer: string;
};

export function createLocationFaq(location: LocationConfig): FaqItem[] {
  const nearby = location.nearbyCities.join(", ");

  return [
    {
      question: `Combien coûte l'intervention d'un serrurier à ${location.city} ?`,
      answer:
        "Le prix dépend du type d'intervention : porte claquée, serrure bloquée, remplacement de cylindre ou sécurisation après effraction. Le tarif est annoncé clairement avant toute intervention afin d'éviter les mauvaises surprises.",
    },
    {
      question: `Intervenez-vous en urgence à ${location.city} ?`,
      answer: `Oui, nous intervenons rapidement à ${location.city} pour les urgences de serrurerie : porte claquée, clés perdues, serrure cassée ou tentative d'effraction.`,
    },
    {
      question: `Quel est le délai d'intervention à ${location.city} ?`,
      answer: `Le délai dépend de votre adresse exacte, du trafic et de la disponibilité du technicien. Sur ${location.city} et les secteurs proches, l'objectif est d'intervenir rapidement après votre appel.`,
    },
    {
      question: "Êtes-vous disponible la nuit, le week-end et les jours fériés ?",
      answer:
        "Oui, le service est disponible 24h/24 et 7j/7, y compris la nuit, le week-end et les jours fériés.",
    },
    {
      question: "Pouvez-vous ouvrir une porte claquée sans la casser ?",
      answer:
        "Dans la majorité des cas, une porte simplement claquée peut être ouverte sans dégât. Le serrurier vérifie d'abord la situation avant de proposer la solution la plus adaptée.",
    },
    {
      question: `Intervenez-vous autour de ${location.city} ?`,
      answer: `Oui, nous intervenons à ${location.city} et dans les communes proches comme ${nearby}.`,
    },
    {
      question: "Le prix est-il annoncé avant intervention ?",
      answer:
        "Oui, le tarif est communiqué avant toute intervention et validé avec le client. Aucun travail n'est réalisé sans accord préalable.",
    },
    {
      question: "Y a-t-il des frais cachés ?",
      answer:
        "Non. Il n'y a aucun frais caché, aucune surfacturation abusive et aucune pratique frauduleuse. La transparence fait partie de nos engagements.",
    },
  ];
}

export const homeFaqItems = createLocationFaq(mainLocation);
