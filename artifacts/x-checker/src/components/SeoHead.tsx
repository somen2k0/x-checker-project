import { useEffect } from "react";

interface Faq {
  q: string;
  a: string;
}

interface SeoHeadProps {
  title: string;
  description: string;
  faqs?: Faq[];
}

export function SeoHead({ title, description, faqs }: SeoHeadProps) {
  useEffect(() => {
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

    let scriptEl: HTMLScriptElement | null = null;
    if (faqs && faqs.length > 0) {
      scriptEl = document.createElement("script");
      scriptEl.id = "faq-schema";
      scriptEl.type = "application/ld+json";
      scriptEl.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
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
      scriptEl?.remove();
    };
  }, [title, description, faqs]);

  return null;
}
