import { Layout } from "@/components/layout/Layout";
import { SeoHead } from "@/components/SeoHead";
import { Link } from "wouter";
import { Shield } from "lucide-react";

const sections = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    content: `X Toolkit is designed with privacy as a default. We collect the absolute minimum necessary to operate the service.

**Information you provide:**
- Usernames you enter into the Account Checker (processed in real-time, never stored)
- Topics and tones entered into the Bio Generator (processed in real-time, never stored)
- Code, text, or data entered into developer tools like JSON Formatter, JWT Decoder, Base64, etc. (all processed locally in your browser — never sent to our servers)
- Messages sent through the Contact / Feedback form
- Email addresses entered into the newsletter signup (stored only to send update emails)

**Information collected automatically:**
- Standard web server access logs (IP address, browser type, pages visited) for security and abuse prevention. These logs are retained for no more than 30 days and are not shared with third parties.`,
  },
  {
    id: "how-we-use",
    title: "2. How We Use Your Information",
    content: `We use the information described above only to:

- Operate and improve X Toolkit
- Respond to feedback and support requests
- Send occasional product update emails (only if you subscribed)
- Detect and prevent abuse or fraudulent use of the service

We do not sell, rent, or share your personal information with any third party for marketing purposes.`,
  },
  {
    id: "data-storage",
    title: "3. Data Storage & Security",
    content: `**What we store:**
- Server-side: standard access logs (retained ≤ 30 days), feedback form submissions, newsletter email addresses.
- Client-side: Groq API keys and app preferences are stored in your browser's localStorage. This data never leaves your device.

**What we don't store:**
- Usernames checked through the Account Checker
- Bio generation inputs or outputs
- Code, text, or data entered into any developer, SEO, or email tool
- Results from any tool

All data in transit is encrypted via HTTPS/TLS. We use industry-standard security practices to protect stored data.`,
  },
  {
    id: "third-party",
    title: "4. Third-Party Services",
    content: `X Toolkit integrates with the following third-party services:

- **X (Twitter) API** — used to check account status. Usernames are sent to X's API servers to retrieve status information. This is subject to X's own Privacy Policy.
- **Groq API** — used to power the Bio Generator. Your requests are sent to Groq's servers using the API key you provide. This is subject to Groq's Privacy Policy.
- **Third-party temporary email infrastructure** — used to power the Temp Mail tool. These underlying services have their own privacy policies.
- **Google Analytics** — used in aggregate, anonymized form to understand how tools are used. No personally identifiable information is shared.

We have no control over the data practices of these third-party services.`,
  },
  {
    id: "browser-tools",
    title: "5. Browser-Side Processing",
    content: `Many X Toolkit tools run entirely in your browser and send no data to our servers:

- JSON Formatter / Validator
- Base64 Encoder & Decoder
- JWT Decoder
- Regex Tester
- SQL Formatter
- CSS Minifier
- HTML Formatter
- URL Encoder
- UUID Generator
- Character Counter
- Plain Text Formatter
- Hashtag Formatter
- Tweet Formatter
- Meta Tag Generator
- URL Slug Generator
- Keyword Density Checker
- Robots.txt Generator
- Email Signature Generator
- Email Character Counter
- Email Validator

For these tools, your input data never leaves your device.`,
  },
  {
    id: "cookies",
    title: "6. Cookies",
    content: `X Toolkit uses minimal cookies:

- **Functional cookies**: used to remember your preferences (e.g., tab selections, cookie consent). These are strictly necessary for the service to function.
- **Analytics**: we use anonymized, aggregate analytics to understand usage patterns. No personally identifiable data is collected.

We do not use advertising or tracking cookies.`,
  },
  {
    id: "your-rights",
    title: "7. Your Rights",
    content: `Depending on your location, you may have the following rights regarding your personal data:

- **Right to access**: request a copy of any personal data we hold about you
- **Right to deletion**: request deletion of your personal data
- **Right to portability**: request your data in a portable format
- **Right to opt out**: unsubscribe from newsletter emails at any time

To exercise any of these rights, contact us using the Feedback form.`,
  },
  {
    id: "children",
    title: "8. Children's Privacy",
    content: `X Toolkit is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a child, please contact us immediately and we will delete it promptly.`,
  },
  {
    id: "changes",
    title: "9. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. When we do, we will update the "Last Updated" date at the top of this page. Continued use of X Toolkit after changes constitutes acceptance of the updated policy. If we make material changes, we will provide more prominent notice.`,
  },
  {
    id: "contact",
    title: "10. Contact Us",
    content: `If you have any questions about this Privacy Policy or how we handle your data, please contact us via the Feedback form available in the navigation bar or footer.`,
  },
];

