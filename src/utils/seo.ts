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
    name: "[RAISON SOCIALE DU CLIENT]",
    image: absoluteUrl("/images/technicien-serrurier-toulouse.png"),
    url: absoluteUrl(location.url),
    telephone: "+33767850787",
    priceRange: "??",
    address: {
      "@type": "PostalAddress",
      streetAddress: "[ADRESSE DU SI?GE]",
      addressLocality: "Toulouse",
      postalCode: "[CODE POSTAL]",
      addressCountry: "FR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 43.604652,
      longitude: 1.444209,
    },
    areaServed: [{ "@type": "City", name: location.city }, ...location.nearbyCities.map((city) => ({ "@type": "City", name: city }))],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
    sameAs: ["https://www.google.com/maps/place/[LIEN-GOOGLE-BUSINESS-PROFILE]"],
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
