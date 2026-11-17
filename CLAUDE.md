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

Changes to READMEs or screenshots alone may skip the bump.

## Themes in the README

A theme keeps its own files in `themes/<id>/`: the scenes, plus a `screenshot-<light|dark>.webp` of Claude desktop wearing it.

A new theme gets a row in the theme table of both READMEs (`README.md`, `README_EN.md`). The row shows its light and dark scenes, using the animated ones when it has motion.

Once there are more than about five themes, move the table to `themes/README.md`. GitHub shows that file when someone opens the `themes/` folder. The READMEs then keep one demo screenshot and a link to it.

`main` is the release branch: push only working code.

## Local skills

`.claude/skills/` (git-ignored, this machine only) holds what was learned building Looksmith:
- `looksmith-add-theme`: scene, motion, palette and glass rules for a new or changed theme.
- `looksmith-release`: version, tag, push, update, clean-install check, install and uninstall facts.
- `looksmith-troubleshoot`: every bug met so far with its cause, check and fix.

Read the matching one before changing a theme, releasing, or answering a reported problem.

## Working rules

- Never change OS settings (Animation effects, Transparency effects, Performance Options). Read them and tell the owner what to switch.
- Never write the owner's saved choice (`~/.claude/plugins/store/looksmith_looksmith-*.json`) or send `/themes` to test without asking first. If a test changes it, restore it at once and say so.
- Try install, update and uninstall in a throwaway `CLAUDE_CONFIG_DIR` in the scratchpad, never on the owner's own setup.
- The theme is per session and the desktop runs only about 6 session engines at once: check a fix in more than one session, including one that starts with the theme Off.
- Whenever what the bar shows may change, call `$.ui.invalidate('ui.render')`: `ui.render` answers are cached.
- `$.theme.clear()` wipes any plugin's theme: call it only for the owner's own pick of Off, never at session start.
- Keep the READMEs (Vietnamese `README.md`, English `README_EN.md`) in step with behaviour, short, and in both languages.
- Ask before every push or other publishing step. Before committing, scan the diff for keys, tokens and the owner's real email, and check screenshots for private details.

## Commits

Commits carry only the owner's identity: `cuongphamthe185 <cuongphamthe185@users.noreply.github.com>`. Add no `Co-Authored-By` lines.
