import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Link } from "wouter";
import { FileText } from "lucide-react";

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: `By accessing or using X Toolkit ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, you may not use the Service.

These Terms apply to all visitors, users, and others who access or use the Service.`,
  },
  {
    id: "description",
    title: "2. Description of Service",
    content: `X Toolkit is a free, web-based collection of 39+ productivity tools organized across six categories:

**X Account Tools:**
- Account Checker — bulk-check the status of up to 100 X accounts (active, suspended, or not found)
- Profile Link Generator — converts usernames into clickable X profile URLs
- @ Formatter — bulk add or remove the @ prefix from username lists
- Bio Generator — AI-powered bio generation for X profiles

**AI Writing Tools:** bio templates (funny, professional, aesthetic), username and name idea generators.

**Text & Format Tools:** character counter, tweet formatter, hashtag formatter, plain-text formatter, font preview.

**Developer Tools:** JSON formatter, JWT decoder, Base64 encoder/decoder, Regex tester, SQL formatter, CSS minifier, HTML formatter, URL encoder, UUID generator.

**SEO Tools:** meta tag generator, URL slug generator, keyword density checker, robots.txt generator, sitemap validator.

**Email Tools:** disposable email inboxes, email validator, email signature generator, subject line generator, email character counter.

The Service is provided "as is" and we reserve the right to modify, suspend, or discontinue any feature at any time without notice.`,
  },
  {
    id: "use",
    title: "3. Acceptable Use",
    content: `You may use X Toolkit for lawful purposes only. You agree not to use the Service to:

- Violate any applicable laws or regulations
- Harass, stalk, or harm any individuals
- Collect information about individuals for unsolicited contact (spam)
- Scrape or bulk-collect data for malicious purposes
- Interfere with or disrupt the Service or servers
- Circumvent any rate limits or access restrictions
- Reverse-engineer or attempt to extract the source code of the Service
- Use the Account Checker to target or surveil specific individuals in violation of X's Terms of Service

We reserve the right to terminate or restrict access for any user who violates these terms.`,
  },
  {
    id: "third-party",
    title: "4. Third-Party Services",
    content: `X Toolkit interacts with third-party services, including X's API, Groq's API, mail.tm, and Guerrilla Mail. Your use of these third-party services is governed by their respective terms:

- X (Twitter) Terms of Service: x.com/en/tos
- Groq Terms of Service: groq.com/terms-of-service
- mail.tm Terms: mail.tm
- Guerrilla Mail Terms: guerrillamail.com

We are not responsible for the availability, accuracy, or legality of third-party services. X's API may change or become unavailable at any time, which could affect the functionality of the Account Checker.`,
  },
  {
    id: "api-keys",
    title: "5. API Keys",
    content: `The Bio Generator feature requires you to provide your own Groq API key. By adding a key:

- You confirm that you are authorized to use the key
- You accept full responsibility for usage and any associated costs on your Groq account
- You acknowledge that the key is stored in your browser's localStorage and is never transmitted to or stored by X Toolkit's servers

We are not responsible for any unauthorized use of your API key or any charges incurred through its use.`,
  },
  {
    id: "accuracy",
    title: "6. Accuracy of Information",
    content: `Account status information provided by the Account Checker is sourced in real-time from X's public API. While we strive for accuracy:

- Results reflect X's data at the time of the request and may not be perfectly current
- X's API may occasionally return incorrect or rate-limited responses, resulting in "Unknown" status
- We make no warranty that account status information is accurate, complete, or up-to-date

Generated bios from the Bio Generator are AI-generated suggestions. Review all generated content before use. We are not responsible for how generated content is used.

Developer, SEO, and email formatting tools process your input client-side. Results are provided as-is for informational purposes only.`,
  },
  {
    id: "temp-mail",
    title: "7. Temporary Email Inboxes",
    content: `The Temp Mail tool provides access to disposable email addresses via third-party providers (mail.tm and Guerrilla Mail). By using this feature:

- Inboxes are temporary and will expire according to the third-party provider's policy
- We do not control, read, store, or guarantee delivery of messages
- You must not use temporary email addresses to circumvent signup requirements for services that prohibit it
- You assume full responsibility for how you use temporary email addresses`,
  },
  {
    id: "intellectual-property",
    title: "8. Intellectual Property",
    content: `X Toolkit's code, design, and content (excluding user-provided inputs) are the property of X Toolkit and protected by applicable intellectual property laws.

"X" and "Twitter" are trademarks of X Corp. X Toolkit is an independent tool and is not affiliated with, endorsed by, or sponsored by X Corp.`,
  },
  {
    id: "disclaimer",
    title: "9. Disclaimer of Warranties",
    content: `THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.

We do not warrant that:
- The Service will be uninterrupted, error-free, or secure
- Any results obtained from using the Service will be accurate or reliable
- Defects in the Service will be corrected`,
  },
  {
    id: "limitation",
    title: "10. Limitation of Liability",
    content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, X TOOLKIT SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, DATA LOSS, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.

Our total liability to you for any claims arising under these Terms shall not exceed $0 (as the Service is provided free of charge).`,
  },
  {
    id: "changes",
    title: "11. Changes to Terms",
    content: `We reserve the right to update or modify these Terms at any time. When we do, we will update the "Last Updated" date at the top of this page. Continued use of the Service after changes constitutes your acceptance of the revised Terms.

If changes are material, we will make reasonable efforts to notify users (e.g., via a notice on the Service).`,
  },
  {
    id: "governing-law",
    title: "12. Governing Law",
    content: `These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising under these Terms shall be resolved through binding arbitration or the applicable courts in the jurisdiction where the Service operator is located.`,
  },
  {
    id: "contact",
    title: "13. Contact",
    content: `If you have questions about these Terms, please contact us using the Feedback form available throughout the Service.`,
  },
];

export default function Terms() {
  useEffect(() => {
    document.title = "Terms of Service — X Toolkit";
  }, []);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-16">

        {/* Header */}
        <div className="mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/8 border border-primary/20 rounded-full px-3 py-1">
            <FileText className="h-3 w-3" /> Legal
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: <span className="text-foreground/80">May 2026</span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Please read these Terms carefully before using X Toolkit. By using the Service,
            you agree to be bound by these Terms.
          </p>
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
                  return (
                    <p key={i} dangerouslySetInnerHTML={{ __html: para.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>") }} />
                  );
                })}
              </div>
              <div className="mt-6 border-b border-border/30" />
            </section>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-10 text-center space-y-2 text-sm text-muted-foreground">
          <p><Link href="/privacy"><span className="text-primary hover:underline cursor-pointer">Privacy Policy</span></Link> · <Link href="/about"><span className="text-primary hover:underline cursor-pointer">About</span></Link></p>
        </div>

      </div>
    </Layout>
  );
}
