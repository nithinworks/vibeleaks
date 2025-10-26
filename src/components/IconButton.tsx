import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconButtonProps {
  icon: LucideIcon;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
}

export const IconButton = ({ 
  icon: Icon, 
  children, 
  onClick, 
  className,
  variant = "default",
  size = "default" 
}: IconButtonProps) => {
  return (
    <Button 
      onClick={onClick} 
      variant={variant}
      size={size}
      className={cn("group relative overflow-hidden", className)}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "rounded-xl flex items-center justify-center transition-all duration-300",
          variant === "default" 
            ? "bg-primary-hover group-hover:bg-primary group-hover:scale-110" 
            : "bg-primary group-hover:bg-primary-hover",
          size === "lg" ? "w-10 h-10" : size === "sm" ? "w-7 h-7" : "w-8 h-8"
        )}>
          <div className="relative">
            <Icon className={cn(
              "text-primary-foreground",
              size === "lg" ? "h-5 w-5" : size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"
            )} />
            {/* Dotted pattern overlay */}
            <div className="absolute inset-0 opacity-30">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="dots" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="0.5" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dots)" />
              </svg>
            </div>
          </div>
        </div>
        <span className={cn(
          "font-medium",
          size === "lg" ? "text-base" : size === "sm" ? "text-xs" : "text-sm"
        )}>
          {children}
        </span>
      </div>
    </Button>
  );
};