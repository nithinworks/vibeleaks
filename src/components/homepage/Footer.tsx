import { Separator } from "@/components/ui/separator";

export const Footer = () => {
  return (
    <footer className="relative border-t border-border/50 mt-16" style={{ zIndex: 1 }}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-primary"
              >
                <path
                  d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="11" r="3" fill="currentColor" opacity="0.2" />
                <path d="M12 8V11M12 14V14.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="font-display font-medium">
                Vibe<span className="text-primary">Leaks</span>
              </span>
            </div>
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
