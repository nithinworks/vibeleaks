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

      // Check each rule and collect all matches for this line
      const lineMatches: ScanMatch[] = [];
      
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

          // Convert Go regex to JavaScript regex
          let jsRegex = rule.regex;
          let flags = '';
          
          // Handle case-insensitive flag (?i) at the start
          if (jsRegex.startsWith('(?i)')) {
            flags += 'i';
            jsRegex = jsRegex.substring(4);
          }
          
          // Remove inline case modifiers that JS doesn't support
          jsRegex = jsRegex.replace(/\(\?-i:/g, '(?:');
          jsRegex = jsRegex.replace(/\(\?i:/g, '(?:');
          
          const regex = new RegExp(jsRegex, flags);
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
              lineMatches.push({
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

      // If multiple matches found on this line, prioritize specific rules over generic ones
      if (lineMatches.length > 0) {
        // Check if there are both specific and generic matches
        const specificMatches = lineMatches.filter(m => !m.ruleId.includes('generic'));
        
        // If we have specific matches, use only those; otherwise use all matches
        if (specificMatches.length > 0) {
          matches.push(...specificMatches);
        } else {
          matches.push(...lineMatches);
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
