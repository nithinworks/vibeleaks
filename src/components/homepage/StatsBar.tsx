export const StatsBar = () => {
  return (
    <div className="relative mt-16 mb-20" style={{ zIndex: 1 }}>
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="text-center p-4">
            <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">250+</div>
            <div className="text-sm text-muted-foreground">Detection Patterns</div>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">100+</div>
            <div className="text-sm text-muted-foreground">Services Covered</div>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">0</div>
            <div className="text-sm text-muted-foreground">Data Sent to Servers</div>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">&lt;5s</div>
            <div className="text-sm text-muted-foreground">Scan Time</div>
          </div>
        </div>
      </div>
    </div>
  );
};
