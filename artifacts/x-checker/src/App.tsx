import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CookieBanner } from "@/components/CookieBanner";
import { MobileNav } from "@/components/layout/MobileNav";
import { usePageTracking } from "@/hooks/use-track";
import NotFound from "@/pages/not-found";
import AdminPage from "@/pages/admin";
import Home from "@/pages/home";
import ChromeExtension from "@/pages/chrome-extension";
import CwsScreenshots from "@/pages/cws-screenshots";
import Tools from "@/pages/tools";
import About from "@/pages/about";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Pricing from "@/pages/pricing";
import BioIdeas from "@/pages/tools/bio-ideas";
import FunnyBios from "@/pages/tools/funny-bios";
import ProfessionalBios from "@/pages/tools/professional-bios";
import AestheticBios from "@/pages/tools/aesthetic-bios";
import UsernameGenerator from "@/pages/tools/username-generator";
import NameIdeas from "@/pages/tools/name-ideas";
import HashtagFormatter from "@/pages/tools/hashtag-formatter";
import TweetFormatter from "@/pages/tools/tweet-formatter";
import FontPreview from "@/pages/tools/font-preview";
import CharacterCounter from "@/pages/tools/character-counter";
import JsonFormatter from "@/pages/tools/json-formatter";
import Base64Tool from "@/pages/tools/base64";
import CssMinifier from "@/pages/tools/css-minifier";
import HtmlFormatter from "@/pages/tools/html-formatter";
import JwtDecoder from "@/pages/tools/jwt-decoder";
import RegexTester from "@/pages/tools/regex-tester";
import SqlFormatter from "@/pages/tools/sql-formatter";
import UrlEncoder from "@/pages/tools/url-encoder";
import UuidGenerator from "@/pages/tools/uuid-generator";
// New Tools
import CaseConverter from "@/pages/tools/case-converter";
import YamlJson from "@/pages/tools/yaml-json";
import TimezoneConverter from "@/pages/tools/timezone-converter";
import OgImagePreview from "@/pages/tools/og-image-preview";
// SEO Tools
import MetaTagGenerator from "@/pages/tools/meta-tag-generator";
import UrlSlugGenerator from "@/pages/tools/url-slug-generator";
import KeywordDensity from "@/pages/tools/keyword-density";
import RobotsTxtGenerator from "@/pages/tools/robots-txt-generator";
import SitemapValidator from "@/pages/tools/sitemap-validator";
// Email Tools
import SubjectLineGenerator from "@/pages/tools/subject-line-generator";
import EmailUsernameGenerator from "@/pages/tools/email-username-generator";
import PlainTextFormatter from "@/pages/tools/plain-text-formatter";
import EmailCharacterCounter from "@/pages/tools/email-character-counter";
import EmailSignatureGenerator from "@/pages/tools/email-signature-generator";
import EmailValidator from "@/pages/tools/email-validator";
import TempGmail from "@/pages/tools/temp-gmail";
import XAccountChecker from "@/pages/tools/x-account-checker";
import AiDetector from "@/pages/tools/ai-detector";
import ProfileLinkGenerator from "@/pages/tools/profile-link-generator";
import AtFormatter from "@/pages/tools/at-formatter";
import BioGenerator from "@/pages/tools/bio-generator";
// Privacy tools
import MaskedEmailGenerator from "@/pages/tools/masked-email-generator";
import EmailPrivacyChecker from "@/pages/tools/email-privacy-checker";
import SpamRiskChecker from "@/pages/tools/spam-risk-checker";
import EmailLeakChecker from "@/pages/tools/email-leak-checker";
import AliasEmailExplainer from "@/pages/tools/alias-email-explainer";
import DisposableEmailGuide from "@/pages/tools/disposable-email-guide";
// New coming-soon → live tools
import FollowerAnalyzer from "@/pages/tools/follower-analyzer";
import TweetScheduler from "@/pages/tools/tweet-scheduler";
import ProfileAudit from "@/pages/tools/profile-audit";
import PageSpeedChecker from "@/pages/tools/page-speed-checker";
import BacklinkAnalyzer from "@/pages/tools/backlink-analyzer";
import SchemaGenerator from "@/pages/tools/schema-generator";
import EmailAbTester from "@/pages/tools/email-ab-tester";
import SpamScoreChecker from "@/pages/tools/spam-score-checker";
import NewsletterTemplateGenerator from "@/pages/tools/newsletter-template-generator";
// Blog
import BlogIndex from "@/pages/blog/index";
import WhatIsDisposableEmail from "@/pages/blog/what-is-disposable-email";
import BestTempMailServices from "@/pages/blog/best-temp-mail-services";
import TempMailVsGmail from "@/pages/blog/temp-mail-vs-gmail";
import IsTempMailSafe from "@/pages/blog/is-temp-mail-safe";
import WhyWebsitesAskEmailVerification from "@/pages/blog/why-websites-ask-email-verification";
import TempGmailExplained from "@/pages/blog/temp-gmail-explained";
// Category pages
import AiWritingTools from "@/pages/categories/ai-writing-tools";
import SocialMediaTools from "@/pages/categories/social-media-tools";
import TextFormatTools from "@/pages/categories/text-format-tools";
import DeveloperTools from "@/pages/categories/developer-tools";
import SeoTools from "@/pages/categories/seo-tools";
import EmailTools from "@/pages/categories/email-tools";

