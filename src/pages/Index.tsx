import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CodeEditor } from "@/components/CodeEditor";
import { FileUpload } from "@/components/FileUpload";
import { TerminalOutput } from "@/components/TerminalOutput";
import { FileTree } from "@/components/FileTree";
import type { ScanMatch } from "@/types/scanner";

const Index = () => {
  const [code, setCode] = useState("");
  const [files, setFiles] = useState<{ name: string; content: string }[]>([]);
  const [isDirectory, setIsDirectory] = useState(false);
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
    setIsDirectory(false);
    setLogs([]);
    setMatches([]);
    setProgress(undefined);
  };

  const handleFilesSelected = (selectedFiles: { name: string; content: string }[], isDir: boolean) => {
    setFiles(selectedFiles);
    setIsDirectory(isDir);
    
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
          <div className="max-w-3xl">
            <h1 className="text-4xl font-lora font-semibold tracking-tight">
              SecretScan <span className="text-primary">Playground</span>
            </h1>
            <p className="text-base text-muted-foreground mt-3 font-light">
              Client-side secret scanner powered by Gitleaks rules
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-8 py-8">

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Code Editor */}
          <Card className="p-8 flex flex-col border-border/50 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-lora font-medium">Input</h2>
              <FileUpload onFilesSelected={handleFilesSelected} />
            </div>
            
            {isDirectory && files.length > 0 ? (
              <FileTree files={files} />
            ) : (
              <CodeEditor value={code} onChange={setCode} />
            )}

            <Separator className="my-6" />

            <div className="flex gap-3">
              <Button
                onClick={handleScan}
                disabled={isScanning}
                className="flex-1 h-11 font-medium"
              >
                <Search className="h-4 w-4 mr-2" />
                {isScanning ? "Scanning..." : "Scan for Secrets"}
              </Button>
              <Button onClick={handleClear} variant="outline" size="icon" className="h-11 w-11">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Right: Terminal Output */}
          <Card className="p-8 flex flex-col border-border/50 shadow-sm">
            <h2 className="text-xl font-lora font-medium mb-6">Output</h2>
            <TerminalOutput
              logs={logs}
              matches={matches}
              isScanning={isScanning}
              progress={progress}
            />
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
