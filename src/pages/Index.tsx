import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CodeEditor } from "@/components/CodeEditor";
import { FileUpload } from "@/components/FileUpload";
import { TerminalOutput } from "@/components/TerminalOutput";
import type { ScanMatch } from "@/types/scanner";

const Index = () => {
  const [code, setCode] = useState("");
  const [files, setFiles] = useState<{ name: string; content: string }[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [matches, setMatches] = useState<ScanMatch[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; filename: string }>();
  const workerRef = useRef<Worker>();
  const { toast } = useToast();

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
    setMatches([]);
    setLogs([`Starting scan with Gitleaks rules...`]);

    workerRef.current?.postMessage({
      type: "scan",
      files: filesToScan,
    });
  };

  const handleClear = () => {
    setCode("");
    setFiles([]);
    setLogs([]);
    setMatches([]);
    setProgress(undefined);
  };

  const handleFilesSelected = (selectedFiles: { name: string; content: string }[]) => {
    setFiles(selectedFiles);
    setLogs((prev) => [...prev, `Loaded ${selectedFiles.length} file(s)`]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-primary">$</span> SecretScan Playground
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Client-side secret scanner powered by Gitleaks rules
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-240px)]">
          {/* Left: Code Editor */}
          <Card className="p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Input</h2>
              <FileUpload onFilesSelected={handleFilesSelected} />
            </div>
            
            {files.length > 0 && (
              <div className="mb-4 p-3 bg-muted rounded text-sm">
                <div className="font-medium mb-1">Loaded files:</div>
                <div className="text-muted-foreground">
                  {files.map((f) => f.name).join(", ")}
                </div>
              </div>
            )}

            <div className="flex-1 min-h-0">
              <CodeEditor value={code} onChange={setCode} />
            </div>

            <Separator className="my-4" />

            <div className="flex gap-2">
              <Button
                onClick={handleScan}
                disabled={isScanning}
                className="flex-1"
              >
                <Search className="h-4 w-4 mr-2" />
                {isScanning ? "Scanning..." : "Scan for Secrets"}
              </Button>
              <Button onClick={handleClear} variant="outline" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Right: Terminal Output */}
          <Card className="p-6 flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Output</h2>
            <div className="flex-1 min-h-0">
              <TerminalOutput
                logs={logs}
                matches={matches}
                isScanning={isScanning}
                progress={progress}
              />
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