const queryClient = new QueryClient();

function TrackedRouter() {
  usePageTracking();
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/tools" component={Tools} />
      <Route path="/about" component={About} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/tools/bio-ideas" component={BioIdeas} />
      <Route path="/tools/funny-bios" component={FunnyBios} />
      <Route path="/tools/professional-bios" component={ProfessionalBios} />
      <Route path="/tools/aesthetic-bios" component={AestheticBios} />
      <Route path="/tools/username-generator" component={UsernameGenerator} />
      <Route path="/tools/name-ideas" component={NameIdeas} />
      <Route path="/tools/hashtag-formatter" component={HashtagFormatter} />
      <Route path="/tools/tweet-formatter" component={TweetFormatter} />
      <Route path="/tools/font-preview" component={FontPreview} />
      <Route path="/tools/character-counter" component={CharacterCounter} />
      <Route path="/tools/json-formatter" component={JsonFormatter} />
      <Route path="/tools/base64" component={Base64Tool} />
      <Route path="/tools/css-minifier" component={CssMinifier} />
      <Route path="/tools/html-formatter" component={HtmlFormatter} />
      <Route path="/tools/jwt-decoder" component={JwtDecoder} />
      <Route path="/tools/regex-tester" component={RegexTester} />
      <Route path="/tools/sql-formatter" component={SqlFormatter} />
      <Route path="/tools/url-encoder" component={UrlEncoder} />
      <Route path="/tools/uuid-generator" component={UuidGenerator} />

      {/* AI Tools */}
      <Route path="/tools/ai-detector" component={AiDetector} />

      {/* New Tools */}
      <Route path="/tools/case-converter" component={CaseConverter} />
      <Route path="/tools/yaml-json" component={YamlJson} />
      <Route path="/tools/timezone-converter" component={TimezoneConverter} />
      <Route path="/tools/og-image-preview" component={OgImagePreview} />

      {/* SEO Tools */}
      <Route path="/tools/meta-tag-generator" component={MetaTagGenerator} />
      <Route path="/tools/url-slug-generator" component={UrlSlugGenerator} />
      <Route path="/tools/keyword-density" component={KeywordDensity} />
      <Route path="/tools/robots-txt-generator" component={RobotsTxtGenerator} />
      <Route path="/tools/sitemap-validator" component={SitemapValidator} />

      {/* Email Tools */}
      <Route path="/tools/subject-line-generator" component={SubjectLineGenerator} />
      <Route path="/tools/email-username-generator" component={EmailUsernameGenerator} />
      <Route path="/tools/plain-text-formatter" component={PlainTextFormatter} />
      <Route path="/tools/email-character-counter" component={EmailCharacterCounter} />
      <Route path="/tools/email-signature-generator" component={EmailSignatureGenerator} />
      <Route path="/tools/email-validator" component={EmailValidator} />
      <Route path="/tools/temp-mail/tempemail">
        {() => <TempGmail defaultTab="disposable" />}
      </Route>
      <Route path="/tools/temp-mail/disposable">
        {() => <Redirect to="/tools/temp-mail/tempemail" />}
      </Route>
      <Route path="/tools/temp-mail/tempgmail">
        {() => <TempGmail defaultTab="tempgmail" />}
      </Route>
      <Route path="/tools/temp-mail/gmail-tricks">
        {() => <TempGmail defaultTab="gmail" />}
      </Route>
      <Route path="/tools/temp-mail">
        {() => <Redirect to="/tools/temp-mail/tempemail" />}
      </Route>
      <Route path="/tools/temp-gmail">
        {() => <Redirect to="/tools/temp-mail/tempgmail" />}
      </Route>

      {/* Privacy tools */}
      <Route path="/tools/masked-email-generator" component={MaskedEmailGenerator} />
      <Route path="/tools/email-privacy-checker" component={EmailPrivacyChecker} />
      <Route path="/tools/spam-risk-checker" component={SpamRiskChecker} />
      <Route path="/tools/email-leak-checker" component={EmailLeakChecker} />
      <Route path="/tools/alias-email-explainer" component={AliasEmailExplainer} />
      <Route path="/tools/disposable-email-guide" component={DisposableEmailGuide} />

      {/* Blog */}
      <Route path="/blog" component={BlogIndex} />
      <Route path="/blog/what-is-disposable-email" component={WhatIsDisposableEmail} />
      <Route path="/blog/best-temp-mail-services" component={BestTempMailServices} />
      <Route path="/blog/temp-mail-vs-gmail" component={TempMailVsGmail} />
      <Route path="/blog/is-temp-mail-safe" component={IsTempMailSafe} />
      <Route path="/blog/why-websites-ask-email-verification" component={WhyWebsitesAskEmailVerification} />
      <Route path="/blog/temp-gmail-explained" component={TempGmailExplained} />

      {/* Previously coming-soon — now live */}
      <Route path="/tools/follower-analyzer" component={FollowerAnalyzer} />
      <Route path="/tools/tweet-scheduler" component={TweetScheduler} />
      <Route path="/tools/profile-audit" component={ProfileAudit} />
      <Route path="/tools/page-speed-checker" component={PageSpeedChecker} />
      <Route path="/tools/backlink-analyzer" component={BacklinkAnalyzer} />
      <Route path="/tools/schema-generator" component={SchemaGenerator} />
      <Route path="/tools/email-ab-tester" component={EmailAbTester} />
      <Route path="/tools/spam-score-checker" component={SpamScoreChecker} />
      <Route path="/tools/newsletter-template-generator" component={NewsletterTemplateGenerator} />

      {/* Social media X tools — dedicated pages */}
      <Route path="/tools/x-account-checker" component={XAccountChecker} />
      <Route path="/tools/profile-link-generator" component={ProfileLinkGenerator} />
      <Route path="/tools/at-formatter" component={AtFormatter} />
      <Route path="/tools/bio-generator" component={BioGenerator} />

      {/* Category landing pages */}
      <Route path="/ai-writing-tools" component={AiWritingTools} />
      <Route path="/social-media-tools" component={SocialMediaTools} />
      <Route path="/text-format-tools" component={TextFormatTools} />
      <Route path="/developer-tools" component={DeveloperTools} />
      <Route path="/seo-tools" component={SeoTools} />
      <Route path="/email-tools" component={EmailTools} />

      <Route path="/chrome-extension" component={ChromeExtension} />
      <Route path="/cws-screenshots" component={CwsScreenshots} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <TrackedRouter />
          <CookieBanner />
          <MobileNav />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
