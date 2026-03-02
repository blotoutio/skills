# Installing Blotout Skills for Codex

Enable Blotout skills in Codex via native skill discovery. Just clone and symlink.

## Prerequisites

- Git

## Installation

1. **Clone the skills repository:**
   ```bash
   git clone https://github.com/blotoutio/skills.git ~/.codex/blotout-skills
   ```

2. **Create the skills symlink:**
   ```bash
   mkdir -p ~/.codex/skills
   ln -s ~/.codex/blotout-skills/skills ~/.codex/skills/blotout
   ```

   **Windows (PowerShell):**
   ```powershell
   New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.codex\skills"
   cmd /c mklink /J "$env:USERPROFILE\.codex\skills\blotout" "$env:USERPROFILE\.codex\blotout-skills\skills"
   ```

3. **Restart Codex** (quit and relaunch the CLI) to discover the skills.

## Verify

```bash
ls -la ~/.codex/skills/blotout
```

You should see a symlink (or junction on Windows) pointing to your Blotout skills directory.

## Updating

```bash
cd ~/.codex/blotout-skills && git pull
```

Skills update instantly through the symlink.

## Uninstalling

```bash
rm ~/.codex/skills/blotout
```

Optionally delete the clone: `rm -rf ~/.codex/blotout-skills`
