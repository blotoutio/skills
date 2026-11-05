# Tokens: colour, type, spacing, radius, shadow

Every visual value comes from the theme (`@blotoutio/design-system/theme.css`). Tokens switch for dark
mode on their own, so using them is what makes dark mode work. Full hex values per theme:
https://design.blotout.io/llms-full.txt, section "Design Tokens".

## Colour: pick by meaning, not by look

| Need                                  | Class                                                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Page background / main text           | `bg-background` / `text-foreground`                                                                    |
| Secondary text, captions, helper text | `text-muted-foreground`                                                                                |
| Raised surface (card, panel)          | `bg-card text-card-foreground` (prefer the `Card` component)                                           |
| Subtle fill (wells, code, hover rows) | `bg-muted`, `bg-accent`, `bg-secondary`                                                                |
| Borders and dividers                  | `border-border` (or `Separator`); inputs `border-input`                                                |
| Primary action                        | `Button variant='default'` (don't paint `bg-primary` yourself)                                         |
| Brand orange accent (rare, marketing) | `Button variant='brand'`, `bg-brand text-brand-foreground`                                             |
| Error                                 | `text-destructive-text`, `bg-destructive-muted`, `Alert variant='destructive'`                         |
| Success / warning-amber / neutral     | `text-success-text bg-success-muted`, `text-alert-text bg-alert-muted`, `text-rest-text bg-rest-muted` |
| Warning surface                       | `Alert variant='warning'` / `Banner` (no `bg-warning` utility exists)                                  |
| Focus ring                            | handled by components; custom focusables use `focus-visible:ring-3 focus-visible:ring-focus-ring`      |
| Charts / data series                  | `--chart-1` … `--chart-12` in order (`fill-chart-1`, `bg-chart-2`)                                     |
| App sidebar                           | `bg-sidebar`, `text-sidebar-foreground` (the `Sidebar` component does this)                            |

Status meaning is fixed across products: success = green tokens, alert = amber, destructive = red,
rest = neutral/inactive. Never use chart colours for status. Show status through `Badge` / `Alert` /
`Banner` (they own the contrast decisions) and always with a word or icon, not colour alone. Don't use
`text-alert-text` / `text-success-text` for running text: they're below 4.5:1 on light surfaces.

Forbidden: hex, `rgb()`, `hsl()`, `oklch()` in classes or styles; Tailwind palette colours
(`bg-blue-500`, `text-gray-600`, `border-slate-200`); `text-black`/`bg-white` (use `foreground`/`background`).

## Typography

Font is Inter Variable (`font-sans`, the default) and the system mono stack (`font-mono`) for code,
IDs and numbers in tables when alignment matters (`tabular-nums` also works).

| Role                      | Classes                                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| Page title (one per page) | `text-2xl font-semibold tracking-tight`                                                                  |
| Section title             | `text-lg font-semibold`                                                                                  |
| Card title                | `CardTitle` (don't restyle)                                                                              |
| Body                      | `text-sm` (set it once on the app root/layout; the theme leaves body at 16px; DS controls are `text-sm`) |
| Helper / caption / meta   | `text-xs text-muted-foreground` or `text-sm text-muted-foreground`                                       |
| Big numbers (KPIs)        | `MetricText size='lg'`                                                                                   |

Weights: `font-normal`, `font-medium` (labels, emphasis), `font-semibold` (titles). Avoid `font-bold`
and `font-light`. Sentence case everywhere: "Create project", not "Create Project".

## Spacing

The standard Tailwind 4px scale. No arbitrary values. Use these steps:

| Use                                                    | Value                                                                   |
| ------------------------------------------------------ | ----------------------------------------------------------------------- |
| Icon to text, tight inline groups                      | `gap-1.5` / `gap-2`                                                     |
| Between form fields, between items in a list           | `flex flex-col gap-4` (`FieldGroup` is for side-by-side columns, gap-5) |
| Between cards in a grid, between related sections      | `gap-4` / `gap-6`                                                       |
| Between major page sections                            | `gap-8`                                                                 |
| Page padding                                           | `p-4 md:p-6` (`lg:p-8` on wide marketing-style pages)                   |
| Inside a custom panel (prefer Card, which pads itself) | `p-4` / `p-6`                                                           |

Lay out with flex/grid and `gap-*`. Avoid `space-y-*` stacks of margins and one-off `mt-3`/`mb-5` tweaks.
Content width: `max-w-screen-xl` for dashboards, `max-w-3xl` for forms and settings, `max-w-prose` for long text.

## Radius and shadow

- Radius tokens: `rounded-sm`, `rounded-md`, `rounded-lg` (default for surfaces), `rounded-xl`, `rounded-full` (avatars, pills). `rounded-2xl`+ exist but aren't used for app surfaces. No `rounded-[10px]`.
- Shadows: `shadow-2xs` … `shadow-2xl`. Surfaces sit on borders, not shadows; use `shadow-sm` at most for a resting card, larger shadows only for floating layers (components already set these).

## Responsive breakpoints

Standard Tailwind (`sm md lg xl 2xl`). Design desktop first for apps (they're used on desktop), then
check `md` and below. Use container queries (`@container`) for components that live in resizable panels.
