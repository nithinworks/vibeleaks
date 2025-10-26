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
  const iconSize = size === "lg" ? "w-16 h-16" : size === "sm" ? "w-10 h-10" : "w-12 h-12";
  const iconInnerSize = size === "lg" ? "h-8 w-8" : size === "sm" ? "h-5 w-5" : "h-6 w-6";
  const buttonHeight = size === "lg" ? "h-16" : size === "sm" ? "h-10" : "h-12";
  const textSize = size === "lg" ? "text-lg" : size === "sm" ? "text-sm" : "text-base";
  
  return (
    <Button 
      onClick={onClick} 
      variant={variant}
      className={cn(
        "group relative overflow-hidden px-6",
        buttonHeight,
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0",
          "bg-primary-hover group-hover:scale-105",
          iconSize
        )}>
          <div className="relative">
            <Icon className={cn(
              "text-primary-foreground",
              iconInnerSize
            )} strokeWidth={1.5} />
            {/* Dotted pattern overlay */}
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id={`dots-${size}`} x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#dots-${size})`} />
              </svg>
            </div>
          </div>
        </div>
        <span className={cn(
          "font-medium tracking-tight",
          textSize
        )}>
          {children}
        </span>
      </div>
    </Button>
  );
};