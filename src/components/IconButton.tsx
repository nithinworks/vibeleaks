import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { FolderOpen } from "lucide-react";

interface IconButtonProps {
  icon?: LucideIcon;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  size?: "default" | "lg";
}

export const IconButton = ({ 
  icon: Icon = FolderOpen, 
  children, 
  onClick, 
  className,
  size = "default" 
}: IconButtonProps) => {
  const iconSize = size === "lg" ? "w-[68px] h-[68px]" : "w-[68px] h-[68px]";
  const buttonPadding = size === "lg" ? "pl-5 pr-10 py-4" : "pl-5 pr-10 py-4";
  const textSize = size === "lg" ? "text-[28px]" : "text-[28px]";
  
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "inline-flex items-center gap-4 bg-primary border-4 border-[#3d3d3d] rounded-[50px]",
        "cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.15)]",
        "hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.2)]",
        buttonPadding,
        className
      )}
    >
      <div className={cn(
        "flex items-center justify-center flex-shrink-0 rounded-2xl",
        "bg-gradient-to-br from-primary-hover to-[#d4654a]",
        iconSize
      )}>
        {/* Dotted Folder Icon */}
        <div className="relative w-[44px] h-[38px]">
          {/* Folder Tab */}
          <div 
            className="absolute top-[2px] left-[2px] w-[18px] h-[10px] rounded-t-[5px]"
            style={{
              border: '3px dotted white',
              borderBottom: 'none',
              boxSizing: 'border-box'
            }}
          />
          {/* Folder Body */}
          <div 
            className="absolute top-[10px] left-[2px] w-[40px] h-[26px]"
            style={{
              border: '3px dotted white',
              borderRadius: '0 5px 5px 5px',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>
      <span className={cn(
        "text-white font-normal tracking-[0.3px] whitespace-nowrap",
        textSize
      )}>
        {children}
      </span>
    </button>
  );
};