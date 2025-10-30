import { Github } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import vibeleaksLogo from "@/assets/vibeleaks-logo.webp";

export const Header = () => {
  return (
    <header className="border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <img 
            src={vibeleaksLogo} 
            alt="VibeLeaks Logo" 
            className="h-8 sm:h-10"
          />
          <a 
            href="https://github.com/nithinworks/vibeleaks" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group"
          >
            <Badge 
              variant="outline" 
              className="gap-2 px-4 py-2 text-sm font-medium border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5"
            >
              <Github className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent font-semibold">
                We're Open Source
              </span>
            </Badge>
          </a>
        </div>
      </div>
    </header>
  );
};
