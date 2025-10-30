# 🚀 GitHub Repository Setup Guide

This guide covers the manual steps needed to polish your GitHub repository for launch.

## 📋 Manual Setup Checklist

### 1. Repository Topics/Tags

Go to your repository settings and add these topics:

```
security
scanner
secrets
gitleaks
api-keys
credentials
react
typescript
web-security
secret-detection
client-side
browser-based
```

**How to add:**
1. Go to your repository on GitHub
2. Click the ⚙️ icon next to "About" (top right of repo page)
3. Add topics in the "Topics" field
4. Click "Save changes"

---

### 2. Repository Description

Set this as your repository description:

```
🔐 Browser-based secret scanner that runs 100% locally. Detect hardcoded API keys, tokens, and credentials without sending data anywhere.
```

**How to add:**
1. Go to your repository on GitHub
2. Click the ⚙️ icon next to "About"
3. Paste description in "Description" field
4. Check "Use topics"
5. Add website: `https://vibeleaks.dev`
6. Click "Save changes"

---

### 3. Social Preview Image

Use the screenshot captured at `public/public/hero-pattern.png` or create a custom 1280x640px image.

**How to add:**
1. Go to repository Settings
2. Scroll to "Social preview" section
3. Click "Edit"
4. Upload image (1280x640px recommended)
5. Click "Save"

**Recommended Image Content:**
- Project logo
- Tagline: "Sniff Out Secrets. Locally. Fast."
- Key feature: "100% Private • Client-Side • Open Source"
- Screenshot of scanner in action

---

### 4. Enable GitHub Discussions

**How to enable:**
1. Go to repository Settings
2. Scroll to "Features" section
3. Check the "Discussions" checkbox
4. Click on "Set up discussions"
5. GitHub will create a welcome discussion

**Recommended Categories:**
- 💬 **General** - General discussions
- 💡 **Ideas** - Share ideas for new features
- 🙏 **Q&A** - Ask the community for help
- 📣 **Announcements** - Updates from maintainers
- 🎉 **Show and tell** - Share what you've built

---

### 5. Repository Settings Recommendations

**General Settings:**
- ✅ Enable "Automatically delete head branches" (keeps repo clean)
- ✅ Enable "Always suggest updating pull request branches"

**Security:**
- ✅ Enable "Private vulnerability reporting"
- ✅ Enable Dependabot alerts
- ✅ Enable Dependabot security updates

**Branch Protection (optional but recommended):**
1. Go to Settings → Branches
2. Add branch protection rule for `main`:
   - ✅ Require pull request before merging
   - ✅ Require status checks to pass (if you add CI/CD)
   - ✅ Require conversation resolution before merging

---

## 🎨 Social Preview Image Template

### Option 1: Use Existing Hero Pattern
The current hero pattern at `public/public/hero-pattern.png` can be repurposed.

### Option 2: Create Custom Image
Use Canva, Figma, or similar tools with these specs:

**Dimensions:** 1280x640px

**Content:**
```
┌─────────────────────────────────────────────────┐
│                                                 │
│     [VibeLeaks Logo]                            │
│                                                 │
│     🔐 Sniff Out Secrets. Locally. Fast.        │
│                                                 │
│     Browser-based secret scanner                │
│     ✓ 100% Private  ✓ 140+ Patterns  ✓ Open    │
│                                                 │
│     [Screenshot of scan results]                │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Design Tips:**
- Use your brand colors (orange/coral accent)
- Show actual scan results in screenshot
- Include GitHub stars count (after launch)
- Keep text large and readable

---

## 📸 Launch Assets Created

### ✅ Screenshot Captured
- Location: Available in chat (homepage hero section)
- Shows: Clean landing page with "Select Project" CTA
- **Next:** Take screenshot of scanner in action with results

### 📊 Architecture Diagram
See `ARCHITECTURE.md` for technical architecture diagram

---

## 🎯 Pre-Launch Checklist

Before announcing your project:

- [ ] All issue templates are working (.github/ISSUE_TEMPLATE/)
- [ ] README.md is comprehensive and clear
- [ ] CONTRIBUTING.md explains how to contribute
- [ ] CODE_OF_CONDUCT.md is present
- [ ] LICENSE file is included (MIT)
- [ ] Topics/tags are added to repository
- [ ] Repository description is compelling
- [ ] Social preview image is set
- [ ] GitHub Discussions are enabled
- [ ] Security features are enabled (Dependabot, vulnerability reporting)
- [ ] At least 1-2 demo screenshots in README
- [ ] Repository is public (if not already)

---

## 🚀 After Setup

Once completed, you're ready for Phase 3: Announce! 🎉

Your repository will be:
- ✅ Discoverable via topics
- ✅ Professional looking with social preview
- ✅ Ready for community contributions
- ✅ Secure with vulnerability reporting
- ✅ Organized with issue templates

**Need help?** Check [CONTRIBUTING.md](CONTRIBUTING.md) for more details.
