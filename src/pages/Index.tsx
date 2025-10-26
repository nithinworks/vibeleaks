import { useState, useRef, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ScanMatch, SeverityLevel } from "@/types/scanner";

const Index = () => {
  const [code, setCode] = useState("");
  const [files, setFiles] = useState<{ name: string; content: string }[]>([]);
  const [isDirectory, setIsDirectory] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [matches, setMatches] = useState<ScanMatch[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanCompleted, setHasScanCompleted] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; filename: string }>();
  const [severityFilter, setSeverityFilter] = useState<SeverityLevel | "all">("all");
  const [showManualInput, setShowManualInput] = useState(false);
  const [viewMode, setViewMode] = useState<'input' | 'ready' | 'results'>('input');
  const workerRef = useRef<Worker>();
  const { toast } = useToast();

  // Filter matches based on severity
  const filteredMatches = severityFilter === "all" 
    ? matches 
    : matches.filter(m => m.severity === severityFilter);

  // Count by severity
  const severityCounts = {
    critical: matches.filter(m => m.severity === 'critical').length,
    high: matches.filter(m => m.severity === 'high').length,
    medium: matches.filter(m => m.severity === 'medium').length,
    low: matches.filter(m => m.severity === 'low').length,
  };

  useEffect(() => {
    // Lazy initialize Web Worker only when needed
    const initWorker = () => {
      if (!workerRef.current) {
        workerRef.current = new Worker(
          new URL("../workers/scanner.worker.ts", import.meta.url),
          { type: "module" }
        );

        workerRef.current.onmessage = (e) => {
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
        };
      }
    };

    // Don't initialize worker on mount, wait until first scan
    return () => {
      workerRef.current?.terminate();
    };
  }, [toast]);

  // Initialize worker before scanning
  const ensureWorkerReady = () => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL("../workers/scanner.worker.ts", import.meta.url),
        { type: "module" }
      );

      workerRef.current.onmessage = (e) => {
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
      };
    }
  };

  const handleScan = () => {
    const filesToScan = files.length > 0 
      ? files 
      : code.trim() 
        ? [{ name: "input.txt", content: code }]
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
      filename: "Initializing scanner..."
    });
    setViewMode('results');

    workerRef.current?.postMessage({
      type: "scan",
      files: filesToScan,
    });
  };

  const handleCancel = () => {
    workerRef.current?.postMessage({ type: "cancel" });
    setIsScanning(false);
    setHasScanCompleted(false);
    setProgress(undefined);
    setLogs((prev) => [...prev, "Scan cancelled by user"]);
    
    toast({
      title: "Scan cancelled",
      description: "The scanning process has been stopped",
    });
  };

  const handleClear = () => {
    setCode("");
    setFiles([]);
    setIsDirectory(false);
    setLogs([]);
    setMatches([]);
    setHasScanCompleted(false);
    setProgress(undefined);
    setSeverityFilter("all");
    setShowManualInput(false);
    setViewMode('input');
  };

  const handleExportJSON = () => {
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
  };

  const handleFilesSelected = (selectedFiles: { name: string; content: string }[], isDir: boolean) => {
    setFiles(selectedFiles);
    setIsDirectory(isDir);
    setHasScanCompleted(false);
    setShowManualInput(false);
    setViewMode('ready');
    
    // If single file, show its content in the editor
    if (!isDir && selectedFiles.length === 1) {
      setCode(selectedFiles[0].content);
    } else if (!isDir && selectedFiles.length > 1) {
      // Multiple files, show combined content
      setCode(selectedFiles.map(f => `// File: ${f.name}\n${f.content}`).join("\n\n"));
    } else {
      // Directory, clear code editor
      setCode("");
    }
    
    setLogs((prev) => [...prev, `Loaded ${selectedFiles.length} file(s)`]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="container mx-auto px-8 py-4">
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
                <path 
                  d="M12 8V11M12 14V14.01" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
              </svg>
              <h1 className="text-lg font-display font-medium tracking-tight">
                Vibe<span className="text-primary">Leaks</span>
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {viewMode === 'input' && (
            <div className="relative flex flex-col items-center justify-center min-h-[70vh] text-center overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0 -z-10 opacity-30">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              </div>

              <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-4">
                  {/* Main Headline */}
                  <h2 className="text-5xl md:text-6xl font-display font-semibold tracking-tight leading-tight">
                    Catch leaks before they{" "}
                    <span className="relative inline-block">
                      <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                        kill your vibe
                      </span>
                      <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-accent" />
                    </span>
                  </h2>
                  
                  {/* Tagline */}
                  <p className="text-base md:text-lg text-foreground/70 max-w-xl mx-auto font-normal">
                    A simple browser secret scanner for vibe coders, devs who keep things real.
                  </p>

                  {/* Feature Pills */}
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                      ✨ 100% Client-side
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                      🔒 No uploads
                    </span>
                  </div>
                </div>
                
                {/* CTA Section */}
                <div className="flex flex-col items-center gap-4 pt-6">
                  <FileUpload 
                    onFilesSelected={handleFilesSelected} 
                    variant="default"
                    size="lg"
                    className="h-12 px-10 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all duration-300 border border-primary/20"
                  />
                  <button
                    onClick={() => {
                      setShowManualInput(true);
                      setViewMode('ready');
                    }}
                    className="text-sm text-foreground/60 hover:text-primary transition-colors font-normal hover:translate-y-[-1px] transition-transform"
                  >
                    or enter code manually
                  </button>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'ready' && (
            <div className="flex items-center justify-center min-h-[calc(100vh-240px)] animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="p-8 border-border/50 shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-2xl w-full relative overflow-hidden">
                {/* Accent border */}
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-accent" />
                <div className="mb-6">
                  <h2 className="text-2xl font-display font-semibold mb-1">Ready to Scan</h2>
                  <p className="text-sm text-foreground/60">
                    {files.length} file(s) loaded
                  </p>
                </div>
                
                <div className="mb-6 max-h-[400px] overflow-auto border border-border/50 rounded-lg">
                  {isDirectory ? (
                    <FileTree files={files} />
                  ) : showManualInput ? (
                    <div className="h-[400px]">
                      <CodeEditor value={code} onChange={setCode} />
                    </div>
                  ) : (
                    <div className="h-[400px]">
                      <CodeEditor value={code} onChange={setCode} />
                    </div>
                  )}
                </div>

                <Separator className="mb-6" />

                <div className="flex gap-3">
                  <Button
                    onClick={handleScan}
                    className="flex-1 h-12 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Scan for Secrets
                  </Button>
                  <Button onClick={handleClear} variant="outline" size="icon" className="h-12 w-12 hover:scale-105 transition-transform">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {viewMode === 'results' && (
            <div className="flex flex-col h-[calc(100vh-240px)] animate-in fade-in duration-500">
              <Card className="p-8 flex flex-col flex-1 border-border/50 shadow-lg relative overflow-hidden">
                {/* Summary Stats Section */}
                {hasScanCompleted && matches.length > 0 && (
                  <div className="grid grid-cols-4 gap-4 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '200ms' }}>
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 hover:scale-105 transition-transform">
                      <div className="text-2xl font-bold text-destructive">{severityCounts.critical}</div>
                      <div className="text-xs text-foreground/60 font-medium">Critical</div>
                    </div>
                    <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 hover:scale-105 transition-transform">
                      <div className="text-2xl font-bold text-accent">{severityCounts.high}</div>
                      <div className="text-xs text-foreground/60 font-medium">High</div>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 hover:scale-105 transition-transform">
                      <div className="text-2xl font-bold text-primary">{severityCounts.medium}</div>
                      <div className="text-xs text-foreground/60 font-medium">Medium</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted border border-border hover:scale-105 transition-transform">
                      <div className="text-2xl font-bold text-foreground">{severityCounts.low}</div>
                      <div className="text-xs text-foreground/60 font-medium">Low</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-semibold">Scan Results</h2>
                  <div className="flex items-center gap-2">
                    {isScanning ? (
                      <Button onClick={handleCancel} variant="destructive" size="sm" className="h-9">
                        Cancel Scan
                      </Button>
                    ) : (
                      <Button onClick={handleClear} variant="outline" size="sm" className="h-9">
                        <Search className="h-3.5 w-3.5 mr-2" />
                        New Scan
                      </Button>
                    )}
                    {matches.length > 0 && (
                      <>
                        <Select value={severityFilter} onValueChange={(value) => setSeverityFilter(value as SeverityLevel | "all")}>
                          <SelectTrigger className="w-[140px] h-9">
                            <Filter className="h-3.5 w-3.5 mr-2" />
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
                        <Button onClick={handleExportJSON} variant="outline" size="sm" className="h-9">
                          <Download className="h-3.5 w-3.5 mr-2" />
                          Export JSON
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
