import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, Loader2, Shield, ShieldAlert, AlertTriangle, Info, FileText } from "lucide-react";
import { TextShimmer } from "@/components/ui/text-shimmer";
import type { ScanMatch, SeverityLevel } from "@/types/scanner";

const severityConfig = {
  critical: {
    icon: ShieldAlert,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-500/10 dark:bg-red-500/5",
    borderColor: "border-red-500/30",
    badgeColor: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800",
    label: "Critical"
  },
  high: {
    icon: AlertTriangle,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-500/10 dark:bg-orange-500/5",
    borderColor: "border-orange-500/30",
    badgeColor: "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-800",
    label: "High"
  },
  medium: {
    icon: AlertCircle,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-500/10 dark:bg-yellow-500/5",
    borderColor: "border-yellow-500/30",
    badgeColor: "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-800",
    label: "Medium"
  },
  low: {
    icon: Info,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10 dark:bg-blue-500/5",
    borderColor: "border-blue-500/30",
    badgeColor: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800",
    label: "Low"
  }
};
interface TerminalOutputProps {
  logs: string[];
  matches: ScanMatch[];
  isScanning: boolean;
  hasScanCompleted: boolean;
  progress?: {
    current: number;
    total: number;
    filename: string;
  };
}
export const TerminalOutput = ({
  logs,
  matches,
  isScanning,
  hasScanCompleted,
  progress
}: TerminalOutputProps) => {
  return <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="space-y-2.5 pr-4">
          {isScanning && progress && <Card className="p-4 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <TextShimmer 
                      className="text-sm font-medium"
                      duration={1.5}
                    >
                      Scanning files...
                    </TextShimmer>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {progress.current}/{progress.total} files
                    </p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground truncate">
                      {progress.filename}
                    </p>
                  </div>
                  <Progress 
                    value={(progress.current / progress.total) * 100} 
                    className="h-1.5"
                  />
                </div>
              </div>
            </Card>}

          {matches.length > 0 && <div className="space-y-2.5">
              {matches.map((match, idx) => {
                const config = severityConfig[match.severity];
                const Icon = config.icon;
                return <Card key={idx} className={`p-3.5 border ${config.borderColor} ${config.bgColor}`}>
                  <div className="flex items-start gap-3">
                    <Icon className={`h-4 w-4 ${config.color} mt-0.5 flex-shrink-0`} />
                    <div className="flex-1 min-w-0 space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <Badge className={`text-xs font-medium px-2 py-0.5 border ${config.badgeColor}`}>
                            {config.label}
                          </Badge>
                          <Badge variant="outline" className="text-xs font-medium px-2 py-0.5 bg-muted/50">
                            {match.ruleId}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="font-mono text-foreground/90 font-medium truncate">
                          {match.filename}
                        </span>
                        <span className="text-muted-foreground">:</span>
                        <span className="font-mono font-semibold text-primary">
                          Line {match.lineNumber}
                        </span>
                      </div>

                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {match.description}
                      </p>

                      <div className="space-y-2">
                        <div className="rounded-md overflow-hidden border border-border/50">
                          <div className="bg-muted/50 px-2.5 py-1 border-b border-border/50">
                            <p className="text-xs text-muted-foreground font-medium">
                              Matched snippet
                            </p>
                          </div>
                          <code className="text-xs font-mono bg-muted/30 px-2.5 py-2 block overflow-x-auto">
                            {match.snippet}
                          </code>
                        </div>
                        <div className="rounded-md overflow-hidden border border-border/50">
                          <div className="bg-muted/50 px-2.5 py-1 border-b border-border/50">
                            <p className="text-xs text-muted-foreground font-medium">
                              Full line context
                            </p>
                          </div>
                          <code className="text-xs font-mono bg-muted/30 px-2.5 py-2 block overflow-x-auto">
                            {match.line}
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>;
              })}
            </div>}

          {!isScanning && hasScanCompleted && matches.length === 0 && <Card className="p-6 border-primary/20 bg-primary/5">
              <div className="flex items-center gap-3 text-primary">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-normal">No secrets detected</span>
              </div>
            </Card>}

          {!isScanning && !hasScanCompleted && logs.length === 0 && <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              <p className="font-normal">
                No scan yet — upload files or enter code to start
              </p>
            </div>}
        </div>
      </ScrollArea>
    </div>;
};