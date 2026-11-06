# MIGRATE mode: move existing UI onto the design system

Goal: the screen keeps its behaviour and content, but every UI primitive, icon, colour and spacing
value comes from the DS. Mapping is mechanical where a DS equivalent exists and explicit where it doesn't.

## Rules

- **Behaviour is preserved.** Same data, handlers, routes, validation and features. A migration
  is not a redesign: don't add confirmations, fields or flows that weren't there. Fix only what the DS
  forces, plus the visual rules (tokens, one primary action, DS feedback components).
- **Copy:** keep the wording. Allowed edits are typographic only: sentence case, drop `!` and emoji.
  Never change meaning. DS components may add standard behaviour (Escape/close button on dialogs,
  toast auto-dismiss, locale date format): that's expected; list it under "Behaviour differences".
- **Map to real capabilities only.** Use a DS component, prop or variant only if it exists in the
  API docs (https://design.blotout.io/api.md). Never invent one to match the old API. If the old UI has
  a feature the DS lacks, follow "No equivalent" below.
- **Typecheck after each screen or batch of ~10 files**, not only at the end (bisect a failing batch). Then fix the ⚠️ "compiles but broken" cases in
  [gotchas.md](gotchas.md) by eye, because typecheck won't catch them.
- **Remove what's replaced.** Delete local copies (`components/ui/*`, wrappers) once nothing imports
  them. Don't uninstall packages: list the now-unused ones in the report.

## Steps

1. **Preflight.** Setup check from SKILL.md. React 18, Tailwind v3 or no Tailwind → stop and report (no edits).
   Remove leftover shadcn token blocks from `globals.css` as part of setup.
2. **Inventory.** List every file in scope that imports a UI kit or hand-rolls UI:
   ```sh
   node <skill-dir>/scripts/check-ds-usage.mjs <scope>
   ```
   (No Node? Use the greps in [verification.md](verification.md).) Keep the worklist in your own task
   list or notes, never as a file in the repo: one line per file, `[ ]` status. Update it as you go.
3. **Map** each file's UI with the table for its source, before editing:
   - shadcn/ui or Radix → [migrate-shadcn.md](migrate-shadcn.md)
   - MUI → [migrate-mui.md](migrate-mui.md)
   - Ant Design → [migrate-antd.md](migrate-antd.md)
   - Hand-written Tailwind, Claude-generated UI, raw HTML, styled-components/emotion/CSS modules,
     Chakra/Headless UI/Bootstrap → [migrate-custom.md](migrate-custom.md)

   Mark each element `direct`, `compose` or `no equivalent`.

4. **Migrate the file:**
   - Imports → `@blotoutio/design-system` (icons too).
   - Props rewritten per the table and [gotchas.md](gotchas.md).
   - Colours, spacing, radius, type → tokens by meaning ([tokens.md](tokens.md)): grey label →
     `text-muted-foreground`, red error → `FieldError`/`text-destructive-text`, light panel → `bg-muted`,
     bordered box → `Card`, coloured notice → `Alert`.
   - Drop `className` overrides that restyle DS components; keep layout classes.
   - Typecheck. Tick the file in the worklist.
5. **Clean up** replaced local components. Run the scanner on the scope again: zero unexplained hits.
6. **Verify** ([verification.md](verification.md)) and check behaviour is the same: same actions,
   same validation messages, same flows. Light and dark.
7. **Report** (below).

## No equivalent

In order, without asking:

1. Compose it from DS parts and tokens (most gaps: empty states, plan pickers, stat tiles).
2. Otherwise keep the old element, restyle it with tokens only, and mark it
   `// TODO(design-system): no DS equivalent for <thing>`.
3. Never drop a feature to make the migration fit.

Ask the developer only in interactive runs, and only when 1 and 2 would visibly change behaviour.

## Unattended / batch runs

When asked to migrate without supervision ("migrate the whole app", CI, a batch job):

- Never stop to ask. Use the defaults above: mode → MIGRATE; no equivalent → compose, else keep + TODO;
  unused dependencies → leave installed and list.
- Preflight failures (React 18, Tailwind v3 or none, no `package.json`) end the run before any edit, with
  the report explaining why.
- Per file: keep a copy of the file before editing (in memory or your scratch space, never as a file
  in the repo); migrate → typecheck (per batch) → fix (up to 3 tries). Still failing? Restore the file
  from your pre-edit copy, mark it failed in your worklist with the error, move on.
- Build once at the end.

## Report

Print it in your final message, not as a file:

```md
## Design system migration: <scope>

| File                  | Old          | New                     | Status        |
| --------------------- | ------------ | ----------------------- | ------------- |
| src/pages/Billing.tsx | custom modal | AlertDialog             | direct        |
| src/pages/Billing.tsx | plan cards   | RadioGroup + RadioCard  | compose       |
| src/pages/Billing.tsx | usage gauge  | kept, tokens only, TODO | no equivalent |

Removed: src/components/ui/button.tsx, …
Now unused packages (not uninstalled): @radix-ui/react-dialog, sonner, …
Typecheck: pass · Build: pass · Scanner: 0 findings (2 ds-allow, listed below)
Behaviour differences: Escape closes dialogs (new), toast auto-dismisses (new), …
Design-system candidates: …
```
