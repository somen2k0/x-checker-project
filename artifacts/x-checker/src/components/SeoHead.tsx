import { useEffect } from "react";

const SITE_URL = "https://xtoolkit.live";

interface Faq {
  q: string;
  a: string;
}

interface SeoHeadProps {
  title: string;
  description: string;
  path?: string;
  faqs?: Faq[];
}

export function SeoHead({ title, description, path, faqs }: SeoHeadProps) {
  useEffect(() => {
    const canonicalUrl = path ? `${SITE_URL}${path}` : SITE_URL;

    const prev = document.title;
    document.title = title;

    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute("content") ?? "";
    metaDesc?.setAttribute("content", description);

    const metaOgTitle = document.querySelector('meta[property="og:title"]');
    const prevOgTitle = metaOgTitle?.getAttribute("content") ?? "";
    metaOgTitle?.setAttribute("content", title);

    const metaOgDesc = document.querySelector('meta[property="og:description"]');
    const prevOgDesc = metaOgDesc?.getAttribute("content") ?? "";
    metaOgDesc?.setAttribute("content", description);

    const metaOgUrl = document.querySelector('meta[property="og:url"]');
    const prevOgUrl = metaOgUrl?.getAttribute("content") ?? "";
    metaOgUrl?.setAttribute("content", canonicalUrl);

    let canonicalEl = document.querySelector('link[rel="canonical"]');
    const prevCanonical = canonicalEl?.getAttribute("href") ?? "";
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      (canonicalEl as HTMLLinkElement).rel = "canonical";
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute("href", canonicalUrl);

    let scriptEl: HTMLScriptElement | null = null;
    if (faqs && faqs.length > 0) {
      scriptEl = document.createElement("script");
      scriptEl.id = "faq-schema";
      scriptEl.type = "application/ld+json";
      scriptEl.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": canonicalUrl,
        mainEntity: faqs.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      });
      document.head.appendChild(scriptEl);
    }

    return () => {
      document.title = prev;
      metaDesc?.setAttribute("content", prevDesc);
      metaOgTitle?.setAttribute("content", prevOgTitle);
      metaOgDesc?.setAttribute("content", prevOgDesc);
      metaOgUrl?.setAttribute("content", prevOgUrl);
      canonicalEl?.setAttribute("href", prevCanonical);
      scriptEl?.remove();
    };
  }, [title, description, path, faqs]);

  return null;
}
