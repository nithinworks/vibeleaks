export const HowItWorksSection = () => {
  return (
    <div className="relative py-16" style={{ zIndex: 1 }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-semibold mb-3">How It Works</h3>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
            Three simple steps to secure your codebase
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-primary">Step 1</div>
              <h4 className="font-semibold text-lg">Upload Project Folder</h4>
              <p className="text-muted-foreground text-sm">
                Select your project folder or drag and drop files to get started
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-primary">Step 2</div>
              <h4 className="font-semibold text-lg">Instant Scan</h4>
              <p className="text-muted-foreground text-sm">
                Powered by 250+ patterns to detect secrets across all file types
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-primary">Step 3</div>
              <h4 className="font-semibold text-lg">Get Detailed Report</h4>
              <p className="text-muted-foreground text-sm">
                Review findings and export results in JSON format
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
