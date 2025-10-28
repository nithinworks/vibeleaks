import { ThemeToggle } from "@/components/ThemeToggle";

export const Header = () => {
  return (
    <header className="border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <svg
              width="24"
              height="24"
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
            <h1 className="text-base sm:text-lg font-display font-medium tracking-tight">
              Vibe<span className="text-primary">Leaks</span>
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
