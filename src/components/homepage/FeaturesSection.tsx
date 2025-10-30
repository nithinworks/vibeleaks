import { Card } from "@/components/ui/card";

export const FeaturesSection = () => {
  return (
    <div className="relative pb-16" style={{ zIndex: 1 }}>
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-semibold mb-3">Why VibeLeaks?</h3>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
            Built for developers who care about security without sacrificing speed
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <Card className="p-6 border-border/30 backdrop-blur-sm bg-card/50 hover:border-primary-hover/40 transition-colors">
            <div className="mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary-hover/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-hover" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <h4 className="font-semibold text-lg mb-2">Lightning Fast</h4>
            <p className="text-muted-foreground text-sm">
              Scan thousands of files in seconds. All processing happens locally in your browser using Web Workers.
            </p>
          </Card>

          {/* Feature 2 */}
          <Card className="p-6 border-border/30 backdrop-blur-sm bg-card/50 hover:border-primary-hover/40 transition-colors">
            <div className="mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary-hover/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-hover" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <h4 className="font-semibold text-lg mb-2">100% Private</h4>
            <p className="text-muted-foreground text-sm">
              Your code never leaves your machine. No uploads, no servers, no tracking. Complete privacy guaranteed.
            </p>
          </Card>

          {/* Feature 3 */}
          <Card className="p-6 border-border/30 backdrop-blur-sm bg-card/50 hover:border-primary-hover/40 transition-colors">
            <div className="mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary-hover/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-hover" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h4 className="font-semibold text-lg mb-2">Smart Detection</h4>
            <p className="text-muted-foreground text-sm">
              220+ detection rules covering AWS, GitHub, Stripe, OpenAI, and more. Continuously updated patterns.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
