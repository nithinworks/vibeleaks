import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search, Trash2, Download, Filter, FileJson, FileText, Sheet } from "lucide-react";
import { TerminalOutput } from "@/components/TerminalOutput";
import { FileTree } from "@/components/FileTree";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/IconButton";
import { BackgroundAnimation } from "@/components/ui/BackgroundAnimation";
import type { ScanMatch, SeverityLevel } from "@/types/scanner";

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
  scanStats: {
    filesScanned: number;
    totalLines: number;
    duration: number;
  };
  onScan: () => void;
  onCancel: () => void;
  onClear: () => void;
  onExportJSON: () => void;
  onExportMarkdown: () => void;
  onExportCSV: () => void;
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
  scanStats,
  onScan,
  onCancel,
  onClear,
  onExportJSON,
  onExportMarkdown,
  onExportCSV,
  onSeverityFilterChange,
}: ScannerInterfaceProps) => {
  return (
    <div className="relative">
      <BackgroundAnimation />

      {viewMode === "ready" && (
        <div className="flex items-center justify-center min-h-[60vh] px-4 py-8">
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
        <div className="py-4">
          <Card className="p-4 sm:p-6 border-border/40 shadow-lg rounded-xl bg-card/50 backdrop-blur-sm">
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 sm:h-9 rounded-lg border-border/50 hover:bg-muted/80 text-xs sm:text-sm">
                          <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-2" />
                          Export
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-background border-border">
                        <DropdownMenuItem onClick={onExportJSON} className="cursor-pointer">
                          <FileJson className="h-4 w-4 mr-2" />
                          Export as JSON
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onExportMarkdown} className="cursor-pointer">
                          <FileText className="h-4 w-4 mr-2" />
                          Export as Markdown
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onExportCSV} className="cursor-pointer">
                          <Sheet className="h-4 w-4 mr-2" />
                          Export as CSV
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </div>
            <div>
              <TerminalOutput
                logs={logs}
                matches={filteredMatches}
                isScanning={isScanning}
                hasScanCompleted={hasScanCompleted}
                progress={progress}
                severityCounts={severityCounts}
                scanStats={scanStats}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
