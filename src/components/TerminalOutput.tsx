import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, Loader2, Shield, ShieldAlert, AlertTriangle, Info } from "lucide-react";
import type { ScanMatch, SeverityLevel } from "@/types/scanner";

const severityConfig = {
  critical: {
    icon: ShieldAlert,
    color: "text-red-500",
    bgColor: "bg-red-500/5",
    borderColor: "border-red-500/20",
    badgeVariant: "destructive" as const,
    label: "Critical"
  },
  high: {
    icon: AlertTriangle,
    color: "text-orange-500",
    bgColor: "bg-orange-500/5",
    borderColor: "border-orange-500/20",
    badgeVariant: "destructive" as const,
    label: "High"
  },
  medium: {
    icon: AlertCircle,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/5",
    borderColor: "border-yellow-500/20",
    badgeVariant: "secondary" as const,
    label: "Medium"
  },
  low: {
    icon: Info,
    color: "text-blue-500",
    bgColor: "bg-blue-500/5",
    borderColor: "border-blue-500/20",
    badgeVariant: "secondary" as const,
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
        <div className="space-y-3 pr-4">
          {isScanning && progress && <Card className="p-5 border-primary/20 bg-primary/5">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      Scanning files... {progress.current}/{progress.total}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {progress.filename}
                    </p>
                  </div>
                </div>
                <Progress 
                  value={(progress.current / progress.total) * 100} 
                  className="h-2"
                />
              </div>
            </Card>}

          {matches.length > 0 && <div className="space-y-3">
              {matches.map((match, idx) => {
                const config = severityConfig[match.severity];
                const Icon = config.icon;
                return <Card key={idx} className={`p-4 ${config.borderColor} ${config.bgColor}`}>
                  <div className="flex items-start gap-3">
                    <Icon className={`h-4 w-4 ${config.color} mt-0.5 flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Badge variant={config.badgeVariant} className="text-xs font-normal">
                          {config.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs font-normal">
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