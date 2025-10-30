import { FileUpload } from "@/components/FileUpload";
import { BackgroundAnimation } from "@/components/ui/BackgroundAnimation";

interface HeroSectionProps {
  onFilesSelected: (files: { name: string; content: string }[], isDir: boolean) => void;
}

export const HeroSection = ({ onFilesSelected }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[calc(100vh-180px)] sm:min-h-[calc(100vh-240px)]">
      <BackgroundAnimation />

      <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-180px)] sm:min-h-[calc(100vh-240px)] text-center px-4" style={{ zIndex: 1 }}>
        <div className="relative max-w-2xl mx-auto space-y-6 sm:space-y-8">
          {/* Chrome Badge */}
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-md bg-primary-hover/10 border border-primary-hover/20">
              <svg 
                viewBox="0 0 24 24" 
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-hover flex-shrink-0" 
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <span className="text-[10px] sm:text-xs font-medium text-primary-hover">For better experience use Chrome browser</span>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <h2 className="font-display font-medium tracking-tight text-2xl sm:text-3xl lg:text-4xl px-4">
              Sniff Out <span className="text-primary-hover font-semibold">Secrets</span>. Locally. Fast.
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-xs sm:text-sm px-6 sm:px-12 lg:px-[58px]">
              Scan your code instantly for secrets - Simple tool built for vibe coders who value speed and security.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 pt-4">
            <FileUpload onFilesSelected={onFilesSelected} size="lg" />
          </div>
        </div>
      </div>
    </section>
  );
};
