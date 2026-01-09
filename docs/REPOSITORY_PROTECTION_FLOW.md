# Repository Protection Flow

This document visualizes how the repository protection system works.

## Pull Request Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Developer Workflow                         │
└─────────────────────────────────────────────────────────────┘

1. Create Feature Branch
   ↓
   git checkout -b feature/my-feature

2. Make Changes & Commit (Signed)
   ↓
   git commit -S -m "Add feature"
   
3. Push to GitHub
   ↓
   git push origin feature/my-feature

4. Create Pull Request
   ↓
   Opens PR targeting main branch

┌─────────────────────────────────────────────────────────────┐
│                   Automated Checks (CI)                       │
└─────────────────────────────────────────────────────────────┘

   ┌──────────┐
   │   Lint   │ → ESLint code quality checks
   └──────────┘
        │
   ┌──────────┐
   │Typecheck │ → TypeScript validation
   └──────────┘
        │
   ┌──────────┐
   │  Build   │ → Compile all packages
   └──────────┘
        │
   ┌──────────┐
   │   Test   │ → Run test suites
   └──────────┘
        │
   ┌──────────┐
   │ Int Test │ → Integration tests
   └──────────┘
        │
        ↓
   All checks pass? ✅

┌─────────────────────────────────────────────────────────────┐
│                    Code Review Process                        │
└─────────────────────────────────────────────────────────────┘

   ┌──────────────────────────┐
   │ CODEOWNERS Check         │
   │ - Core packages?         │
   │ - Config files?          │
   │ - GitHub workflows?      │
   └──────────────────────────┘
              │
              ↓
   ┌──────────────────────────┐
   │ Request Reviewers        │
   │ - Auto-assign owners     │
   │ - Request 1+ approval    │
   └──────────────────────────┘
              │
              ↓
   ┌──────────────────────────┐
   │ Review & Discussion      │
   │ - Code review comments   │
   │ - Address feedback       │
   │ - Resolve threads        │
   └──────────────────────────┘
              │
              ↓
   ┌──────────────────────────┐
   │ Approval Received ✅     │
   │ - 1+ approving review    │
   │ - Code owner approved    │
   │ - All threads resolved   │
   └──────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Branch Protection Rules                    │
└─────────────────────────────────────────────────────────────┘

   Pre-merge Validation:
   
   ├─ ✅ All CI checks passed
   ├─ ✅ 1+ approving review
   ├─ ✅ Code owner approval (if applicable)
   ├─ ✅ All review threads resolved
   ├─ ✅ Branch up to date with main
   ├─ ✅ Commits are signed (GPG/S/MIME)
   └─ ✅ Linear history maintained
   
   If all pass → Merge enabled 🎉

┌─────────────────────────────────────────────────────────────┐
│                         Merge                                 │
└─────────────────────────────────────────────────────────────┘

   Merge Strategy: Rebase & Fast-forward
   
   feature/my-feature ──→ main
   
   Protected from:
   ❌ Force pushes
   ❌ Branch deletion
   ❌ Unsigned commits
   ❌ Non-linear history
```

## Protection Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     Protection Layers                         │
└─────────────────────────────────────────────────────────────┘

Layer 1: Local Development
├─ Husky pre-commit hooks
└─ Local linting/testing

Layer 2: GitHub Actions (CI/CD)
├─ Automated lint checks
├─ TypeScript validation
├─ Build verification
├─ Test suite execution
└─ Integration testing

Layer 3: Code Review
├─ Human review required
├─ Code owner approval
├─ Thread resolution
└─ Knowledge sharing

Layer 4: Branch Protection
├─ Status check enforcement
├─ Review requirements
├─ History protection
└─ Signature verification

Layer 5: Repository Settings
├─ CODEOWNERS enforcement
├─ Ruleset configuration
└─ Access controls
```

## CI/CD Pipeline Details

