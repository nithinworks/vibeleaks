import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  Loader2,
  Shield,
  ShieldAlert,
  AlertTriangle,
  Info,
  FileText,
  ShieldCheck,
  FileX,
} from "lucide-react";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { ScanSummaryCard } from "@/components/scanner/ScanSummaryCard";
import type { ScanMatch, SeverityLevel } from "@/types/scanner";

const severityConfig = {
  critical: {
    icon: ShieldAlert,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-500/10 dark:bg-red-500/5",
    borderColor: "border-red-500/30",
    badgeColor: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800",
    label: "Critical",
  },
  high: {
    icon: AlertTriangle,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-500/10 dark:bg-orange-500/5",
    borderColor: "border-orange-500/30",
    badgeColor:
      "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-800",
    label: "High",
  },
  medium: {
    icon: AlertCircle,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-500/10 dark:bg-yellow-500/5",
    borderColor: "border-yellow-500/30",
    badgeColor:
      "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-800",
    label: "Medium",
  },
  low: {
    icon: Info,
    color: "text-muted-foreground",
    bgColor: "bg-muted/20",
    borderColor: "border-border/40",
    badgeColor: "bg-muted/50 text-foreground/70 border-border/50",
    label: "Low",
  },
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
  severityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  scanStats: {
    filesScanned: number;
    totalLines: number;
    duration: number;
  };
}
export const TerminalOutput = ({ logs, matches, isScanning, hasScanCompleted, progress, severityCounts, scanStats }: TerminalOutputProps) => {
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="space-y-2 sm:space-y-2.5 pr-2 sm:pr-4">
          {/* Scan Summary Card */}
          {hasScanCompleted && scanStats.filesScanned > 0 && (
            <ScanSummaryCard
              filesScanned={scanStats.filesScanned}
              totalLines={scanStats.totalLines}
              duration={scanStats.duration}
              severityCounts={severityCounts}
            />
          )}
          
          {/* Scan Configuration Info */}
          {hasScanCompleted && (
            <Card className="p-2.5 sm:p-3 border-border/40 bg-muted/20">
              <div className="flex items-start gap-2 sm:gap-3">
                <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 space-y-1 sm:space-y-1.5 text-[10px] sm:text-xs text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">250+ patterns</span> scanned across
                    <span className="font-medium text-foreground"> 100+ services</span> (Stripe, Google, Supabase,
                    OpenAI, etc.)
                  </p>
                  <div className="flex items-start gap-1 sm:gap-1.5">
                    <FileX className="h-3 w-3 sm:h-3.5 sm:w-3.5 mt-0.5 flex-shrink-0" />
                    <p className="flex-1">
                      <span className="font-medium text-foreground">Excluded:</span> Build artifacts (dist,
                      node_modules), lock files, media files, test/demo files, and binary formats
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
          {isScanning && progress && (
            <Card className="p-3 sm:p-4 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <TextShimmer className="text-xs sm:text-sm font-medium" duration={1.5}>
                      Scanning files...
                    </TextShimmer>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-1.5">
                      {progress.current}/{progress.total} files
                    </p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                    <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground flex-shrink-0" />
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{progress.filename}</p>
                  </div>
                  <Progress value={(progress.current / progress.total) * 100} className="h-1 sm:h-1.5" />
                </div>
              </div>
            </Card>
          )}

          {matches.length > 0 && (
            <div className="space-y-2 sm:space-y-2.5">
              {matches.map((match, idx) => {
                const config = severityConfig[match.severity];
                const Icon = config.icon;
                return (
                  <Card key={idx} className={`p-3 sm:p-3.5 border ${config.borderColor} ${config.bgColor}`}>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${config.color} mt-0.5 flex-shrink-0`} />
                      <div className="flex-1 min-w-0 space-y-2 sm:space-y-2.5">
                        <div className="flex items-start justify-between gap-2 sm:gap-3">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                            <Badge
                              className={`text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 border ${config.badgeColor}`}
                            >
                              {config.label}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 bg-muted/50"
                            >
                              {match.ruleId}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs flex-wrap">
                          <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="font-mono text-foreground/90 font-medium truncate">{match.filename}</span>
                          <span className="text-muted-foreground">:</span>
                          <span className="font-mono font-semibold text-primary">Line {match.lineNumber}</span>
                        </div>

                        <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">{match.description}</p>

                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="rounded-md overflow-hidden border border-border/60">
                            <div className="bg-muted/70 dark:bg-muted/40 px-2 sm:px-2.5 py-1 sm:py-1.5 border-b border-border/60">
                              <p className="text-[10px] sm:text-xs font-semibold text-foreground/70">Matched snippet</p>
                            </div>
                            <code className="text-[10px] sm:text-xs font-mono bg-code-bg text-code-text px-2 sm:px-2.5 py-2 sm:py-2.5 block overflow-x-auto break-all leading-relaxed">
                              {match.snippet}
                            </code>
                          </div>
                          <div className="rounded-md overflow-hidden border border-border/60">
                            <div className="bg-muted/70 dark:bg-muted/40 px-2 sm:px-2.5 py-1 sm:py-1.5 border-b border-border/60">
                              <p className="text-[10px] sm:text-xs font-semibold text-foreground/70">
                                Full line context
                              </p>
                            </div>
                            <code className="text-[10px] sm:text-xs font-mono bg-code-bg text-code-text px-2 sm:px-2.5 py-2 sm:py-2.5 block overflow-x-auto break-all leading-relaxed">
                              {match.line}
                            </code>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {!isScanning && hasScanCompleted && matches.length === 0 && (
            <Card className="p-6 sm:p-8 border-success/30 bg-success/5">
              <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
                <ShieldCheck className="h-10 w-10 sm:h-12 sm:w-12 text-success" strokeWidth={1.5} />
                <div className="space-y-0.5 sm:space-y-1">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">No secrets detected</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Your code is secure</p>
                </div>
              </div>
            </Card>
          )}

          {!isScanning && !hasScanCompleted && logs.length === 0 && (
            <div className="flex items-center justify-center h-full text-xs sm:text-sm text-muted-foreground">
              <p className="font-normal">No scan yet — upload files or enter code to start</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
