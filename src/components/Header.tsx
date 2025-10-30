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
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="transition-transform hover:scale-105"
          >
            <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm font-medium">
              <Github className="h-4 w-4" />
              We're Open Source
            </Badge>
          </a>
        </div>
      </div>
    </header>
  );
};
