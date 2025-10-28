import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Hash, Clock, ShieldAlert, AlertTriangle, AlertCircle, Info } from "lucide-react";

interface ScanSummaryCardProps {
  filesScanned: number;
  totalLines: number;
  duration: number;
  severityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export const ScanSummaryCard = ({ filesScanned, totalLines, duration, severityCounts }: ScanSummaryCardProps) => {
  const totalFindings = severityCounts.critical + severityCounts.high + severityCounts.medium + severityCounts.low;
  
  // Calculate risk score (0-100)
  const riskScore = Math.min(
    100,
    severityCounts.critical * 10 + severityCounts.high * 5 + severityCounts.medium * 2 + severityCounts.low * 1
  );

  const getRiskLevel = (score: number) => {
    if (score === 0) return { label: "Secure", color: "text-success", bgColor: "bg-success/10", borderColor: "border-success/30" };
    if (score < 20) return { label: "Low Risk", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/30" };
    if (score < 50) return { label: "Medium Risk", color: "text-yellow-600 dark:text-yellow-400", bgColor: "bg-yellow-500/10", borderColor: "border-yellow-500/30" };
    if (score < 80) return { label: "High Risk", color: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/30" };
    return { label: "Critical Risk", color: "text-red-600 dark:text-red-400", bgColor: "bg-red-500/10", borderColor: "border-red-500/30" };
  };

  const riskLevel = getRiskLevel(riskScore);

  return (
    <Card className={`p-4 sm:p-5 border ${riskLevel.borderColor} ${riskLevel.bgColor}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Scan Summary</h3>
          <Badge className={`${riskLevel.color} font-semibold px-2 py-1`} variant="outline">
            {riskLevel.label}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Files Scanned */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Files</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">{filesScanned}</p>
          </div>

          {/* Lines Analyzed */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Hash className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Lines</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">{totalLines.toLocaleString()}</p>
          </div>

          {/* Time Taken */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Duration</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {duration < 1000 ? `${duration.toFixed(0)}ms` : `${(duration / 1000).toFixed(2)}s`}
            </p>
          </div>

          {/* Total Findings */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Findings</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">{totalFindings}</p>
          </div>
        </div>

        {/* Risk Score Breakdown */}
        {totalFindings > 0 && (
          <div className="pt-3 border-t border-border/40">
            <p className="text-xs font-medium text-muted-foreground mb-2.5">Risk Breakdown</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {severityCounts.critical > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-red-500/10 border border-red-500/20">
                  <ShieldAlert className="h-3 w-3 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-red-600 dark:text-red-400">{severityCounts.critical}</span>
                    <span className="text-[10px] text-red-600/70 dark:text-red-400/70">Critical</span>
                  </div>
                </div>
              )}
              {severityCounts.high > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-orange-500/10 border border-orange-500/20">
                  <AlertTriangle className="h-3 w-3 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{severityCounts.high}</span>
                    <span className="text-[10px] text-orange-600/70 dark:text-orange-400/70">High</span>
                  </div>
                </div>
              )}
              {severityCounts.medium > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-yellow-500/10 border border-yellow-500/20">
                  <AlertCircle className="h-3 w-3 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{severityCounts.medium}</span>
                    <span className="text-[10px] text-yellow-600/70 dark:text-yellow-400/70">Medium</span>
                  </div>
                </div>
              )}
              {severityCounts.low > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-muted/20 border border-border/40">
                  <Info className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-foreground/70">{severityCounts.low}</span>
                    <span className="text-[10px] text-muted-foreground">Low</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
