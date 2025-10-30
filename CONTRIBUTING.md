# Contributing to VibeLeaks

First off, thank you for considering contributing to VibeLeaks! 🎉

It's people like you that make VibeLeaks such a great tool for the security community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Adding Detection Rules](#adding-detection-rules)
  - [Code Contributions](#code-contributions)
- [Development Setup](#development-setup)
- [Code Style Guidelines](#code-style-guidelines)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the maintainers.

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details**:
  - Browser & version
  - Operating system
  - VibeLeaks version/commit

**Example Bug Report:**

```markdown
**Title:** Scanner crashes on files larger than 10MB

**Description:**
When uploading a file larger than 10MB, the scanner worker crashes without error message.

**Steps to Reproduce:**
1. Go to vibeleaks.dev
2. Upload a 15MB JavaScript file
3. Click "Scan for Secrets"
4. Observe crash

**Expected Behavior:**
File should be scanned or show file size limit warning.

**Actual Behavior:**
Worker crashes silently, no results shown.

**Environment:**
- Browser: Chrome 120.0.6099.109
- OS: macOS 14.1
- Version: main branch (commit abc123)
```

### Suggesting Features

Feature suggestions are welcome! Before suggesting:

1. **Check existing feature requests** to avoid duplicates
2. **Provide clear use case** - explain the problem you're trying to solve
3. **Describe the solution** you'd like to see
4. **Consider alternatives** - have you thought of other approaches?

**Example Feature Request:**

```markdown
**Title:** Add support for SARIF output format

**Problem:**
Many security tools use SARIF format for standardized reporting. VibeLeaks currently only exports JSON, Markdown, and CSV.

**Proposed Solution:**
Add a "Export as SARIF" button that generates SARIF 2.1.0 compliant output.

**Alternatives Considered:**
- Custom JSON mapping (rejected - requires users to write converters)
- XML output (rejected - SARIF is JSON-based)

**Additional Context:**
SARIF is used by GitHub Code Scanning, Azure DevOps, and many other tools.
Reference: https://sarifweb.azurewebsites.net/
```

### Adding Detection Rules

Want to add detection for a new service or improve existing patterns?

1. **Edit** `src/config/gitleaks-rules.json`
2. **Add your rule** following the Gitleaks format:

```json
{
  "id": "my-service-api-key",
  "description": "Detected My Service API Key",
  "regex": "myservice_[a-zA-Z0-9]{32}",
  "keywords": ["myservice_"],
  "secretGroup": 0,
  "entropy": 3.5
}
```

3. **Test your rule** with sample secrets (use fake/test keys only!)
4. **Document** in PR description:
   - What service the rule detects
   - Example patterns (obfuscated)
   - Why the entropy/regex values were chosen

### Code Contributions

Areas we'd love help with:

- 🐛 **Bug fixes** - Check [bug issues](../../issues?q=is%3Aissue+is%3Aopen+label%3Abug)
- ✨ **Features** - See [feature requests](../../issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement)
- 📖 **Documentation** - Improve README, comments, guides
- 🎨 **UI/UX** - Design improvements, accessibility
- ⚡ **Performance** - Optimization, caching, worker efficiency
- 🧪 **Testing** - Add tests, improve coverage

## 💻 Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git
- Modern browser (Chrome, Firefox, Safari, Edge)

### Setup Steps

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/vibeleaks.git
cd vibeleaks

# 3. Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/vibeleaks.git

# 4. Install dependencies
npm install

# 5. Start development server
npm run dev

# 6. Open browser to http://localhost:5173
```

### Project Structure

```
vibeleaks/
├── src/
│   ├── components/       # React components
│   │   ├── homepage/     # Landing page sections
│   │   ├── scanner/      # Scanner interface
│   │   └── ui/           # Reusable UI components
│   ├── config/           # Configuration files
│   │   └── gitleaks-rules.json  # Detection rules
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── types/            # TypeScript type definitions
│   ├── workers/          # Web Worker code
│   └── lib/              # Utility functions
├── public/               # Static assets
└── README.md
```

### Running Tests

```bash
# Run type checking
npm run type-check

# Run linter
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 Code Style Guidelines

### TypeScript

- **Use TypeScript** for all new code
- **Define interfaces** for complex objects
- **Avoid `any`** - use proper typing
- **Use functional components** with hooks

```typescript
// ✅ Good
interface ScanResult {
  file: string;
  matches: Match[];
  severity: 'critical' | 'high' | 'medium' | 'low';
}

const processScan = (result: ScanResult): void => {
  // ...
};

// ❌ Bad
const processScan = (result: any) => {
  // ...
};
```

### React

- **Use functional components** with hooks
- **Keep components small** - single responsibility
- **Extract custom hooks** for reusable logic
- **Use semantic HTML** for accessibility

```tsx
// ✅ Good - Small, focused component
const SeverityBadge = ({ severity }: { severity: string }) => (
  <Badge variant={getSeverityVariant(severity)}>
    {severity.toUpperCase()}
  </Badge>
);

// ❌ Bad - Too much logic in component
const Results = ({ data }: { data: any }) => {
  // 200 lines of complex logic and rendering
};
```

### Styling

- **Use Tailwind CSS** utility classes
- **Follow design system** tokens from `index.css`
- **Use semantic tokens** instead of raw colors

```tsx
// ✅ Good - Uses design system
<div className="bg-background text-foreground border border-border">

// ❌ Bad - Raw colors
<div className="bg-white text-black border border-gray-300">
```

### Naming Conventions

- **Components**: PascalCase (`ScannerInterface.tsx`)
- **Hooks**: camelCase with `use` prefix (`useScanWorker.ts`)
- **Utilities**: camelCase (`parseGitleaksRules.ts`)
- **Types**: PascalCase (`ScanResult`, `MatchSeverity`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)

### Comments

- **Document WHY, not WHAT** - code should be self-explanatory
- **Use JSDoc** for public APIs
- **Add comments** for complex algorithms

```typescript
// ✅ Good - Explains reasoning
// Use worker to avoid blocking UI thread during regex matching on large files
const scanWorker = new Worker('./scanner.worker.ts');

// ❌ Bad - States the obvious
// Create a new worker
const scanWorker = new Worker('./scanner.worker.ts');
```

### Git Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add SARIF export format
fix: resolve worker crash on large files
docs: update installation instructions
style: format code with prettier
refactor: extract file parsing logic
test: add tests for severity filtering
chore: update dependencies
```

## 🔄 Pull Request Process

### Before Submitting

1. ✅ **Test locally** - ensure your changes work
2. ✅ **Check code style** - run `npm run lint`
3. ✅ **Update docs** - if adding features
4. ✅ **Add tests** - if applicable
5. ✅ **Rebase on main** - keep history clean

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## How Has This Been Tested?
Describe testing process and results

## Screenshots (if applicable)
Add screenshots showing before/after

## Checklist
- [ ] My code follows the project's code style
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated documentation
- [ ] My changes generate no new warnings
- [ ] I have tested on multiple browsers
```

### Review Process

1. **Automated checks** must pass (linting, type checking)
2. **Maintainer review** - expect feedback within 48 hours
3. **Address feedback** - make requested changes
4. **Approval** - once approved, we'll merge!

### After Merge

- Your contribution will be in the next release
- You'll be added to contributors list
- Feel free to promote your contribution!

## 💬 Community

- **GitHub Discussions**: Ask questions, share ideas
- **Issues**: Track bugs and feature requests
- **Pull Requests**: Submit contributions

## 🎉 Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

Thank you for making VibeLeaks better! 🚀

---

**Questions?** Open a [discussion](../../discussions) or reach out to maintainers.