```
┌─────────────────────────────────────────────────────────────┐
│                  CI/CD Pipeline Architecture                  │
└─────────────────────────────────────────────────────────────┘

Trigger: Push to PR or main branch
         ↓
    ┌─────────┐
    │ Checkout│ → Clone repository
    └─────────┘
         ↓
    ┌─────────┐
    │Setup Node│ → Node.js 20 + npm cache
    └─────────┘
         ↓
    ┌─────────┐
    │npm ci   │ → Install dependencies (clean)
    └─────────┘
         ↓
    ┌─────────────────────────────────────┐
    │         Parallel Jobs               │
    ├─────────────┬──────────┬───────────┤
    │    Lint     │Typecheck │   Build   │
    └─────────────┴──────────┴───────────┘
              ↓
    ┌─────────────────────────────────────┐
    │        Sequential Jobs              │
    ├─────────────┬──────────────────────┤
    │    Test     │  Integration Test    │
    └─────────────┴──────────────────────┘
              ↓
    ┌─────────────┐
    │ CI Success  │ → All jobs passed ✅
    └─────────────┘

Concurrency: Same PR → Cancel old runs
Timeout: 20 minutes max per job
Artifacts: Build output + coverage reports
```

## Status Check Flow

```
┌─────────────────────────────────────────────────────────────┐
│              Required Status Checks on Main                   │
└─────────────────────────────────────────────────────────────┘

Pull Request Created
      ↓
┌──────────────┐
│ Status: ⏳   │ → Checks pending
└──────────────┘
      ↓
┌──────────────────────────────────────┐
│ CI Jobs Running                      │
├──────────────────────────────────────┤
│ ✅ lint                              │
│ ✅ typecheck                         │
│ ✅ build                             │
│ ⏳ test (running...)                 │
│ ⏳ test-integration (waiting...)     │
└──────────────────────────────────────┘
      ↓
All Pass?
   ↓        ↓
  Yes       No
   ↓        ↓
┌──────┐  ┌──────┐
│ ✅   │  │ ❌   │
│Merge │  │Block │
│Ready │  │Merge │
└──────┘  └──────┘
```

## Code Ownership Example

```
┌─────────────────────────────────────────────────────────────┐
│                   CODEOWNERS in Action                        │
└─────────────────────────────────────────────────────────────┘

PR modifies: packages/core/src/parser/tokenizer.ts
             .github/workflows/ci.yml
             README.md

CODEOWNERS matching rules:
├─ packages/core/ → @codetalcott
├─ .github/workflows/ → @codetalcott
└─ README.md → @codetalcott

Auto-requested reviewers:
└─ @codetalcott (owns all modified files)

Review requirement:
├─ 1+ approving review from any contributor
└─ 1+ approval from @codetalcott (code owner)

Both must be satisfied to merge ✅
```

## Security Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Workflow                          │
└─────────────────────────────────────────────────────────────┘

Development:
├─ Developer commits with GPG signature
├─ Pre-commit hooks run locally
└─ Push to GitHub

GitHub Validation:
├─ Verify commit signatures
├─ Run security-aware CI checks
└─ Code owner review (security-critical paths)

Vulnerability Reporting:
├─ Private security advisory
├─ Assessment within 48 hours
└─ Fix within 30 days (critical)

Dependency Management:
├─ package-lock.json enforcement
├─ Regular npm audit checks
└─ Review dependency updates
```

## Quick Reference

### ✅ Good Practices
- Create descriptive feature branches
- Sign all commits with GPG
- Write clear commit messages
- Run tests locally before pushing
- Keep PRs focused and small
- Respond to review feedback promptly

### ❌ Blocked Actions
- Direct push to main
- Force push to protected branches
- Delete protected branches
- Merge without approvals
- Merge with failing CI
- Unsigned commits to main

### 🔄 Typical Timeline
1. Create PR: Immediate
2. CI checks: 5-10 minutes
3. Code review: Hours to days
4. Address feedback: Hours to days
5. Final approval: Minutes
6. Merge: Immediate

---

For more details, see:
- [Complete Documentation](./REPOSITORY_RULESET.md)
- [Quick Start Guide](./REPOSITORY_RULESET_QUICKSTART.md)
- [Security Policy](../SECURITY.md)
