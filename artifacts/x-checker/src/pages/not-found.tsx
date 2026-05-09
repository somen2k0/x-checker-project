import { Link } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <div className="max-w-lg mx-auto px-4 text-center py-24 space-y-6">
        <div className="text-8xl font-bold text-muted-foreground/20 font-mono">404</div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
          <p className="text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/">
            <Button className="w-full sm:w-auto shadow-sm shadow-primary/20">
              <Home className="h-4 w-4 mr-2" /> Go Home
            </Button>
          </Link>
          <Link href="/tools">
            <Button variant="outline" className="w-full sm:w-auto border-border/60">
              <Search className="h-4 w-4 mr-2" /> Try the Tools
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
