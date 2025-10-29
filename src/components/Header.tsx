import { ThemeToggle } from "@/components/ThemeToggle";
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
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