export default function Privacy() {
  return (
    <Layout>
      <SeoHead
        title="Privacy Policy — X Toolkit"
        description="X Toolkit's privacy policy. We collect the absolute minimum necessary to operate the service. No usernames, results, or personal data are ever stored."
        path="/privacy"
      />
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-16">

        {/* Header */}
        <div className="mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/8 border border-primary/20 rounded-full px-3 py-1">
            <Shield className="h-3 w-3" /> Legal
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: <span className="text-foreground/80">May 2026</span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            At X Toolkit, your privacy matters. This policy explains what data we collect,
            how we use it, and your rights — written in plain language, not legalese.
          </p>
        </div>

        {/* Quick summary */}
        <div className="mb-10 rounded-xl border border-success/20 bg-success/5 p-5 space-y-2">
          <p className="text-sm font-semibold text-success">TL;DR — the short version</p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><span className="text-success mt-0.5">✓</span> We don't store the usernames you check or bios you generate.</li>
            <li className="flex items-start gap-2"><span className="text-success mt-0.5">✓</span> Developer, SEO, and email formatting tools run entirely in your browser — nothing is sent to our servers.</li>
            <li className="flex items-start gap-2"><span className="text-success mt-0.5">✓</span> API keys stay in your browser only — we never see them.</li>
            <li className="flex items-start gap-2"><span className="text-success mt-0.5">✓</span> We don't sell your data. Ever.</li>
            <li className="flex items-start gap-2"><span className="text-success mt-0.5">✓</span> We use anonymized analytics only — no personally identifiable tracking.</li>
          </ul>
        </div>

        {/* Table of contents */}
        <div className="mb-10 rounded-xl border border-border/60 bg-card/40 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Contents</p>
          <ol className="space-y-1.5">
            {sections.map(({ id, title }) => (
              <li key={id}>
                <a href={`#${id}`} className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline">
                  {title}
                </a>
              </li>
            ))}
          </ol>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map(({ id, title, content }) => (
            <section key={id} id={id} className="scroll-mt-20">
              <h2 className="text-lg font-semibold mb-3">{title}</h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
                {content.split("\n\n").map((para, i) => {
                  if (para.startsWith("**") && !para.includes("\n")) {
                    return <p key={i} className="font-semibold text-foreground/80">{para.replace(/\*\*/g, "")}</p>;
                  }
                  const lines = para.split("\n").map((line, j) => {
                    const bold = line.replace(/\*\*([^*]+)\*\*/g, (_, t) => `<strong>${t}</strong>`);
                    return <span key={j} dangerouslySetInnerHTML={{ __html: bold }} />;
                  });
                  if (para.startsWith("- ")) {
                    return (
                      <ul key={i} className="space-y-1.5 pl-1">
                        {para.split("\n").map((line, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <span className="text-muted-foreground/40 mt-1">•</span>
                            <span dangerouslySetInnerHTML={{ __html: line.replace(/^- /, "").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>") }} />
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={i}>{lines}</p>;
                })}
              </div>
              <div className="mt-6 border-b border-border/30" />
            </section>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-10 text-center space-y-2 text-sm text-muted-foreground">
          <p>Questions? Use the <a href="#" className="text-primary hover:underline">Feedback form</a> to reach us.</p>
          <p><Link href="/terms"><span className="text-primary hover:underline cursor-pointer">Terms of Service</span></Link> · <Link href="/about"><span className="text-primary hover:underline cursor-pointer">About</span></Link></p>
        </div>

      </div>
    </Layout>
  );
}
