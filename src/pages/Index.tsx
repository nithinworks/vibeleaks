import { useState, useRef, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search, Trash2, Download, Filter, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CodeEditor } from "@/components/CodeEditor";
import { FileUpload } from "@/components/FileUpload";
import { TerminalOutput } from "@/components/TerminalOutput";
import { FileTree } from "@/components/FileTree";
import { ThemeToggle } from "@/components/ThemeToggle";
import { IconButton } from "@/components/IconButton";
import { MobileWarning } from "@/components/MobileWarning";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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

  const handleExportMarkdown = useCallback(() => {
    const timestamp = new Date().toISOString();
    let markdown = `# VibeLeaks Security Scan Report\n\n`;
    markdown += `**Scan Date:** ${timestamp}\n\n`;
    markdown += `## Summary\n\n`;
    markdown += `- **Total Issues:** ${matches.length}\n`;
    markdown += `- **Critical:** ${severityCounts.critical}\n`;
    markdown += `- **High:** ${severityCounts.high}\n`;
    markdown += `- **Medium:** ${severityCounts.medium}\n`;
    markdown += `- **Low:** ${severityCounts.low}\n\n`;
    
    if (matches.length > 0) {
      markdown += `## Detected Secrets\n\n`;
      
      // Group by severity
      const groupedMatches = {
        critical: matches.filter(m => m.severity === 'critical'),
        high: matches.filter(m => m.severity === 'high'),
        medium: matches.filter(m => m.severity === 'medium'),
        low: matches.filter(m => m.severity === 'low'),
      };
      
      for (const [severity, items] of Object.entries(groupedMatches)) {
        if (items.length > 0) {
          markdown += `### ${severity.charAt(0).toUpperCase() + severity.slice(1)} Severity\n\n`;
          
          items.forEach((match, index) => {
            markdown += `#### ${index + 1}. ${match.ruleId}\n\n`;
            markdown += `- **File:** \`${match.filename}\`\n`;
            markdown += `- **Line:** ${match.lineNumber}\n`;
            if (match.description) {
              markdown += `- **Description:** ${match.description}\n`;
            }
            markdown += `- **Match:** \`${match.line}\`\n\n`;
            markdown += `\`\`\`\n${match.snippet || match.line}\n\`\`\`\n\n`;
          });
        }
      }
    } else {
      markdown += `## Results\n\n✅ No secrets detected!\n`;
    }
    
    markdown += `---\n\n*Generated by VibeLeaks Security Scanner*\n`;
    
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vibleaks-scan-${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export successful",
      description: "Scan results exported as Markdown",
    });
  }, [matches, severityCounts, toast]);

  const handleExportCSV = useCallback(() => {
    let csv = `"Severity","Rule ID","File","Line","Match","Description"\n`;
    
    matches.forEach((match) => {
      const severity = `"${match.severity}"`;
      const ruleId = `"${match.ruleId.replace(/"/g, '""')}"`;
      const filename = `"${match.filename.replace(/"/g, '""')}"`;
      const lineNumber = `"${match.lineNumber}"`;
      const line = `"${match.line.replace(/"/g, '""')}"`;
      const description = `"${(match.description || '').replace(/"/g, '""')}"`;
      
      csv += `${severity},${ruleId},${filename},${lineNumber},${line},${description}\n`;
    });
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vibleaks-scan-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export successful",
      description: "Scan results exported as CSV",
    });
  }, [matches, toast]);
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
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <svg
                width="20"
                height="20"
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
              <h1 className="text-sm sm:text-base font-display font-medium tracking-tight">
                Vibe<span className="text-primary">Leaks</span>
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {viewMode === "input" && (
            <>
              {/* PixelBlast Pattern Animation - Full Viewport - Lazy Loaded */}
              <div className="fixed inset-0 pointer-events-none opacity-30 dark:opacity-40 z-0">
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

              <div className="relative flex flex-col items-center justify-center min-h-[85vh] text-center z-10 py-20">
                {/* Content */}
                <div className="relative max-w-2xl mx-auto space-y-6 sm:space-y-8">
                  {/* Chrome Badge */}
                  <div className="flex justify-center mb-3 sm:mb-4">
                    <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20">
                      <svg 
                        viewBox="0 0 24 24" 
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" 
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                      </svg>
                      <span className="text-[10px] sm:text-xs font-medium text-primary">For better experience use Chrome browser</span>
                    </div>
                  </div>

                <div className="space-y-2 sm:space-y-3">
                  <h2 className="font-display font-medium tracking-tight text-2xl sm:text-3xl lg:text-4xl px-4">
                    Sniff Out <span className="text-primary font-semibold">Secrets</span>. Locally. Fast.
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

              {/* Stats/Credibility Bar */}
              <section className="relative py-16 z-10">
                <div className="max-w-5xl mx-auto">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="text-center">
                      <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">250+</div>
                      <div className="text-sm text-muted-foreground">Detection Patterns</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">100+</div>
                      <div className="text-sm text-muted-foreground">Services Covered</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">0</div>
                      <div className="text-sm text-muted-foreground">Data Sent to Servers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">&lt;5s</div>
                      <div className="text-sm text-muted-foreground">Scan Time</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Features Section */}
              <section className="relative py-16 z-10">
                <div className="max-w-5xl mx-auto">
                  <div className="text-center mb-12">
                    <h3 className="text-2xl font-semibold mb-3">Why VibeLeaks?</h3>
                    <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
                      Built for developers who care about security without sacrificing speed
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Feature 1 */}
                    <Card className="p-6 border-border/30 backdrop-blur-sm bg-card/50 hover:border-primary/40 transition-colors">
                      <div className="mb-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                      </div>
                      <h4 className="font-semibold text-lg mb-2">Lightning Fast</h4>
                      <p className="text-muted-foreground text-sm">
                        Scan thousands of files in seconds. All processing happens locally in your browser using Web Workers.
                      </p>
                    </Card>

                    {/* Feature 2 */}
                    <Card className="p-6 border-border/30 backdrop-blur-sm bg-card/50 hover:border-primary/40 transition-colors">
                      <div className="mb-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      </div>
                      <h4 className="font-semibold text-lg mb-2">100% Private</h4>
                      <p className="text-muted-foreground text-sm">
                        Your code never leaves your machine. No uploads, no servers, no tracking. Complete privacy guaranteed.
                      </p>
                    </Card>

                    {/* Feature 3 */}
                    <Card className="p-6 border-border/30 backdrop-blur-sm bg-card/50 hover:border-primary/40 transition-colors">
                      <div className="mb-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <h4 className="font-semibold text-lg mb-2">Smart Detection</h4>
                      <p className="text-muted-foreground text-sm">
                        220+ detection rules covering AWS, GitHub, Stripe, OpenAI, and more. Continuously updated patterns.
                      </p>
                    </Card>
                  </div>
                </div>
              </section>

              {/* How It Works Section */}
              <section className="relative py-16 z-10">
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
              </section>

              {/* Use Cases Section */}
              <section className="relative py-16 z-10">
                <div className="max-w-5xl mx-auto">
                  <div className="text-center mb-12">
                    <h3 className="text-2xl font-semibold mb-3">Perfect For</h3>
                    <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
                      Integrate security checks into your workflow
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Use Case 1 */}
                    <Card className="p-6 border-border/30 backdrop-blur-sm bg-card/50 hover:border-primary/40 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Before Committing Code</h4>
                          <p className="text-muted-foreground text-sm">
                            Catch secrets before they hit your repository. Run a quick scan as part of your pre-commit workflow.
                          </p>
                        </div>
                      </div>
                    </Card>

                    {/* Use Case 2 */}
                    <Card className="p-6 border-border/30 backdrop-blur-sm bg-card/50 hover:border-primary/40 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">During Code Reviews</h4>
                          <p className="text-muted-foreground text-sm">
                            Ensure pull requests don't introduce security risks. Quick verification for reviewers.
                          </p>
                        </div>
                      </div>
                    </Card>

                    {/* Use Case 3 */}
                    <Card className="p-6 border-border/30 backdrop-blur-sm bg-card/50 hover:border-primary/40 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Auditing Dependencies</h4>
                          <p className="text-muted-foreground text-sm">
                            Check third-party code and open source packages for hardcoded credentials.
                          </p>
                        </div>
                      </div>
                    </Card>

                    {/* Use Case 4 */}
                    <Card className="p-6 border-border/30 backdrop-blur-sm bg-card/50 hover:border-primary/40 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Pre-deployment Checks</h4>
                          <p className="text-muted-foreground text-sm">
                            Final security scan before deploying to production. Peace of mind guaranteed.
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </section>

              {/* Security Tips Section */}
              <section className="relative py-16 z-10">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-semibold mb-3">Security Best Practices</h3>
                    <p className="text-muted-foreground text-sm">
                      Quick tips to keep your codebase secure
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 border-border/30 text-center">
                      <div className="mb-3 flex justify-center">
                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </div>
                      <p className="font-semibold mb-2">Never Commit .env Files</p>
                      <p className="text-sm text-muted-foreground">
                        Always add environment files to .gitignore before committing
                      </p>
                    </Card>

                    <Card className="p-6 border-border/30 text-center">
                      <div className="mb-3 flex justify-center">
                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <p className="font-semibold mb-2">Use Environment Variables</p>
                      <p className="text-sm text-muted-foreground">
                        Store sensitive data in environment variables, not in code
                      </p>
                    </Card>

                    <Card className="p-6 border-border/30 text-center">
                      <div className="mb-3 flex justify-center">
                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <p className="font-semibold mb-2">Rotate Exposed Keys</p>
                      <p className="text-sm text-muted-foreground">
                        If a key is exposed, rotate it immediately on the provider
                      </p>
                    </Card>
                  </div>
                </div>
              </section>

              {/* Minimal Footer */}
              <footer className="relative border-t border-border/50 py-8 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <svg
                        width="16"
                        height="16"
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
                      <span className="text-sm font-display font-medium">
                        Vibe<span className="text-primary">Leaks</span>
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                      <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                        GitHub
                      </a>
                      <span className="hidden md:inline">•</span>
                      <a href="https://github.com/gitleaks/gitleaks" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                        Gitleaks Rules
                      </a>
                      <span className="hidden md:inline">•</span>
                      <span className="text-xs">100% Private • No Data Stored</span>
                    </div>
                  </div>
                </div>
              </footer>
            </>
          )}

          {viewMode === "ready" && (
            <>
              {/* PixelBlast Pattern Animation Behind Dialog */}
              <div className="fixed inset-0 pointer-events-none opacity-30 dark:opacity-40 z-0">
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

              <div className="relative flex items-center justify-center min-h-[85vh] z-10 py-20">
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 sm:h-9 rounded-lg border-border/50 hover:bg-muted/80 text-xs sm:text-sm">
                              <FileDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-2" />
                              Export
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={handleExportJSON}>
                              <Download className="h-4 w-4 mr-2" />
                              Export as JSON
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleExportMarkdown}>
                              <FileDown className="h-4 w-4 mr-2" />
                              Export as Markdown
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleExportCSV}>
                              <FileDown className="h-4 w-4 mr-2" />
                              Export as CSV
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
