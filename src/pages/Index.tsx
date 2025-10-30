import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { MobileWarning } from "@/components/MobileWarning";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/homepage/HeroSection";
import { FeaturesSection } from "@/components/homepage/FeaturesSection";
import { ProjectFailuresSection } from "@/components/homepage/ProjectFailuresSection";
import { UseCasesSection } from "@/components/homepage/UseCasesSection";
import { SecurityTipsSection } from "@/components/homepage/SecurityTipsSection";
import { Footer } from "@/components/homepage/Footer";
import { ScannerInterface } from "@/components/scanner/ScannerInterface";
import type { ScanMatch, SeverityLevel, ScanProgressMessage, ScanResultMessage } from "@/types/scanner";

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
  const [viewMode, setViewMode] = useState<"input" | "ready" | "results">("input");
  const [scanStats, setScanStats] = useState<{ filesScanned: number; totalLines: number; duration: number }>({
    filesScanned: 0,
    totalLines: 0,
    duration: 0,
  });
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
    (e: MessageEvent<ScanProgressMessage | ScanResultMessage>) => {
      if (e.data.type === "progress") {
        setProgress(e.data);
      } else if (e.data.type === "result") {
        const { matches: foundMatches, filesScanned, totalLines, duration } = e.data;
        setMatches(foundMatches);
        setScanStats({ filesScanned, totalLines, duration });
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
      filename: "Initializing scanner...",
    });
    setViewMode("results");
    workerRef.current?.postMessage({
      type: "scan",
      files: filesToScan,
    });
  }, [code, files, ensureWorkerReady, toast]);

  const handleCancel = useCallback(() => {
    workerRef.current?.postMessage({ type: "cancel" });
    setIsScanning(false);
    setHasScanCompleted(false);
    setProgress(undefined);
    setViewMode("input");
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
    setScanStats({ filesScanned: 0, totalLines: 0, duration: 0 });
  }, []);

  const handleExportJSON = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      summary: {
        filesScanned: scanStats.filesScanned,
        totalLines: scanStats.totalLines,
        duration: scanStats.duration,
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
  }, [matches, severityCounts, scanStats, toast]);

  const handleExportMarkdown = useCallback(() => {
    let markdown = `# ViB Leaks Security Scan Report\n\n`;
    markdown += `**Generated:** ${new Date().toLocaleString()}\n\n`;
    markdown += `## Summary\n\n`;
    markdown += `- **Files Scanned:** ${scanStats.filesScanned}\n`;
    markdown += `- **Total Lines:** ${scanStats.totalLines}\n`;
    markdown += `- **Duration:** ${scanStats.duration}ms\n`;
    markdown += `- **Total Findings:** ${matches.length}\n`;
    markdown += `  - 🔴 Critical: ${severityCounts.critical}\n`;
    markdown += `  - 🟠 High: ${severityCounts.high}\n`;
    markdown += `  - 🟡 Medium: ${severityCounts.medium}\n`;
    markdown += `  - 🔵 Low: ${severityCounts.low}\n\n`;

    if (matches.length > 0) {
      markdown += `## Findings\n\n`;
      matches.forEach((match, index) => {
        const severityEmoji = {
          critical: '🔴',
          high: '🟠',
          medium: '🟡',
          low: '🔵'
        }[match.severity];
        
        markdown += `### ${index + 1}. ${severityEmoji} ${match.description}\n\n`;
        markdown += `- **Severity:** ${match.severity.toUpperCase()}\n`;
        markdown += `- **File:** \`${match.filename}\`\n`;
        markdown += `- **Line:** ${match.lineNumber}\n`;
        markdown += `- **Rule ID:** ${match.ruleId}\n\n`;
        markdown += `**Code Snippet:**\n\`\`\`\n${match.snippet}\n\`\`\`\n\n`;
        markdown += `---\n\n`;
      });
    }

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
  }, [matches, severityCounts, scanStats, toast]);

  const handleExportCSV = useCallback(() => {
    let csv = `"Severity","Rule ID","Description","Filename","Line Number","Code Snippet"\n`;
    
    matches.forEach((match) => {
      const escapedDescription = match.description.replace(/"/g, '""');
      const escapedFilename = match.filename.replace(/"/g, '""');
      const escapedSnippet = match.snippet.replace(/"/g, '""').replace(/\n/g, ' ');
      
      csv += `"${match.severity}","${match.ruleId}","${escapedDescription}","${escapedFilename}","${match.lineNumber}","${escapedSnippet}"\n`;
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

  const handleFilesSelected = useCallback(
    (selectedFiles: { name: string; content: string }[], isDir: boolean) => {
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
    },
    []
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobileWarning />
      <Header />

      <main className="flex-1 flex flex-col">
        {viewMode === "input" && (
          <div className="flex-1">
            <HeroSection onFilesSelected={handleFilesSelected} />
            <FeaturesSection />
            <ProjectFailuresSection />
            <UseCasesSection />
            <SecurityTipsSection />
          </div>
        )}

        {(viewMode === "ready" || viewMode === "results") && (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 flex-1">
            <div className="max-w-7xl mx-auto">
              <ScannerInterface
                  viewMode={viewMode}
                  files={files}
                  logs={logs}
                  matches={matches}
                  filteredMatches={filteredMatches}
                  isScanning={isScanning}
                  hasScanCompleted={hasScanCompleted}
                  progress={progress}
                  severityFilter={severityFilter}
                  severityCounts={severityCounts}
                  scanStats={scanStats}
                  onScan={handleScan}
                  onCancel={handleCancel}
                  onClear={handleClear}
                  onExportJSON={handleExportJSON}
                  onExportMarkdown={handleExportMarkdown}
                  onExportCSV={handleExportCSV}
                  onSeverityFilterChange={setSeverityFilter}
              />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
