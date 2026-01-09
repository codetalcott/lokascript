# Repository Protection Quick Start

This is a quick reference guide for the repository protection ruleset. For complete documentation, see [REPOSITORY_RULESET.md](./REPOSITORY_RULESET.md).

## 🎯 What's Protected?

The `main` branch is protected with:
- ✅ Required code reviews (1 approval + code owner review)
- ✅ Required CI checks (build, test, lint, typecheck)
- ✅ No force pushes or deletions
- ✅ Linear history only
- ✅ Signed commits required

## 🚀 Quick Setup for Contributors

### 1. Setup Commit Signing

```bash
# Generate GPG key
gpg --full-generate-key

# Get your key ID
gpg --list-secret-keys --keyid-format=long

# Configure Git
git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true

# Export and add to GitHub
gpg --armor --export YOUR_KEY_ID
# Copy output and add at: GitHub Settings → SSH and GPG keys → New GPG key
```

### 2. Workflow

```bash
# 1. Create feature branch
git checkout -b feature/your-feature

# 2. Make changes and commit (auto-signed)
git add .
git commit -m "Your change description"

# 3. Push and create PR
git push origin feature/your-feature

# 4. Wait for CI checks to pass
# 5. Get required approvals
# 6. Merge when ready
```

## 🛠️ For Maintainers: Enable Ruleset

### Option 1: GitHub UI (Easiest)

1. Go to **Settings** → **Rules** → **Rulesets**
2. Click **New ruleset** → **New branch ruleset**
3. Use the configuration from `.github/rulesets/branch-protection.json`
4. Set to **Active**

### Option 2: GitHub CLI

```bash
# Install if needed: https://cli.github.com/

# Get repo ID
REPO_ID=$(gh api repos/codetalcott/hyperfixi --jq .id)

# Import ruleset
gh api -X POST \
  -H "Accept: application/vnd.github+json" \
  /repos/codetalcott/hyperfixi/rulesets \
  --input .github/rulesets/branch-protection.json
```

## 📋 Pre-merge Checklist

Before merging a PR, ensure:
- [ ] All CI checks pass (green checkmarks)
- [ ] At least 1 approving review
- [ ] Code owner approval (if applicable)
- [ ] All review comments resolved
- [ ] Branch is up to date with main
- [ ] Commits are signed

## 🚨 Common Issues

**Can't merge?**
- Rebase on main: `git rebase origin/main`
- Resolve all review threads
- Wait for CI to complete

**CI failing?**
- Run locally: `npm run lint && npm run typecheck && npm run build && npm test`
- Check Actions tab for detailed logs

**Commit not signed?**
- Enable signing: `git config commit.gpgsign true`
- Re-sign last commit: `git commit --amend --no-edit -S`

## 📚 Full Documentation

- **Detailed Guide**: [docs/REPOSITORY_RULESET.md](./REPOSITORY_RULESET.md)
- **Security Policy**: [SECURITY.md](../SECURITY.md)
- **Code Owners**: [.github/CODEOWNERS](../.github/CODEOWNERS)
- **Ruleset Config**: [.github/rulesets/](../.github/rulesets/)

## 💡 Tips

- Use `npm run lint:fix` to auto-fix linting issues
- Run `npm run typecheck` to catch type errors early
- Test locally before pushing to save CI time
- Keep commits small and focused
- Write descriptive commit messages

---

**Need help?** Check the full documentation or open an issue!
