import { useState, useRef, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search, Trash2, Download, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CodeEditor } from "@/components/CodeEditor";
import { FileUpload } from "@/components/FileUpload";
import { TerminalOutput } from "@/components/TerminalOutput";
import { FileTree } from "@/components/FileTree";
import { ThemeToggle } from "@/components/ThemeToggle";
import { IconButton } from "@/components/IconButton";
import { MobileWarning } from "@/components/MobileWarning";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ScanMatch, SeverityLevel } from "@/types/scanner";

// Lazy load heavy Three.js component - only load when needed
const PixelBlast = lazy(() => import("@/components/ui/PixelBlast"));
const Index = () => {
  const [code, setCode] = useState("");
  const [files, setFiles] = useState<
    {
      name: string;
      content: string;
    }[]
  >([]);
  const [isDirectory, setIsDirectory] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [matches, setMatches] = useState<ScanMatch[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanCompleted, setHasScanCompleted] = useState(false);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    filename: string;
  }>();
  const [severityFilter, setSeverityFilter] = useState<SeverityLevel | "all">("all");
  const [showManualInput, setShowManualInput] = useState(false);
  const [viewMode, setViewMode] = useState<"input" | "ready" | "results">("input");
  const workerRef = useRef<Worker>();
  const { toast } = useToast();

  // Memoize filtered matches to avoid recalculation on every render
  const filteredMatches = useMemo(
    () => (severityFilter === "all" ? matches : matches.filter((m) => m.severity === severityFilter)),
    [matches, severityFilter]
  );

  // Memoize severity counts to avoid recalculation on every render
  const severityCounts = useMemo(
    () => ({
      critical: matches.filter((m) => m.severity === "critical").length,
      high: matches.filter((m) => m.severity === "high").length,
      medium: matches.filter((m) => m.severity === "medium").length,
      low: matches.filter((m) => m.severity === "low").length,
    }),
    [matches]
  );
  // Memoize worker message handler to avoid recreating on every render
  const handleWorkerMessage = useCallback(
    (e: MessageEvent) => {
      if (e.data.type === "progress") {
        setProgress(e.data);
      } else if (e.data.type === "result") {
        const { matches: foundMatches, filesScanned, totalLines, duration } = e.data;
        setMatches(foundMatches);
        setLogs((prev) => [
          ...prev,
          `Scan complete: ${filesScanned} files, ${totalLines} lines in ${duration.toFixed(2)}ms`,
          `Found ${foundMatches.length} potential secret(s)`,
        ]);
        setIsScanning(false);
        setHasScanCompleted(true);
        setProgress(undefined);
        toast({
          title: "Scan complete",
          description: `Found ${foundMatches.length} potential secret(s)`,
          variant: foundMatches.length > 0 ? "destructive" : "default",
        });
      }
    },
    [toast]
  );

  // Initialize worker lazily only when first scan is triggered
  const ensureWorkerReady = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(new URL("../workers/scanner.worker.ts", import.meta.url), {
        type: "module",
      });
      workerRef.current.onmessage = handleWorkerMessage;
    }
  }, [handleWorkerMessage]);

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);
  const handleScan = useCallback(() => {
    const filesToScan =
      files.length > 0
        ? files
        : code.trim()
          ? [
              {
                name: "input.txt",
                content: code,
              },
            ]
          : [];
    if (filesToScan.length === 0) {
      toast({
        title: "No content to scan",
        description: "Please enter code or upload files",
        variant: "destructive",
      });
      return;
    }

    // Initialize worker on first scan
    ensureWorkerReady();

    // Set initial state with progress
    setIsScanning(true);
    setHasScanCompleted(false);
    setMatches([]);
    setLogs([`Starting scan with Gitleaks rules...`]);
    setProgress({
      current: 0,
      total: filesToScan.length,
      filename: "Initializing scanner...",
    });
    setViewMode("results");
    workerRef.current?.postMessage({
      type: "scan",
      files: filesToScan,
    });
  }, [code, files, ensureWorkerReady, toast]);
  const handleCancel = useCallback(() => {
    workerRef.current?.postMessage({
      type: "cancel",
    });
    setIsScanning(false);
    setHasScanCompleted(false);
    setProgress(undefined);
    setLogs((prev) => [...prev, "Scan cancelled by user"]);
    toast({
      title: "Scan cancelled",
      description: "The scanning process has been stopped",
    });
  }, [toast]);
  const handleClear = useCallback(() => {
    setCode("");
    setFiles([]);
    setIsDirectory(false);
    setLogs([]);
    setMatches([]);
    setHasScanCompleted(false);
    setProgress(undefined);
    setSeverityFilter("all");
    setShowManualInput(false);
    setViewMode("input");
  }, []);
  const handleExportJSON = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: matches.length,
        critical: severityCounts.critical,
        high: severityCounts.high,
        medium: severityCounts.medium,
        low: severityCounts.low,
      },
      matches: matches,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vibleaks-scan-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: "Export successful",
      description: "Scan results exported as JSON",
    });
  }, [matches, severityCounts, toast]);
  const handleFilesSelected = useCallback((
    selectedFiles: {
      name: string;
      content: string;
    }[],
    isDir: boolean,
  ) => {
    setFiles(selectedFiles);
    setIsDirectory(isDir);
    setHasScanCompleted(false);
    setShowManualInput(false);
    setViewMode("ready");

    // If single file, show its content in the editor
    if (!isDir && selectedFiles.length === 1) {
      setCode(selectedFiles[0].content);
    } else if (!isDir && selectedFiles.length > 1) {
      // Multiple files, show combined content
      setCode(selectedFiles.map((f) => `// File: ${f.name}\n${f.content}`).join("\n\n"));
    } else {
      // Directory, clear code editor
      setCode("");
    }
    setLogs((prev) => [...prev, `Loaded ${selectedFiles.length} file(s)`]);
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <MobileWarning />
      
      {/* Header */}
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

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto">
          {viewMode === "input" && (
            <>
              {/* PixelBlast Pattern Animation - Full Viewport - Light Mode - Lazy Loaded */}
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
              
              {/* PixelBlast Pattern Animation - Full Viewport - Dark Mode - Lazy Loaded */}
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

              <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-180px)] sm:min-h-[calc(100vh-240px)] text-center px-4" style={{ zIndex: 1 }}>
                {/* Content */}
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
                    Scan your code instantly for secrets - Simple tool built for vibe coders who value speed and
                    security.
                  </p>
                </div>

                <div className="flex flex-col items-center gap-4 pt-4">
                  <FileUpload onFilesSelected={handleFilesSelected} size="lg" />
                </div>
                </div>
              </div>
            </>
          )}

          {viewMode === "ready" && (
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
                    <IconButton onClick={handleScan} variant="key" className="flex-1" size="default">
                      <span className="hidden sm:inline">Start Security Scan</span>
                      <span className="sm:hidden">Scan</span>
                    </IconButton>
                    <Button onClick={handleClear} variant="outline" size="icon" className="h-10 w-10 sm:h-12 sm:w-12 border-border/40 hover:bg-muted/50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </div>
            </>
          )}

          {viewMode === "results" && (
            <div className="flex flex-col h-[calc(100vh-180px)] sm:h-[calc(100vh-240px)]">
              <Card className="p-4 sm:p-6 flex flex-col flex-1 border-border/40 shadow-lg rounded-xl bg-card/50 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-5">
                  <h2 className="text-lg sm:text-xl font-semibold tracking-tight">Scan Results</h2>
                  <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                    {isScanning ? (
                      <Button onClick={handleCancel} variant="destructive" size="sm" className="h-8 sm:h-9 rounded-lg text-xs sm:text-sm">
                        Cancel
                      </Button>
                    ) : (
                      <Button onClick={handleClear} variant="outline" size="sm" className="h-8 sm:h-9 rounded-lg border-border/50 hover:bg-muted/80 text-xs sm:text-sm">
                        <Search className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-2" />
                        <span className="hidden sm:inline">New Scan</span>
                        <span className="sm:hidden">New</span>
                      </Button>
                    )}
                    {matches.length > 0 && (
                      <>
                        <Select
                          value={severityFilter}
                          onValueChange={(value) => setSeverityFilter(value as SeverityLevel | "all")}
                        >
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
                        <Button onClick={handleExportJSON} variant="outline" size="sm" className="h-8 sm:h-9 rounded-lg border-border/50 hover:bg-muted/80 text-xs sm:text-sm">
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
        </div>
      </main>
    </div>
  );
};
export default Index;
