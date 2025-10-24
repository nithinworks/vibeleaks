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

// Calculate Shannon entropy for a string
function calculateEntropy(str: string): number {
  if (!str || str.length === 0) return 0;
  
  const frequencies = new Map<string, number>();
  for (const char of str) {
    frequencies.set(char, (frequencies.get(char) || 0) + 1);
  }
  
  let entropy = 0;
  const len = str.length;
  for (const freq of frequencies.values()) {
    const p = freq / len;
    entropy -= p * Math.log2(p);
  }
  
  return entropy;
}

// Check if file is a test/example/demo file (context-aware)
function isTestOrExampleFile(filename: string): boolean {
  const patterns = [
    /\.test\./,
    /\.spec\./,
    /__tests__\//,
    /__mocks__\//,
    /\/tests?\//,
    /\/examples?\//,
    /\/demo\//,
    /\/samples?\//,
    /\/fixtures?\//,
    /\.fixture\./,
    /\.mock\./,
  ];
  
  return patterns.some(pattern => pattern.test(filename.toLowerCase()));
}

// Check if line contains secret-related variable names (context-aware)
function hasSecretVariableName(line: string): boolean {
  const secretPatterns = [
    /\b(api[_-]?key|apikey)\b/i,
    /\b(secret|password|passwd|pwd)\b/i,
    /\b(token|auth)\b/i,
    /\b(access[_-]?key|private[_-]?key)\b/i,
    /\b(credential|cred)\b/i,
  ];
  
  return secretPatterns.some(pattern => pattern.test(line));
}

// Enhanced allowlist patterns for common false positives
const enhancedAllowlistPatterns = [
  // UUIDs (v4 format)
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  
  // Color codes
  /^#[0-9a-f]{3,8}$/i,
  
  // Common placeholder/example values
  /AKIA[0-9A-Z]{16}EXAMPLE/i,
  /your[_-]?(api[_-]?)?key[_-]?here/i,
  /replace[_-]?with[_-]?your/i,
  /example[_-]?(key|token|secret)/i,
  /\btest[_-]?(key|token|secret)/i,
  /\bdemo[_-]?(key|token|secret)/i,
  /\bsample[_-]?(key|token|secret)/i,
  /\bplaceholder/i,
  /\bxxx+/i,
  /\b000+/i,
  /\b111+/i,
  /\b123+/i,
  
  // Base64 encoded images
  /^data:image\//,
  
  // Common non-secret patterns
  /^(true|false|null|undefined)$/i,
  /^(localhost|127\.0\.0\.1)/,
  /^https?:\/\//,
  
// Very short strings (likely not secrets)
  /^.{1,6}$/,
];

// Determine severity level based on rule ID
function getSeverityLevel(ruleId: string): 'critical' | 'high' | 'medium' | 'low' {
  const id = ruleId.toLowerCase();
  
  // Critical: Private keys, database credentials, root credentials
  if (
    id.includes('private-key') ||
    id.includes('private_key') ||
    id.includes('database') ||
    id.includes('postgres') ||
    id.includes('mysql') ||
    id.includes('mongodb') ||
    id.includes('aws-secret-access-key') ||
    id.includes('root') ||
    id.includes('master') ||
    id.includes('admin-password')
  ) {
    return 'critical';
  }
  
  // High: Service API keys, OAuth secrets
  if (
    id.includes('aws-access-key') ||
    id.includes('github') ||
    id.includes('gitlab') ||
    id.includes('stripe') ||
    id.includes('paypal') ||
    id.includes('openai') ||
    id.includes('anthropic') ||
    id.includes('google') ||
    id.includes('azure') ||
    id.includes('oauth') ||
    id.includes('client-secret') ||
    id.includes('api-key') && !id.includes('generic')
  ) {
    return 'high';
  }
  
  // Medium: Service tokens, less critical keys
  if (
    id.includes('token') ||
    id.includes('bearer') ||
    id.includes('jwt') ||
    id.includes('session') ||
    id.includes('cookie')
  ) {
    return 'medium';
  }
  
  // Low: Generic patterns
  return 'low';
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

    // Skip build output folders and common false positive files
    const excludePatterns = [
      /^(?:dist|build|\.next|\.nuxt|out|\.cache|\.vite|\.turbo|node_modules)\//,
      /\.(?:min|bundle|chunk)\.(js|css)$/,
      /\.map$/,
      /^public\/assets\//,
      // Lock files
      /(?:^|\/)(?:package-lock\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb)$/,
      // Log files
      /\.log$/i,
      // Binary and media files
      /\.(?:jpg|jpeg|png|gif|bmp|ico|webp|svg|tiff|psd)$/i,
      /\.(?:mp3|mp4|wav|flac|avi|mov|wmv|flv|webm|ogg)$/i,
      /\.(?:zip|rar|tar|gz|7z|bz2|dmg|iso)$/i,
      /\.(?:exe|dll|so|dylib|bin|dat)$/i,
      /\.(?:woff|woff2|ttf|eot|otf)$/i,
      /\.(?:pdf|doc|docx|xls|xlsx|ppt|pptx)$/i,
    ];

    if (excludePatterns.some(pattern => pattern.test(file.name))) {
      continue;
    }

    // Binary file detection using null byte check
    if (file.content.includes('\0')) {
      continue;
    }

    // Context-aware filtering: Skip test and example files
    if (isTestOrExampleFile(file.name)) {
      continue;
    }

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

            if (matchIsAllowed) {
              continue;
            }

            // Enhanced allowlist: Check common false positive patterns
            const isEnhancedAllowlisted = enhancedAllowlistPatterns.some(pattern => 
              pattern.test(matchedText.trim())
            );

            if (isEnhancedAllowlisted) {
              continue;
            }

            // Entropy check: If rule has entropy threshold, calculate and verify
            if (rule.entropy !== undefined) {
              const entropy = calculateEntropy(matchedText);
              if (entropy < rule.entropy) {
                continue; // Skip low-entropy matches
              }
            }

            // Context-aware: For generic rules, require secret-related variable names
            if (rule.id.includes('generic')) {
              if (!hasSecretVariableName(line)) {
                continue; // Skip generic matches without proper context
              }
            }

            lineMatches.push({
              ruleId: rule.id,
              description: rule.description,
              filename: file.name,
              lineNumber: lineNum + 1,
              snippet: matchedText,
              line: line.trim(),
              severity: getSeverityLevel(rule.id),
            });
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
