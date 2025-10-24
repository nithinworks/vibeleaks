import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import type { ScanMatch } from "@/types/scanner";

interface TerminalOutputProps {
  logs: string[];
  matches: ScanMatch[];
  isScanning: boolean;
  progress?: { current: number; total: number; filename: string };
}

export const TerminalOutput = ({ logs, matches, isScanning, progress }: TerminalOutputProps) => {
  return (
    <div className="flex flex-col h-[580px]">
      <ScrollArea className="flex-1">
        <div className="space-y-3 pr-4">
          {isScanning && progress && (
            <Card className="p-4 border-border/50">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-normal truncate">
                    Scanning {progress.current}/{progress.total}
                  </p>
                  <p className="text-xs truncate mt-0.5">{progress.filename}</p>
                </div>
              </div>
            </Card>
          )}

          {matches.length > 0 && (
            <div className="space-y-3">
              {matches.map((match, idx) => (
                <Card key={idx} className="p-4 border-destructive/20 bg-destructive/5">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Badge variant="destructive" className="text-xs font-normal">
                          {match.ruleId}
                        </Badge>
                        <span className="text-xs text-muted-foreground truncate">
                          {match.filename}:{match.lineNumber}
                        </span>
                      </div>
                      <p className="text-sm font-normal text-foreground mb-3 break-words">
                        {match.description}
                      </p>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 font-normal">
                            Matched snippet:
                          </p>
                          <code className="text-xs font-mono bg-muted px-2 py-1.5 rounded block overflow-x-auto break-all">
                            {match.snippet}
                          </code>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 font-normal">
                            Full line:
                          </p>
                          <code className="text-xs font-mono bg-muted px-2 py-1.5 rounded block overflow-x-auto break-all">
                            {match.line}
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!isScanning && matches.length === 0 && logs.length > 0 && (
            <Card className="p-6 border-primary/20 bg-primary/5">
              <div className="flex items-center gap-3 text-primary">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-normal">No secrets detected</span>
              </div>
            </Card>
          )}

          {!isScanning && logs.length === 0 && (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              <p className="font-normal">Results will appear here</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
