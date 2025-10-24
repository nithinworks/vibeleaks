import type { ScanRule, AllowList, ScanMatch } from '../types/scanner';

interface ScanMessage {
  type: 'scan';
  files: { name: string; content: string }[];
  rules: ScanRule[];
  allowlist?: AllowList;
}

interface ProgressMessage {
  type: 'progress';
  current: number;
  total: number;
  filename: string;
}

interface ResultMessage {
  type: 'result';
  matches: ScanMatch[];
  filesScanned: number;
  totalLines: number;
  duration: number;
}

self.onmessage = async (e: MessageEvent<ScanMessage>) => {
  const { files, rules, allowlist } = e.data;
  const startTime = performance.now();
  const matches: ScanMatch[] = [];
  let totalLines = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Send progress update
    self.postMessage({
      type: 'progress',
      current: i + 1,
      total: files.length,
      filename: file.name,
    } as ProgressMessage);

    // Check if file is in allowlist paths
    if (allowlist?.paths?.some(path => file.name.includes(path))) {
      continue;
    }

    const lines = file.content.split('\n');
    totalLines += lines.length;

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];

      // Check each rule
      for (const rule of rules) {
        try {
          const regex = new RegExp(rule.regex, 'gi');
          const match = regex.exec(line);

          if (match) {
            // Check if match is in allowlist
            const isAllowed = allowlist?.regexes?.some(allowRegex => {
              try {
                return new RegExp(allowRegex, 'i').test(match[0]);
              } catch {
                return false;
              }
            });

            if (!isAllowed) {
              matches.push({
                ruleId: rule.id,
                description: rule.description,
                filename: file.name,
                lineNumber: lineNum + 1,
                snippet: match[0],
                line: line.trim(),
              });
            }
          }
        } catch (error) {
          console.error(`Error processing rule ${rule.id}:`, error);
        }
      }
    }
  }

  const duration = performance.now() - startTime;

  // Send final result
  self.postMessage({
    type: 'result',
    matches,
    filesScanned: files.length,
    totalLines,
    duration,
  } as ResultMessage);
};

export {};
