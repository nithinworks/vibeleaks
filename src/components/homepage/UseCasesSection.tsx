import { Card } from "@/components/ui/card";

export const UseCasesSection = () => {
  return (
    <div className="relative py-16" style={{ zIndex: 1 }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-semibold mb-3">Perfect For</h3>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
            Integrate security checks into your workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Use Case 1 */}
          <Card className="p-6 border-border/30 backdrop-blur-sm bg-card/50 hover:border-primary-hover/40 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary-hover/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary-hover" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Before Committing Code</h4>
                <p className="text-muted-foreground text-sm">
                  Catch secrets before they hit your repository. Run a quick scan as part of your pre-commit workflow.
                </p>
              </div>
            </div>
          </Card>

          {/* Use Case 2 */}
          <Card className="p-6 border-border/30 backdrop-blur-sm bg-card/50 hover:border-primary-hover/40 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary-hover/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary-hover" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold mb-2">During Code Reviews</h4>
                <p className="text-muted-foreground text-sm">
                  Ensure pull requests don't introduce security risks. Quick verification for reviewers.
                </p>
              </div>
            </div>
          </Card>

          {/* Use Case 3 */}
          <Card className="p-6 border-border/30 backdrop-blur-sm bg-card/50 hover:border-primary-hover/40 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary-hover/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary-hover" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Auditing Dependencies</h4>
                <p className="text-muted-foreground text-sm">
                  Check third-party code and open source packages for hardcoded credentials.
                </p>
              </div>
            </div>
          </Card>

          {/* Use Case 4 */}
          <Card className="p-6 border-border/30 backdrop-blur-sm bg-card/50 hover:border-primary-hover/40 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary-hover/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary-hover" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Pre-deployment Checks</h4>
                <p className="text-muted-foreground text-sm">
                  Final security scan before deploying to production. Peace of mind guaranteed.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
