# Installing Blotout Skills for OpenCode

## Prerequisites

- [OpenCode.ai](https://opencode.ai) installed
- Git

## Installation

1. **Clone the skills repository:**

   ```bash
   git clone https://github.com/blotoutio/skills.git ~/.config/opencode/blotout-skills
   ```

2. **Symlink skills:**

   ```bash
   mkdir -p ~/.config/opencode/skills
   ln -s ~/.config/opencode/blotout-skills/skills ~/.config/opencode/skills/blotout
   ```

3. **Restart OpenCode** to discover the skills.

## Verify

```bash
ls -la ~/.config/opencode/skills/blotout
```

You should see a symlink pointing to your Blotout skills directory.

## Updating

```bash
cd ~/.config/opencode/blotout-skills && git pull
```

Skills update instantly through the symlink.

## Uninstalling

```bash
rm ~/.config/opencode/skills/blotout
```

Optionally delete the clone: `rm -rf ~/.config/opencode/blotout-skills`
