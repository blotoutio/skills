---
name: design-system
description: |
  Build, design and migrate UI in Blotout apps with the Blotout design system
  (@blotoutio/design-system: React 19, Tailwind v4, Base UI; Storybook design.blotout.io). Modes:
  BUILD pages, screens and components from DS components and tokens; DESIGN or review screens and
  flows; MIGRATE shadcn/ui, Radix, MUI, Ant Design, styled-components or hand-rolled Tailwind onto
  the DS.

  Use it for ANY UI work in a project whose package.json depends on @blotoutio/design-system, even
  when the request never mentions the design system: components, pages, layouts, navigation, forms,
  tables, dialogs, toasts, dashboards, loading/empty/error states, styling, Tailwind classes,
  colours, spacing, icons, dark mode, responsive fixes, UI bugs and UI reviews. Also use it when the
  developer names it ("Blotout design system", "design.blotout.io", "Qinto design system", "make it
  look like Blotout", "adopt the design system"). Skip it in apps that don't depend on the DS.
---

# Blotout Design System

`@blotoutio/design-system` is Blotout's shared React UI library. Every Blotout app builds its UI from
it so all products look and behave the same. Storybook: https://design.blotout.io

## 0. Is this the right skill?

Check `package.json`. If `@blotoutio/design-system` is a dependency, this skill applies to every piece
of UI work in the app, however small (one component, one style tweak, one bug fix): follow it. If it
isn't a dependency and the developer didn't ask to adopt it, this skill doesn't apply: do the task
without it. If they asked to adopt it, start with [references/setup.md](references/setup.md).

## 1. Pick the mode

Choose ONE mode from the request, read that reference and follow it end to end.

| The developer wants to...                                                                                                                 | Mode                                              | Read                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------ |
| Create a new page, screen, view, form, dashboard, or reusable composite component                                                         | BUILD                                             | [references/build.md](references/build.md)                         |
| Change, extend, restyle or fix UI that already uses the DS ("add a column", "add a filter", "fix the spacing", "this button looks wrong") | BUILD, steps 4–8 only, scoped to the touched code | [references/build.md](references/build.md)                         |
| Decide how something should look or behave, plan a flow or layout, review a screen, "which badge for X?"                                  | DESIGN                                            | [references/design-philosophy.md](references/design-philosophy.md) |
| Convert existing UI that doesn't use the DS (any library, or hand-written), "make this page look like Blotout", "replace shadcn"          | MIGRATE                                           | [references/migrate.md](references/migrate.md)                     |

Tie-breakers:

- New page or flow that needs layout decisions: DESIGN (short plan), then BUILD, without stopping in
  between unless the brief is genuinely ambiguous.
- Existing screen not on the DS: MIGRATE, even if the words are "restyle" or "clean up".
- Advice or review only, no code asked for: DESIGN, report only, don't edit files. This wins over the
  MIGRATE rule above: reviewing a non-DS screen without code changes is DESIGN.
- Still unsure: ask one question naming the two candidate modes. In unattended runs, don't ask: pick
  the mode that changes the least code.

## 2. Ground rules (all modes)

1. **Components come from the package.** Every UI primitive and icon is imported from
   `@blotoutio/design-system`. Never add shadcn/ui copies, Radix, `@base-ui/react` directly, MUI,
   Ant Design, Chakra, Headless UI, sonner or another icon set. Missing something? Use the gap rule in
   [references/component-map.md](references/component-map.md).
2. **Styling comes from tokens.** Colour, radius, shadow and type through Tailwind token classes
   (`bg-background`, `text-muted-foreground`, `border-border`, `rounded-lg`). No hex/rgb/oklch, no
   Tailwind palette colours (`bg-blue-500`), no arbitrary values (`p-[13px]`), no inline styles for
   colour or spacing. Spacing is the standard Tailwind scale. See [references/tokens.md](references/tokens.md).
3. **Base UI, not Radix.** `render` prop, never `asChild`. Read [references/gotchas.md](references/gotchas.md)
   before writing code: it lists the mistakes that compile but don't work (`onSelect` on menu items,
   `FieldError` without `match`, `Select` without `items`, `FieldGroup` used as a vertical stack).
4. **The hosted docs are the source of truth.** Check every component and prop you use, in this order:
   1. https://design.blotout.io/api.md: API and props.
   2. https://design.blotout.io/llms-full.txt: usage examples. Some lag the API (`asChild`, Accordion
      `type`, NavbarLink `active`, toast `duration`/`type`, MetricText percent as a ratio, DataTable
      "v8" and its column typing, DateRangePicker `timezone`/`layout`, Stepper `state`, `NavbarBrand`
      with text, `AlertDialogHeader` without `AlertDialogText`); api.md wins.
   3. https://design.blotout.io/llms.txt: component index.
   4. https://design.blotout.io for how it looks.

   The installed version comes from the app's `package.json`. Never use a prop or variant you haven't
   seen in the API docs. Typecheck can't see layout bugs, so if a dev server is already running (or
   the developer asks), look at the page (verification.md step 3).

5. **Don't restyle DS components.** No `className` overrides of their colour, height, radius or font.
   Layout classes on them (`w-full`, `col-span-2`, `self-end`) are fine.
6. **Accessible by default.** Every control has a label (`Field` + `FieldLabel`, or `aria-label`),
   icon-only buttons have `aria-label`, dialogs have a title.
7. **Stay in scope.** Change only what the task needs. Don't edit files under `node_modules` or
   fork DS source into the app. No git operations (branches, commits, stashes, pushes): version control
   is the developer's. Exception: missing setup from section 3 (theme import, font, `Toaster`, root
   wrapper) is always in scope, even though it touches app-wide files; list it in the report as an
   app-wide change.

## 3. Setup check (once per repo, before writing UI)

Fix only what's missing. Details: [references/setup.md](references/setup.md).

- `@blotoutio/design-system` in dependencies; React 19; Tailwind v4.
- Main CSS: `@import "tailwindcss";` then `@import "@blotoutio/design-system/theme.css";`. No leftover
  shadcn `:root { --background: … }` token blocks.
- Inter Variable font loaded.
- `<Toaster />` mounted once at the app root if anything calls `toast()`.

React 18, Tailwind v3 or no Tailwind: stop before editing and report it (see setup.md). Upgrading is the developer's call.

## 4. Finish (every mode that writes code)

Run [references/verification.md](references/verification.md): typecheck, build, and
`scripts/check-ds-usage.mjs`. Report what ran and the result. Then list: DS components used, gaps you
composed around, anything you couldn't map, and design-system candidates.

If the app's `CLAUDE.md` / `AGENTS.md` doesn't mention this skill, end the report by suggesting this
line for the developer to add (don't add it yourself). Without it, agents often skip the skill on
plain UI requests:
`UI: this app uses @blotoutio/design-system. For any UI work (components, pages, layouts, styling, UI bug fixes, UI reviews), use the design-system skill first.`
