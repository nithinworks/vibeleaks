import type { 
  ScanRule, 
  AllowList, 
  ScanMatch,
  ScanProgressMessage,
  ScanResultMessage
} from '../types/scanner';

// Lazy load rules config only when needed
let rulesConfig: any = null;

async function loadRulesConfig() {
  if (!rulesConfig) {
    const module = await import('../config/vibeleaks-rules.json');
    rulesConfig = module.default;
  }
  return rulesConfig;
}

interface ScanMessage {
  type: 'scan';
  files: { name: string; content: string }[];
}

interface CancelMessage {
  type: 'cancel';
}

// Pre-compiled rule with regex and metadata
interface CompiledRule {
  id: string;
  description: string;
  regex: RegExp | null;
  keywords: Set<string>; // Use Set for O(1) lookup
  entropy?: number;
  isGeneric: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

// Constants for batch processing
const CHUNK_SIZE = 1000; // Process 1000 lines at a time
const YIELD_INTERVAL = 50; // Yield control every 50ms

// Cancellation flag
let isCancelled = false;

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
  
  // Environment variable references (NOT actual secrets)
  /process\.env\.[A-Z_][A-Z0-9_]*/i,
  /import\.meta\.env\.[A-Z_][A-Z0-9_]*/i,
  /Deno\.env\.get\(['"]/i,
  /\$env\.[A-Z_][A-Z0-9_]*/i,
  /\${[A-Z_][A-Z0-9_]*}/,
  /%[A-Z_][A-Z0-9_]*%/,
  /env\.[A-Z_][A-Z0-9_]*/i,
  
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

// Convert Go regex to JavaScript regex and compile
function compileGoRegex(goRegex: string): RegExp | null {
  try {
    let jsRegex = goRegex;
    let flags = '';
    
    // Handle case-insensitive flag (?i) at the start
    if (jsRegex.startsWith('(?i)')) {
      flags += 'i';
      jsRegex = jsRegex.substring(4);
    }
    
    // Remove all inline case modifiers that JS doesn't support
    // (?i) - case insensitive
    // (?-i) - case sensitive
    // (?i:...) - case insensitive group
    // (?-i:...) - case sensitive group
    jsRegex = jsRegex.replace(/\(\?-i:/g, '(?:');
    jsRegex = jsRegex.replace(/\(\?i:/g, '(?:');
    jsRegex = jsRegex.replace(/\(\?i\)/g, '');
    
    // Remove named capture groups (?P<name>...) - convert to regular capture groups
    jsRegex = jsRegex.replace(/\(\?P<[^>]+>/g, '(');
    
    // Remove other unsupported Go regex features
    jsRegex = jsRegex.replace(/\(\?:/g, '(?:'); // Non-capturing groups are supported, just normalize
    
    return new RegExp(jsRegex, flags);
  } catch (error) {
    // Silently skip rules with incompatible regex patterns
    return null;
  }
}

// Lazy-initialized compiled rules
let compiledRules: CompiledRule[] = [];
let compiledAllowlistRegexes: RegExp[] = [];
let compiledAllowlistPaths: RegExp[] = [];
let stopwordsSet: Set<string> = new Set();

// Initialize rules asynchronously
async function initializeRules() {
  if (compiledRules.length > 0) return; // Already initialized
  
  const config = await loadRulesConfig();
  
  compiledRules = (config.rules as ScanRule[]).map((rule: ScanRule) => ({
    id: rule.id,
    description: rule.description,
    regex: rule.regex ? compileGoRegex(rule.regex) : null,
    keywords: new Set((rule.keywords || []).map(k => k.toLowerCase())),
    entropy: rule.entropy,
    isGeneric: rule.id.includes('generic'),
    severity: rule.severity || 'low',
  })).filter(rule => rule.regex !== null);

  compiledAllowlistRegexes = (config.allowlist as AllowList)?.regexes?.map((pattern: string) => {
    try {
      return new RegExp(pattern);
    } catch {
      return null;
    }
  }).filter((r: RegExp | null): r is RegExp => r !== null) || [];

  compiledAllowlistPaths = (config.allowlist as AllowList)?.paths?.map((pattern: string) => {
    try {
      return new RegExp(pattern);
    } catch {
      return null;
    }
  }).filter((r: RegExp | null): r is RegExp => r !== null) || [];

  stopwordsSet = new Set(
    ((config.allowlist as AllowList)?.stopwords || []).map(w => w.toLowerCase())
  );
}


// Utility function to yield control to prevent UI freeze
async function yieldControl(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

self.onmessage = async (e: MessageEvent<ScanMessage | CancelMessage>) => {
  // Handle cancellation
  if (e.data.type === 'cancel') {
    isCancelled = true;
    return;
  }

  try {
    // Initialize rules on first scan
    await initializeRules();

    // Reset cancellation flag
    isCancelled = false;
    
    const { files } = e.data;
    const startTime = performance.now();
    const matches: ScanMatch[] = [];
    let totalLines = 0;
    let lastYieldTime = performance.now();
    let filesProcessed = 0;

    for (let i = 0; i < files.length; i++) {
      // Check for cancellation
      if (isCancelled) {
        self.postMessage({
          type: 'result',
          matches: [],
          filesScanned: 0,
          totalLines: 0,
          duration: performance.now() - startTime,
        } as ScanResultMessage);
        return;
      }
      const file = files[i];
    
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
      // Send progress update for skipped files too
      self.postMessage({
        type: 'progress',
        current: i + 1,
        total: files.length,
        filename: file.name,
      } as ScanProgressMessage);
      continue;
    }

    // Binary file detection using null byte check
    if (file.content.includes('\0')) {
      self.postMessage({
        type: 'progress',
        current: i + 1,
        total: files.length,
        filename: file.name,
      } as ScanProgressMessage);
      continue;
    }

    // Context-aware filtering: Skip test and example files
    if (isTestOrExampleFile(file.name)) {
      self.postMessage({
        type: 'progress',
        current: i + 1,
        total: files.length,
        filename: file.name,
      } as ScanProgressMessage);
      continue;
    }

    // Check if file path matches pre-compiled allowlist paths
    if (compiledAllowlistPaths.some(regex => regex.test(file.name))) {
      self.postMessage({
        type: 'progress',
        current: i + 1,
        total: files.length,
        filename: file.name,
      } as ScanProgressMessage);
      continue;
    }

    // Send progress update for files being processed
    filesProcessed++;
    self.postMessage({
      type: 'progress',
      current: i + 1,
      total: files.length,
      filename: file.name,
    } as ScanProgressMessage);

    const lines = file.content.split('\n');
    totalLines += lines.length;

    // Process lines in chunks for large files
    const totalChunks = Math.ceil(lines.length / CHUNK_SIZE);
    
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      // Check for cancellation
      if (isCancelled) {
        return;
      }

      const startLine = chunkIndex * CHUNK_SIZE;
      const endLine = Math.min(startLine + CHUNK_SIZE, lines.length);
      
      // Send more granular progress updates
      self.postMessage({
        type: 'progress',
        current: i + (chunkIndex / totalChunks),
        total: files.length,
        filename: `${file.name} (${Math.round((chunkIndex / totalChunks) * 100)}%)`,
      } as ScanProgressMessage);

      for (let lineNum = startLine; lineNum < endLine; lineNum++) {
      const line = lines[lineNum];

      // Skip empty or very short lines
      if (line.trim().length < 3) {
        continue;
      }

      // Check if entire line matches any pre-compiled allowlist pattern
      if (compiledAllowlistRegexes.some(regex => regex.test(line))) {
        continue;
      }

      // Check each pre-compiled rule and collect all matches for this line
      const lineMatches: ScanMatch[] = [];
      const lineLower = line.toLowerCase(); // Cache lowercase version
      
      for (const rule of compiledRules) {
        try {
          // Fast keyword check using cached Set (O(1) lookup)
          if (rule.keywords.size > 0) {
            let hasKeyword = false;
            for (const keyword of rule.keywords) {
              if (lineLower.includes(keyword)) {
                hasKeyword = true;
                break;
              }
            }
            if (!hasKeyword) {
              continue;
            }
          }

          // Use pre-compiled regex
          const match = rule.regex!.exec(line);

          if (match) {
            const matchedText = match[1] || match[0];
            const matchedLower = matchedText.toLowerCase();
            
            // Fast stopword check using cached Set
            let isStopword = false;
            for (const word of stopwordsSet) {
              if (matchedLower.includes(word)) {
                isStopword = true;
                break;
              }
            }
            if (isStopword) {
              continue;
            }

            // Check if matched text matches pre-compiled allowlist patterns
            if (compiledAllowlistRegexes.some(regex => regex.test(matchedText))) {
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
            // Improved entropy thresholds for better accuracy
            if (rule.entropy !== undefined) {
              const entropy = calculateEntropy(matchedText);
              // Use stricter entropy thresholds for generic rules
              const entropyThreshold = rule.isGeneric ? rule.entropy + 0.5 : rule.entropy;
              if (entropy < entropyThreshold) {
                continue; // Skip low-entropy matches
              }
            }

            // Context-aware: For generic rules, require secret-related variable names
            if (rule.isGeneric && !hasSecretVariableName(line)) {
              continue; // Skip generic matches without proper context
            }

            lineMatches.push({
              ruleId: rule.id,
              description: rule.description,
              filename: file.name,
              lineNumber: lineNum + 1,
              snippet: matchedText,
              line: line.trim(),
              severity: rule.severity,
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

      // Yield control between chunks to prevent UI freeze
      const now = performance.now();
      if (now - lastYieldTime > YIELD_INTERVAL) {
        await yieldControl();
        lastYieldTime = now;
      }
      
      // Memory optimization: Clear chunk data
      // @ts-ignore - Force garbage collection hint
      if (typeof gc !== 'undefined') {
        gc();
      }
    }

      // Clear file content from memory after processing
      file.content = '';
    }

    const duration = performance.now() - startTime;

    // Send final result
    self.postMessage({
      type: 'result',
      matches,
      filesScanned: filesProcessed,
      totalLines,
      duration,
    } as ScanResultMessage);
  } catch (error) {
    // Handle any unexpected errors
    console.error('Scanner worker error:', error);
    self.postMessage({
      type: 'result',
      matches: [],
      filesScanned: 0,
      totalLines: 0,
      duration: 0,
    } as ScanResultMessage);
  }
};

export {};
