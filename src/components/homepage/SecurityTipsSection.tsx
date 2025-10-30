export const SecurityTipsSection = () => {
  return (
    <div className="relative py-16 bg-muted/30" style={{ zIndex: 1 }}>
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-semibold mb-3">Security Best Practices</h3>
          <p className="text-muted-foreground text-sm">
            Quick tips to keep your codebase secure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border/50 rounded-lg p-6 text-center">
            <div className="mb-3 flex justify-center">
              <svg className="w-8 h-8 text-primary-hover" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <p className="font-medium mb-2">Never Commit .env Files</p>
            <p className="text-sm text-muted-foreground">
              Always add environment files to .gitignore before committing
            </p>
          </div>

          <div className="bg-card border border-border/50 rounded-lg p-6 text-center">
            <div className="mb-3 flex justify-center">
              <svg className="w-8 h-8 text-primary-hover" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="font-medium mb-2">Use Environment Variables</p>
            <p className="text-sm text-muted-foreground">
              Store sensitive data in environment variables, not in code
            </p>
          </div>

          <div className="bg-card border border-border/50 rounded-lg p-6 text-center">
            <div className="mb-3 flex justify-center">
              <svg className="w-8 h-8 text-primary-hover" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="font-medium mb-2">Rotate Exposed Keys</p>
            <p className="text-sm text-muted-foreground">
              If a key is exposed, rotate it immediately on the provider
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
