import { lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search, Trash2, Download, Filter } from "lucide-react";
import { TerminalOutput } from "@/components/TerminalOutput";
import { FileTree } from "@/components/FileTree";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconButton } from "@/components/IconButton";
import type { ScanMatch, SeverityLevel } from "@/types/scanner";

const PixelBlast = lazy(() => import("@/components/ui/PixelBlast"));

interface ScannerInterfaceProps {
  viewMode: "ready" | "results";
  files: { name: string; content: string }[];
  logs: string[];
  matches: ScanMatch[];
  filteredMatches: ScanMatch[];
  isScanning: boolean;
  hasScanCompleted: boolean;
  progress?: { current: number; total: number; filename: string };
  severityFilter: SeverityLevel | "all";
  severityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  onScan: () => void;
  onCancel: () => void;
  onClear: () => void;
  onExportJSON: () => void;
  onSeverityFilterChange: (value: SeverityLevel | "all") => void;
}

export const ScannerInterface = ({
  viewMode,
  files,
  logs,
  matches,
  filteredMatches,
  isScanning,
  hasScanCompleted,
  progress,
  severityFilter,
  severityCounts,
  onScan,
  onCancel,
  onClear,
  onExportJSON,
  onSeverityFilterChange,
}: ScannerInterfaceProps) => {
  return (
    <>
      {/* PixelBlast Pattern Animation Behind Dialog - Light Mode */}
      <div className="fixed inset-0 pointer-events-none dark:hidden" style={{ zIndex: 0, opacity: 0.3 }}>
        <Suspense fallback={null}>
          <PixelBlast
            variant="circle"
            pixelSize={4}
            color="#E07A5F"
            patternScale={2.5}
            patternDensity={1.1}
            pixelSizeJitter={0.3}
            enableRipples={true}
            rippleSpeed={0.4}
            rippleThickness={0.12}
            rippleIntensityScale={1.2}
            speed={0.5}
            edgeFade={0.3}
            transparent={true}
            className="w-full h-full"
          />
        </Suspense>
      </div>

      {/* PixelBlast Pattern Animation Behind Dialog - Dark Mode */}
      <div className="fixed inset-0 pointer-events-none hidden dark:block" style={{ zIndex: 0, opacity: 0.4 }}>
        <Suspense fallback={null}>
          <PixelBlast
            variant="circle"
            pixelSize={4}
            color="#FFA07A"
            patternScale={2.5}
            patternDensity={1.1}
            pixelSizeJitter={0.3}
            enableRipples={true}
            rippleSpeed={0.4}
            rippleThickness={0.12}
            rippleIntensityScale={1.2}
            speed={0.5}
            edgeFade={0.3}
            transparent={true}
            className="w-full h-full"
          />
        </Suspense>
      </div>

      {viewMode === "ready" && (
        <div className="relative flex items-center justify-center min-h-[calc(100vh-180px)] sm:min-h-[calc(100vh-240px)] px-4" style={{ zIndex: 1 }}>
          <Card className="p-6 sm:p-8 lg:p-10 border-border/30 backdrop-blur-sm bg-background/95 shadow-2xl max-w-2xl w-full rounded-2xl">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-2 tracking-tight">Ready to Scan</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">{files.length} file(s) loaded</p>
            </div>

            <div className="mb-6 sm:mb-8 max-h-[300px] sm:max-h-[400px] overflow-auto border border-border/40 rounded-xl bg-muted/30 backdrop-blur-sm">
              <FileTree files={files} />
            </div>

            <Separator className="mb-6 sm:mb-8 bg-border/40" />

            <div className="flex gap-2 sm:gap-3">
              <IconButton onClick={onScan} variant="key" className="flex-1" size="default">
                <span className="hidden sm:inline">Start Security Scan</span>
                <span className="sm:hidden">Scan</span>
              </IconButton>
              <Button onClick={onClear} variant="outline" size="icon" className="h-10 w-10 sm:h-12 sm:w-12 border-border/40 hover:bg-muted/50">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {viewMode === "results" && (
        <div className="flex flex-col h-[calc(100vh-180px)] sm:h-[calc(100vh-240px)]">
          <Card className="p-4 sm:p-6 flex flex-col flex-1 border-border/40 shadow-lg rounded-xl bg-card/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-5">
              <h2 className="text-lg sm:text-xl font-semibold tracking-tight">Scan Results</h2>
              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                {isScanning ? (
                  <Button onClick={onCancel} variant="destructive" size="sm" className="h-8 sm:h-9 rounded-lg text-xs sm:text-sm">
                    Cancel
                  </Button>
                ) : (
                  <Button onClick={onClear} variant="outline" size="sm" className="h-8 sm:h-9 rounded-lg border-border/50 hover:bg-muted/80 text-xs sm:text-sm">
                    <Search className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-2" />
                    <span className="hidden sm:inline">New Scan</span>
                    <span className="sm:hidden">New</span>
                  </Button>
                )}
                {matches.length > 0 && (
                  <>
                    <Select value={severityFilter} onValueChange={(value) => onSeverityFilterChange(value as SeverityLevel | "all")}>
                      <SelectTrigger className="w-[110px] sm:w-[140px] h-8 sm:h-9 rounded-lg border-border/50 text-xs sm:text-sm">
                        <Filter className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All ({matches.length})</SelectItem>
                        <SelectItem value="critical">Critical ({severityCounts.critical})</SelectItem>
                        <SelectItem value="high">High ({severityCounts.high})</SelectItem>
                        <SelectItem value="medium">Medium ({severityCounts.medium})</SelectItem>
                        <SelectItem value="low">Low ({severityCounts.low})</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={onExportJSON} variant="outline" size="sm" className="h-8 sm:h-9 rounded-lg border-border/50 hover:bg-muted/80 text-xs sm:text-sm">
                      <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-2" />
                      Export
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <TerminalOutput
                logs={logs}
                matches={filteredMatches}
                isScanning={isScanning}
                hasScanCompleted={hasScanCompleted}
                progress={progress}
              />
            </div>
          </Card>
        </div>
      )}
    </>
  );
};
