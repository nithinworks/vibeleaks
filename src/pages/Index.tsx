import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search, Download, Filter, FolderOpen, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TerminalOutput } from "@/components/TerminalOutput";
import { FileTree } from "@/components/FileTree";
import { BinaryRain } from "@/components/BinaryRain";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ScanMatch, SeverityLevel } from "@/types/scanner";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TOTAL_SIZE = 200 * 1024 * 1024; // 200MB
const MAX_FILES = 2000;

const Index = () => {
  const [files, setFiles] = useState<{ name: string; content: string }[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [matches, setMatches] = useState<ScanMatch[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; filename: string }>();
  const [severityFilter, setSeverityFilter] = useState<SeverityLevel | "all">("all");
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualCode, setManualCode] = useState("");
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

  const handleDirectorySelect = async () => {
    try {
      // @ts-ignore - File System Access API
      const dirHandle = await window.showDirectoryPicker();
      const selectedFiles: { name: string; content: string }[] = [];
      let totalSize = 0;

      const readDirectory = async (dirHandle: any, path = "") => {
        for await (const entry of dirHandle.values()) {
          if (selectedFiles.length >= MAX_FILES) {
            toast({
              title: "File limit reached",
              description: `Maximum ${MAX_FILES} files allowed`,
              variant: "destructive",
            });
            break;
          }

          if (entry.kind === "file") {
            const file = await entry.getFile();
            const relativePath = path ? `${path}/${file.name}` : file.name;

            if (file.size > MAX_FILE_SIZE) {
              continue;
            }

            if (totalSize + file.size > MAX_TOTAL_SIZE) {
              toast({
                title: "Size limit reached",
                description: "Total size exceeds 200MB",
                variant: "destructive",
              });
              break;
            }

            totalSize += file.size;
            const content = await file.text();
            selectedFiles.push({ name: relativePath, content });
          } else if (entry.kind === "directory") {
            await readDirectory(entry, path ? `${path}/${entry.name}` : entry.name);
          }
        }
      };

      await readDirectory(dirHandle);

      if (selectedFiles.length > 0) {
        setFiles(selectedFiles);
        setLogs([`Loaded ${selectedFiles.length} file(s) from directory`]);
        toast({
          title: "Directory loaded",
          description: `${selectedFiles.length} files ready to scan`,
        });
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        toast({
          title: "Error loading directory",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleScan = () => {
    const filesToScan = files.length > 0 
      ? files 
      : manualCode.trim() 
        ? [{ name: "manual-input.txt", content: manualCode }]
        : [];

    if (filesToScan.length === 0) {
      toast({
        title: "No content to scan",
        description: "Please select a folder or enter code manually",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
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
    setProgress(undefined);
    setLogs((prev) => [...prev, "Scan cancelled by user"]);
    
    toast({
      title: "Scan cancelled",
      description: "The scanning process has been stopped",
    });
  };

  const handleReset = () => {
    setFiles([]);
    setLogs([]);
    setMatches([]);
    setProgress(undefined);
    setSeverityFilter("all");
    setShowManualEntry(false);
    setManualCode("");
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

  const showResults = isScanning || matches.length > 0 || logs.length > 0;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Binary Rain Animation */}
      <BinaryRain side="left" />
      <BinaryRain side="right" />

      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 relative z-10">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center justify-center max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-4xl font-semibold tracking-tight">
                Vibe<span className="text-primary">Leaks</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-3 font-light">
                Client-side secret scanner powered by Gitleaks rules
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-8 py-12 relative z-10">
        {!showResults && files.length === 0 ? (
          /* Initial Upload Screen */
          <div className="max-w-2xl mx-auto">
            <Card className="p-12 border-border/50 shadow-lg bg-card/50 backdrop-blur-sm">
              <div className="text-center space-y-6">
                <div className="space-y-4">
                  <Button
                    onClick={handleDirectorySelect}
                    size="lg"
                    className="w-full h-14 text-lg font-medium"
                  >
                    <FolderOpen className="h-5 w-5 mr-3" />
                    Select Folder
                  </Button>
                  
                  <div className="flex items-center gap-3">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground">OR</span>
                    <Separator className="flex-1" />
                  </div>

                  <Button
                    onClick={() => setShowManualEntry(true)}
                    variant="ghost"
                    className="w-full"
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Enter code manually
                  </Button>
                </div>

                {showManualEntry && (
                  <div className="mt-6 space-y-4">
                    <textarea
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="Paste your code here..."
                      className="w-full h-48 px-4 py-3 bg-background border border-border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button
                      onClick={handleScan}
                      className="w-full"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Scan Code
                    </Button>
                  </div>
                )}

                <div className="text-xs text-muted-foreground space-y-1 mt-8">
                  <p>• Maximum 2000 files</p>
                  <p>• Maximum 5MB per file</p>
                  <p>• Maximum 200MB total size</p>
                </div>
              </div>
            </Card>
          </div>
        ) : !showResults && files.length > 0 ? (
          /* File Tree & Scan View */
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 border-border/50 shadow-lg bg-card/50 backdrop-blur-sm">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-medium">
                    {files.length} file(s) loaded
                  </h2>
                  <Button onClick={handleReset} variant="outline" size="sm">
                    Reset
                  </Button>
                </div>

                <div className="max-h-96 overflow-auto border border-border rounded-lg">
                  <FileTree files={files} />
                </div>

                <Separator />

                <Button
                  onClick={handleScan}
                  size="lg"
                  className="w-full h-14 text-lg font-medium"
                >
                  <Search className="h-5 w-5 mr-3" />
                  Scan for Secrets
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          /* Results View */
          <div className="max-w-6xl mx-auto">
            <Card className="p-8 border-border/50 shadow-lg bg-card/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium">Scan Results</h2>
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
                  {isScanning ? (
                    <Button
                      onClick={handleCancel}
                      variant="destructive"
                      size="sm"
                      className="h-9"
                    >
                      Cancel
                    </Button>
                  ) : (
                    <Button onClick={handleReset} variant="outline" size="sm" className="h-9">
                      New Scan
                    </Button>
                  )}
                </div>
              </div>

              <TerminalOutput
                logs={logs}
                matches={filteredMatches}
                isScanning={isScanning}
                progress={progress}
              />
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
