# Verification: before you say done

Run these on the code you created or changed, one command at a time. Report each command and its result.

## 1. Typecheck and build

Use the app's own scripts (`npm run typecheck`, `npm run build`, `nx run <project>:typecheck`, …).
No typecheck script? Use `npx tsc -b` (project references) or `npx tsc --noEmit`.
In big apps, typecheck after each screen or batch of ~10 files (bisect a failing batch by file), and
build once at the end.

Type errors on DS props usually mean a shadcn/Radix habit ([gotchas.md](gotchas.md)) or a component
that isn't in the installed version. Typecheck passing does NOT clear the ⚠️ rows in [gotchas.md](gotchas.md). Go through every ⚠️ row
that applies to the components you used and check your code against it (they compile but render or
behave wrong: menu `onSelect`, `FieldError` without `match`, `FieldGroup` as a stack, `AlertDialogText`,
`NavbarBrand` text, `Select` items, controlled `undefined`, percent units, card `children`, …).

Runtime smoke check for forms: trigger one validation error and confirm the message text renders.

## 2. Design-system scan

```sh
node <skill-dir>/scripts/check-ds-usage.mjs <changed files or folders>
```

`<skill-dir>` is the folder holding this skill's `SKILL.md`. Exit codes: `0` clean, `1` findings,
`2` nothing was scanned (wrong path). Exit 2 is a failure, not a pass.

It reports `error`s (must fix) and `warn`s (fix unless there's a reason):

- imports from other UI kits, headless libs, icon sets and toast libs, and local `components/ui/*`
- `asChild`; `onSelect` on DS menu items
- raw `<button>`, `<input>`, `<select>`, `<textarea>`, `<table>`, `<label>` in JSX
- colour literals (hex, `rgb()`, `oklch()` …) in code and app CSS (leftover token overrides)
- Tailwind palette colours (`bg-blue-500`, `text-gray-600`, `bg-white`), dynamic `bg-${x}-500`
- arbitrary values (`p-[13px]`, `text-[#333]`); layout-only ones like `grid-cols-[1fr_auto]` pass
- inline `style={{ … }}` with colour, spacing or type
- warnings: gradients, `font-bold`/`font-light`, `rounded-2xl`+

A hit you deliberately keep gets a comment on that line or the line above:
`// ds-allow: <reason>` (in JSX: `{/* ds-allow: <reason> */}`). The scanner lists every ds-allow;
copy that list into your report. Zero unexplained errors before you say done.

Hits on lines you didn't change are pre-existing. Don't fix them unless the task covers that code
(stay in scope), and don't add `ds-allow` to them. List them in the report as "pre-existing, not
touched" with file and line, so they count as explained.

No Node available? Fall back to:

```sh
grep -rnE "from ['\"](@/components/ui|@radix-ui|@mui|antd|@chakra-ui|@headlessui|lucide-react|sonner|react-icons|styled-components)" <scope>
grep -rnE "asChild|#[0-9a-fA-F]{6}\b|rgba?\(|oklch\(|-\[[0-9.]+(px|rem)\]|(bg|text|border)-(gray|slate|zinc|red|blue|green|yellow|indigo)-[0-9]+" <scope>
```

## 3. Look at it (only if a dev server is already running or the developer asks)

Don't start a dev server. If one is running, check the page in light and dark
(`document.documentElement.classList.toggle('dark')`), at ~390px wide, and with the keyboard (Tab
through every control; focus is visible; Escape closes overlays). If you didn't check it, say so in
the report instead of claiming it looks right.
