import { Separator } from "@/components/ui/separator";
import vibeleaksLogo from "@/assets/vibeleaks-logo.webp";

export const Footer = () => {
  return (
    <footer className="relative border-t border-border/50 mt-16" style={{ zIndex: 1 }}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <img 
              src={vibeleaksLogo} 
              alt="VibeLeaks Logo" 
              className="h-7 mb-3"
            />
            <p className="text-sm text-muted-foreground">
              Detect secrets in your code locally. Fast, private, and free.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  GitHub Repository
                </a>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  Contribute Patterns
                </a>
              </li>
              <li>
                <a href="https://github.com/gitleaks/gitleaks" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  Gitleaks Rules
                </a>
              </li>
            </ul>
          </div>

          {/* Tech & Privacy */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">Built With</h4>
            <ul className="space-y-2 text-sm text-muted-foreground mb-4">
              <li>React + TypeScript</li>
              <li>Web Workers</li>
              <li>Tailwind CSS</li>
            </ul>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold">Privacy:</span> We don't store anything. All processing happens locally in your browser.
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="text-center text-sm text-muted-foreground">
          <p>© 2025 VibeLeaks. Built for developers who care about security.</p>
        </div>
      </div>
    </footer>
  );
};
