import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { FolderOpen } from "lucide-react";

interface IconButtonProps {
  icon?: LucideIcon;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  size?: "default" | "lg";
  variant?: "folder" | "key";
}

export const IconButton = ({
  icon: Icon = FolderOpen,
  children,
  onClick,
  className,
  size = "default",
  variant = "folder",
}: IconButtonProps) => {
  const iconSize = size === "lg" ? "w-[36px] h-[36px] sm:w-[42px] sm:h-[42px]" : "w-[32px] h-[32px] sm:w-[38px] sm:h-[38px]";
  const buttonPadding = size === "lg" ? "pl-2.5 pr-4 py-2 sm:pl-3 sm:pr-6 sm:py-2.5" : "pl-2 pr-3 py-1.5 sm:pl-2.5 sm:pr-5 sm:py-2";
  const textSize = size === "lg" ? "text-sm sm:text-base" : "text-xs sm:text-sm";
  const folderScale = size === "lg" ? "scale-[0.6] sm:scale-75" : "scale-[0.5] sm:scale-[0.65]";

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 sm:gap-3 bg-primary border-2 sm:border-[3px] border-[#3d3d3d] rounded-[20px] sm:rounded-[24px]",
        "cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.15)]",
        "hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.2)]",
        buttonPadding,
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center flex-shrink-0 rounded-xl",
          "bg-gradient-to-br from-primary-hover to-[#d4654a]",
          iconSize,
        )}
      >
        {variant === "key" ? (
          // Dotted Key Icon
          <div className={cn("relative w-[38px] h-[38px]", folderScale)}>
            {/* Key Head (Circle) */}
            <div
              className="absolute top-[4px] left-[4px] w-[16px] h-[16px] rounded-full"
              style={{
                border: "3px dotted white",
                boxSizing: "border-box",
              }}
            />
            {/* Key Shaft */}
            <div
              className="absolute top-[12px] left-[18px] w-[18px] h-[3px]"
              style={{
                borderTop: "3px dotted white",
                boxSizing: "border-box",
              }}
            />
            {/* Key Teeth */}
            <div
              className="absolute top-[19px] left-[28px] w-[3px] h-[6px]"
              style={{
                borderLeft: "3px dotted white",
                boxSizing: "border-box",
              }}
            />
            <div
              className="absolute top-[19px] left-[33px] w-[3px] h-[8px]"
              style={{
                borderLeft: "3px dotted white",
                boxSizing: "border-box",
              }}
            />
          </div>
        ) : (
          // Dotted Folder Icon
          <div className={cn("relative w-[44px] h-[38px]", folderScale)}>
            {/* Folder Tab */}
            <div
              className="absolute top-[2px] left-[2px] w-[18px] h-[10px] rounded-t-[5px]"
              style={{
                border: "3px dotted white",
                borderBottom: "none",
                boxSizing: "border-box",
              }}
            />
            {/* Folder Body */}
            <div
              className="absolute top-[10px] left-[2px] w-[40px] h-[26px]"
              style={{
                border: "3px dotted white",
                borderRadius: "0 5px 5px 5px",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}
      </div>
      <span className={cn("text-white font-normal tracking-[0.3px] whitespace-nowrap", textSize)}>{children}</span>
    </button>
  );
};
