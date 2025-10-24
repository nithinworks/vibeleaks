import type { ScanRule, AllowList, ScanMatch } from '../types/scanner';
import rulesConfig from '../config/gitleaks-rules.json';

interface ScanMessage {
  type: 'scan';
  files: { name: string; content: string }[];
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
  const { files } = e.data;
  const startTime = performance.now();
  const matches: ScanMatch[] = [];
  let totalLines = 0;

  const rules = rulesConfig.rules as ScanRule[];
  const allowlist = rulesConfig.allowlist as AllowList;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Send progress update
    self.postMessage({
      type: 'progress',
      current: i + 1,
      total: files.length,
      filename: file.name,
    } as ProgressMessage);

    // Check if file path matches allowlist paths
    if (allowlist?.paths?.some(pathPattern => {
      try {
        return new RegExp(pathPattern).test(file.name);
      } catch {
        return false;
      }
    })) {
      continue;
    }

    const lines = file.content.split('\n');
    totalLines += lines.length;

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];

      // Skip empty or very short lines
      if (line.trim().length < 3) {
        continue;
      }

      // Check if entire line matches any allowlist pattern
      const lineIsAllowed = allowlist?.regexes?.some(allowRegex => {
        try {
          return new RegExp(allowRegex).test(line);
        } catch {
          return false;
        }
      });

      if (lineIsAllowed) {
        continue;
      }

      // Check each rule
      for (const rule of rules) {
        try {
          // Skip rules without regex (path-only rules)
          if (!rule.regex) {
            continue;
          }

          // First check if keywords exist (if defined)
          if (rule.keywords && rule.keywords.length > 0) {
            const hasKeyword = rule.keywords.some(keyword =>
              line.toLowerCase().includes(keyword.toLowerCase())
            );
            if (!hasKeyword) {
              continue;
            }
          }

          const regex = new RegExp(rule.regex);
          const match = regex.exec(line);

          if (match) {
            const matchedText = match[1] || match[0];
            
            // Check if matched text is a stopword
            if (allowlist?.stopwords?.some(word => 
              matchedText.toLowerCase().includes(word.toLowerCase())
            )) {
              continue;
            }

            // Check if matched text matches allowlist patterns
            const matchIsAllowed = allowlist?.regexes?.some(allowRegex => {
              try {
                return new RegExp(allowRegex).test(matchedText);
              } catch {
                return false;
              }
            });

            if (!matchIsAllowed) {
              matches.push({
                ruleId: rule.id,
                description: rule.description,
                filename: file.name,
                lineNumber: lineNum + 1,
                snippet: matchedText,
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
