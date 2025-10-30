import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const MobileWarning = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("mobile-warning-dismissed");
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Check if mobile/tablet
    const checkMobile = () => {
      const isMobile = window.innerWidth < 1024;
      setIsOpen(isMobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleContinue = () => {
    localStorage.setItem("mobile-warning-dismissed", "true");
    setIsOpen(false);
    setIsDismissed(true);
  };

  if (!isOpen || isDismissed) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 border-border/40 shadow-2xl">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-primary-hover/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-primary-hover" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Desktop Experience Recommended</h3>
            <p className="text-sm text-muted-foreground">
              This site is specifically made & optimized for desktop/laptop devices for the best experience.
            </p>
          </div>

          <Button 
            onClick={handleContinue}
            className="w-full"
          >
            Continue Anyway
          </Button>
        </div>
      </Card>
    </div>
  );
};
