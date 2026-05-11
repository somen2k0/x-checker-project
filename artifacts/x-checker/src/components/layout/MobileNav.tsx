import { useLocation, Link } from "wouter";
import { Home, Wrench, Info } from "lucide-react";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/about", label: "About", icon: Info },
];

export function MobileNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border/60 bg-background/95 backdrop-blur-md safe-area-pb">
      <div className="flex items-stretch h-14">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = location === href;
          return (
            <Link key={href} href={href} className="flex-1">
              <button
                className={`w-full h-full flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 transition-transform ${active ? "scale-110" : ""}`} />
                {label}
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
