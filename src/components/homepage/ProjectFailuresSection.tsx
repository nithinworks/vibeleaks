import pieChartImage from "@/assets/why-vibe-coding-fails.webp";

export const ProjectFailuresSection = () => {
  return (
    <div className="relative py-16" style={{ zIndex: 1 }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-foreground leading-tight">
              Why Most Vibe-Coded Projects Fade Too Soon
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Even the best indie projects lose their spark too soon — not because the code was bad, but because small blind spots grew big.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Security lapses, burnout, and lack of validation quietly kill more vibe-coded projects than bugs ever do.
            </p>
          </div>

          {/* Right side - Chart image */}
          <div className="flex items-center justify-center">
            <img 
              src={pieChartImage} 
              alt="Why vibe-coded projects fail: Security hygiene, burnout, lack of validation, poor structure, and over-engineering" 
              className="w-full max-w-md h-auto"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
