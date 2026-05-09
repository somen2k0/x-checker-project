import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CookieBanner } from "@/components/CookieBanner";
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
        </WouterRouter>
        <Toaster />
        <SpeedInsights />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
