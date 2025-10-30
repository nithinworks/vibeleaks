import vibeleaksLogo from "@/assets/vibeleaks-logo.webp";

export const Footer = () => {
  return (
    <footer className="relative border-t border-border/50 mt-16" style={{ zIndex: 1 }}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Centered Layout */}
        <div className="flex flex-col items-center text-center space-y-6">
          
          {/* Logo */}
          <img 
            src={vibeleaksLogo} 
            alt="VibeLeaks Logo" 
            className="h-8"
          />
          
          {/* Description */}
          <p className="text-sm text-muted-foreground max-w-md">
            A browser-based secret scanner that keeps your code private. 
            Detect hardcoded API keys, tokens, and credentials instantly—100% client-side, 
            no data ever leaves your device.
          </p>
          
          {/* Thank You Note */}
          <p className="text-xs text-muted-foreground">
            Built with gratitude to{" "}
            <a 
              href="https://github.com/gitleaks/gitleaks" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Gitleaks
            </a>
            {" "}for detection patterns and{" "}
            <a 
              href="https://regex101.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              regex101
            </a>
            {" "}for pattern testing.
          </p>
          
          {/* Navigation Menu */}
          <nav className="flex items-center gap-6 text-sm">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              GitHub
            </a>
            <span className="text-border">•</span>
            <a 
              href="mailto:connect.naganithin@gmail.com"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Contact
            </a>
            <span className="text-border">•</span>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Discussions
            </a>
          </nav>
          
          {/* Copyright */}
          <p className="text-xs text-muted-foreground pt-4">
            © 2025 VibeLeaks • Open Source MIT License
          </p>
          
        </div>
      </div>
    </footer>
  );
};
