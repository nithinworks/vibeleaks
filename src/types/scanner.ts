export interface ScanRule {
  id: string;
  regex: string;
  description: string;
  keywords?: string[];
  entropy?: number;
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

export interface ScanMatch {
  ruleId: string;
  description: string;
  filename: string;
  lineNumber: number;
  snippet: string;
  line: string;
}

export interface ScanResult {
  matches: ScanMatch[];
  filesScanned: number;
  totalLines: number;
  duration: number;
}
