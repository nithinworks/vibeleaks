import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import type { ScanMatch } from "@/types/scanner";

interface TerminalOutputProps {
  logs: string[];
  matches: ScanMatch[];
  isScanning: boolean;
  progress?: { current: number; total: number; filename: string };
}

export const TerminalOutput = ({ logs, matches, isScanning, progress }: TerminalOutputProps) => {
  return (
    <div className="flex flex-col h-full terminal-bg rounded-lg border terminal-border">
      <div className="flex items-center gap-2 px-4 py-2 border-b terminal-border">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-primary" />
        </div>
        <span className="text-xs terminal-text opacity-70 ml-2">
          {isScanning ? "Scanning..." : "Terminal Output"}
        </span>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2 font-mono text-sm">
          {isScanning && progress && (
            <div className="terminal-text opacity-90 mb-4">
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                <span>
                  Scanning {progress.current}/{progress.total}: {progress.filename}
                </span>
              </div>
            </div>
          )}

          {logs.map((log, idx) => (
            <div key={idx} className="terminal-text opacity-80">
              <span className="opacity-50">$</span> {log}
            </div>
          ))}

          {matches.length > 0 && (
            <div className="mt-4 space-y-3">
              {matches.map((match, idx) => (
                <div
                  key={idx}
                  className="border terminal-border rounded p-3 bg-terminal-bg/50"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="destructive" className="text-xs">
                          {match.ruleId}
                        </Badge>
                        <span className="text-xs terminal-text opacity-70">
                          {match.filename}:{match.lineNumber}
                        </span>
                      </div>
                      <p className="text-sm terminal-text mt-1">
                        {match.description}
                      </p>
                    </div>
                  </div>
                  <div className="ml-6 mt-2">
                    <div className="text-xs terminal-text opacity-50 mb-1">
                      Matched snippet:
                    </div>
                    <code className="text-xs terminal-text bg-code-bg px-2 py-1 rounded block overflow-x-auto">
                      {match.snippet}
                    </code>
                    <div className="text-xs terminal-text opacity-50 mt-1">
                      Full line:
                    </div>
                    <code className="text-xs code-text bg-code-bg px-2 py-1 rounded block overflow-x-auto">
                      {match.line}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isScanning && matches.length === 0 && logs.length > 0 && (
            <div className="flex items-center gap-2 text-primary mt-4">
              <CheckCircle2 className="h-4 w-4" />
              <span>No secrets detected</span>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
