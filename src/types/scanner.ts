export interface ScanRule {
  id: string;
  regex: string;
  description: string;
  keywords?: string[];
  entropy?: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface AllowList {
  regexes?: string[];
  paths?: string[];
  stopwords?: string[];
}

export interface TOMLConfig {
  rules?: ScanRule[];
  allowlist?: AllowList;
}

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface ScanMatch {
  ruleId: string;
  description: string;
  filename: string;
  lineNumber: number;
  snippet: string;
  line: string;
  severity: SeverityLevel;
}

export interface ScanResult {
  matches: ScanMatch[];
  filesScanned: number;
  totalLines: number;
  duration: number;
}

// Worker message types
export interface ScanProgressMessage {
  type: 'progress';
  current: number;
  total: number;
  filename: string;
}

export interface ScanResultMessage {
  type: 'result';
  matches: ScanMatch[];
  filesScanned: number;
  totalLines: number;
  duration: number;
}
