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
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight">
                Vibe<span className="text-primary">Leaks</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-3 font-light">
                Client-side secret scanner powered by Gitleaks rules
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {viewMode === 'input' && (
            <div className="flex items-center justify-center min-h-[calc(100vh-240px)]">
              <Card className="p-12 border-border/50 shadow-sm max-w-md w-full">
                <div className="flex flex-col items-center gap-6">
                  <div className="text-center mb-2">
                    <h2 className="text-2xl font-medium mb-2">Get Started</h2>
                    <p className="text-sm text-muted-foreground">Select a folder to scan for secrets</p>
                  </div>
                  <FileUpload 
                    onFilesSelected={handleFilesSelected} 
                    variant="default"
                    size="lg"
                    className="h-12 px-8 text-base w-full"
                  />
                  <button
                    onClick={() => {
                      setShowManualInput(true);
                      setViewMode('ready');
                    }}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    or enter code manually
                  </button>
                </div>
              </Card>
            </div>
          )}

          {viewMode === 'ready' && (
            <div className="flex items-center justify-center min-h-[calc(100vh-240px)]">
              <Card className="p-8 border-border/50 shadow-sm max-w-2xl w-full">
                <div className="mb-6">
                  <h2 className="text-xl font-medium mb-1">Ready to Scan</h2>
                  <p className="text-sm text-muted-foreground">
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
                    className="flex-1 h-11 font-medium"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Scan for Secrets
                  </Button>
                  <Button onClick={handleClear} variant="outline" size="icon" className="h-11 w-11">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {viewMode === 'results' && (
            <div className="flex flex-col h-[calc(100vh-240px)]">
              <Card className="p-8 flex flex-col flex-1 border-border/50 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-medium">Scan Results</h2>
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
