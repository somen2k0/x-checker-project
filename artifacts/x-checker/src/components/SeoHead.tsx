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
  extraSchemas?: object[];
}

export function SeoHead({ title, description, path, faqs, extraSchemas }: SeoHeadProps) {
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

    const metaTwitterTitle = document.querySelector('meta[name="twitter:title"]');
    const prevTwitterTitle = metaTwitterTitle?.getAttribute("content") ?? "";
    metaTwitterTitle?.setAttribute("content", title);

    const metaTwitterDesc = document.querySelector('meta[name="twitter:description"]');
    const prevTwitterDesc = metaTwitterDesc?.getAttribute("content") ?? "";
    metaTwitterDesc?.setAttribute("content", description);

    let canonicalEl = document.querySelector('link[rel="canonical"]');
    const prevCanonical = canonicalEl?.getAttribute("href") ?? "";
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      (canonicalEl as HTMLLinkElement).rel = "canonical";
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute("href", canonicalUrl);

    const injectedScripts: HTMLScriptElement[] = [];

    if (faqs && faqs.length > 0) {
      const el = document.createElement("script");
      el.id = "faq-schema";
      el.type = "application/ld+json";
      el.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        mainEntity: faqs.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      });
      document.head.appendChild(el);
      injectedScripts.push(el);
    }

    if (extraSchemas && extraSchemas.length > 0) {
      extraSchemas.forEach((schema, i) => {
        const el = document.createElement("script");
        el.id = `extra-schema-${i}`;
        el.type = "application/ld+json";
        el.textContent = JSON.stringify(schema);
        document.head.appendChild(el);
        injectedScripts.push(el);
      });
    }

    return () => {
      document.title = prev;
      metaDesc?.setAttribute("content", prevDesc);
      metaOgTitle?.setAttribute("content", prevOgTitle);
      metaOgDesc?.setAttribute("content", prevOgDesc);
      metaOgUrl?.setAttribute("content", prevOgUrl);
      metaTwitterTitle?.setAttribute("content", prevTwitterTitle);
      metaTwitterDesc?.setAttribute("content", prevTwitterDesc);
      canonicalEl?.setAttribute("href", prevCanonical);
      injectedScripts.forEach((el) => el.remove());
    };
  }, [title, description, path, faqs, extraSchemas]);

  return null;
}
