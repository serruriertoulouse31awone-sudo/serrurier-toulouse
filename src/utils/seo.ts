import { absoluteUrl, type LocationConfig } from "@/data/locations";
import type { FaqItem } from "@/data/faqContent";

export type PageMetadata = {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
};

export function createLocationMetadata(location: LocationConfig): PageMetadata {
  return {
    title: location.title,
    description: location.description,
    canonical: absoluteUrl(location.url),
    ogImage: absoluteUrl("/images/technicien-serrurier-toulouse.png"),
  };
}

export function createLocalBusinessJsonLd(location: LocationConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "Locksmith",
    name: "Serrurier Toulouse",
    image: absoluteUrl("/images/technicien-serrurier-toulouse.png"),
    url: absoluteUrl(location.url),
    telephone: "+33687520663",
    areaServed: [{ "@type": "City", name: location.city }, ...location.nearbyCities.map((city) => ({ "@type": "City", name: city }))],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
  };
}

export function createFaqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
