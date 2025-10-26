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
  const iconSize = size === "lg" ? "w-[40px] h-[40px]" : "w-[36px] h-[36px]";
  const buttonPadding = size === "lg" ? "pl-3 pr-6 py-2" : "pl-2.5 pr-5 py-2";
  const textSize = size === "lg" ? "text-base" : "text-sm";
  const folderScale = size === "lg" ? "scale-75" : "scale-65";
  
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "inline-flex items-center gap-3 bg-primary border-[3px] border-[#3d3d3d] rounded-[32px]",
        "cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.15)]",
        "hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.2)]",
        buttonPadding,
        className
      )}
    >
      <div className={cn(
        "flex items-center justify-center flex-shrink-0 rounded-lg",
        "bg-gradient-to-br from-primary-hover to-[#d4654a]",
        iconSize
      )}>
        {/* Dotted Folder Icon */}
        <div className={cn("relative w-[36px] h-[32px]", folderScale)}>
          {/* Folder Tab */}
          <div 
            className="absolute top-[1px] left-[1px] w-[14px] h-[8px] rounded-t-[4px]"
            style={{
              border: '2.5px dotted white',
              borderBottom: 'none',
              boxSizing: 'border-box'
            }}
          />
          {/* Folder Body */}
          <div 
            className="absolute top-[8px] left-[1px] w-[34px] h-[22px]"
            style={{
              border: '2.5px dotted white',
              borderRadius: '0 4px 4px 4px',
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