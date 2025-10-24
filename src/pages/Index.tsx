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
    // Initialize Web Worker
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

    return () => {
      workerRef.current?.terminate();
    };
  }, [toast]);

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

    setIsScanning(true);
    setHasScanCompleted(false);
    setMatches([]);
    setLogs([`Starting scan with Gitleaks rules...`]);

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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Input Section */}
          <div className="flex flex-col h-[calc(100vh-240px)]">
            <Card className="p-8 flex flex-col flex-1 border-border/50 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-medium mb-1">Input</h2>
                <p className="text-sm text-muted-foreground">Select a folder to scan for secrets</p>
              </div>
              
              <div className="flex-1 min-h-0 mb-6">
                {files.length > 0 ? (
                  isDirectory ? (
                    <FileTree files={files} />
                  ) : (
                    <CodeEditor value={code} onChange={setCode} />
                  )
                ) : showManualInput ? (
                  <CodeEditor value={code} onChange={setCode} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <FileUpload 
                      onFilesSelected={handleFilesSelected} 
                      variant="default"
                      size="lg"
                      className="h-12 px-8 text-base"
                    />
                    <button
                      onClick={() => setShowManualInput(true)}
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      or enter code manually
                    </button>
                  </div>
                )}
              </div>

              <Separator className="mb-6" />

              <div className="flex gap-3">
                {isScanning ? (
                  <Button
                    onClick={handleCancel}
                    variant="destructive"
                    className="flex-1 h-11 font-medium"
                  >
                    Cancel Scan
                  </Button>
                ) : (
                  <Button
                    onClick={handleScan}
                    className="flex-1 h-11 font-medium"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Scan for Secrets
                  </Button>
                )}
                <Button onClick={handleClear} variant="outline" size="icon" className="h-11 w-11">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Right: Terminal Output */}
          <div className="flex flex-col h-[calc(100vh-240px)]">
            <Card className="p-8 flex flex-col flex-1 border-border/50 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium">Output</h2>
                <div className="flex items-center gap-2">
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
        </div>
      </main>
    </div>
  );
};

export default Index;
