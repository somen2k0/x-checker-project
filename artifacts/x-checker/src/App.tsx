import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CookieBanner } from "@/components/CookieBanner";
import { MobileNav } from "@/components/layout/MobileNav";
import { usePageTracking } from "@/hooks/use-track";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
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
      <Route path="/tools/temp-gmail" component={TempGmail} />

      {/* Category landing pages */}
      <Route path="/ai-writing-tools" component={AiWritingTools} />
      <Route path="/social-media-tools" component={SocialMediaTools} />
      <Route path="/text-format-tools" component={TextFormatTools} />
      <Route path="/developer-tools" component={DeveloperTools} />
      <Route path="/seo-tools" component={SeoTools} />
      <Route path="/email-tools" component={EmailTools} />

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
