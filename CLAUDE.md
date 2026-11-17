# Looksmith: notes for Claude

Looksmith is a Claude desktop theme plugin, published as a marketplace at `cuongphamthe185/looksmith` (the repo root holds `.claude-plugin/marketplace.json`, whose plugin source is `./`).

## Release rule: always bump the version

How users get updates (Claude Code plugin docs):
- Install and update take the latest commit on `main`. Git tags play no part in that choice.
- The installed version is the `"version"` in `.claude-plugin/plugin.json`. `claude plugin update looksmith` downloads a new copy only when that number differs from the installed one.
- **If code changes are pushed without bumping `version`, users never receive them.**

So for every change that users install (anything under `hooks/`, `themes/`, or `.claude-plugin/`):
1. Bump `version` in `.claude-plugin/plugin.json` (semver: patch for fixes, minor for features).
2. Commit as `Looksmith X.Y.Z: <what changed>`.
3. Tag that commit `vX.Y.Z` and push the branch and the tag: `git push origin main vX.Y.Z`.
4. Check that `main` on GitHub shows the new version, then run `claude plugin marketplace update looksmith` and `claude plugin update looksmith` on this machine, and confirm `claude plugin list` shows it.

README-only changes may skip the bump.

`main` is the release branch: push only working code.

## Commits

Commits carry only the owner's identity: `cuongphamthe185 <cuongphamthe185@users.noreply.github.com>`. Add no `Co-Authored-By` lines.
