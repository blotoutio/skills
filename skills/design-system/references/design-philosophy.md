# DESIGN mode: how Blotout UI should look and behave

Use this when deciding what to build (layout, flow, states), when reviewing a screen, or before BUILD
on any new page. Output in DESIGN mode is a short plan or review, not code, unless the developer asked
for code too (then continue in BUILD).

## Principles

1. **Quiet, neutral, content first.** The UI is mostly greyscale: near-black primary, white/near-black
   surfaces, muted text for everything secondary. Colour carries meaning (status, data series, the one
   brand accent), never decoration. If a screen looks colourful, something is wrong.
2. **One primary action per view.** One `Button variant='default'`. Everything else is `outline`,
   `secondary` or `ghost`, or lives in an overflow `DropdownMenu`. `destructive` only for the action that
   destroys, and it goes through `AlertDialog`: the trigger is `outline` (or a menu item), and only the
   `AlertDialogAction` that confirms is `destructive`. `brand` (orange) is rare: marketing moments and
   onboarding, not app chrome.
3. **Consistency over novelty.** If a DS component does the job, use it as is. Same pattern for the
   same problem in every app: confirmations are `AlertDialog`, results are toasts, details open in a
   `Drawer` or a detail page, filters live in the table toolbar.
4. **Dense but breathable.** Apps are work tools used on desktop. `text-sm` body, compact controls
   (DS defaults), generous gaps between groups (`gap-6`/`gap-8`) and tight gaps inside a group
   (`gap-2`/`gap-4`). Group with spacing and `Card`s, not with extra borders and lines.
5. **Every state is designed.** Loading (`Skeleton` shaped like the content, never a lone page
   spinner), empty (what this is, why it's empty, the one action that fills it), error (what happened,
   how to fix, retry), partial/permission states, disabled with a reason (`Tooltip`).
6. **Honest controls.** A control looks like what it does: buttons look like buttons, links like links,
   toggles have a visible boundary. A setting never silently overrides what the user picked: show the
   constraint (disabled, hint) before they pick. Truncated text shows in full on hover (`title` or
   `Tooltip`).
7. **Accessible by default.** Labels on every field, keyboard reachable, visible focus, 4.5:1 text
   contrast (neutral tokens pass; status colours go through `Badge`/`Alert`, never as body text), never colour alone for status (add an icon
   or text), motion is short and functional.
8. **Plain words.** Sentence case for titles, buttons and labels. Buttons say the action ("Save
   changes", "Delete project"), not "OK"/"Submit". Errors say what to do. No exclamation marks, no
   jargon the user didn't type themselves. Dates relative when recent (`RelativeTime`), absolute when
   it matters (`DateLabel`).

## App layout patterns

- **Shell:** left `Sidebar` (product areas, collapsible to icons) for apps with more than ~5 areas;
  `Navbar` for small apps or public-facing pages. Not both, unless the developer's app already does.
- **Landmarks:** the page content sits in one `<main>`; each `Card` section has a real heading
  (`CardTitle render={<h2 />}`).
- **Page header:** breadcrumb (when nested), title (`text-2xl font-semibold tracking-tight`), one-line
  description in `text-muted-foreground`, actions on the right (primary last).
- **Content width:** dashboards and tables `max-w-screen-xl`; forms and settings `max-w-3xl`; reading
  `max-w-prose`. A mixed page (settings plus a table or card grid) takes the width of its widest
  region. Left-aligned within the content area (no `mx-auto`). Don't centre app pages in the viewport
  (exception: auth pages, a single centred `Card`; see [build.md](build.md)).
- **Grids:** KPI tiles `sm:grid-cols-2 lg:grid-cols-4`; card grids `md:grid-cols-2 xl:grid-cols-3`;
  `gap-4` between tiles, `gap-6` between sections.
- **Vertical lists and vertical tabs** are start-aligned, never centred.
- **Overlays:** `Dialog` for a focused task that returns to the page (≤ ~6 fields); a full page for
  anything longer; `Drawer` (right) for inspecting a row without losing the list; `Popover` for small
  inline editors; popups sit a little off their trigger (DS default offsets, don't zero them).
- **Feedback placement:** result of the user's action → toast; problem with a section → `Alert` in
  that section; problem with a field → `FieldError` under the field; account-wide notice → `Banner`.
  A notice about this page's own subject (a failed payment on the billing page) is an `Alert` at the
  top of the page; the same notice shown across the whole app is a `Banner`.
- **Responsive:** design desktop first, then make sure `md` and mobile still work: grids collapse to
  one column, header actions wrap below the title, tables scroll horizontally or switch to `Item` lists,
  `Sidebar` becomes a sheet automatically.

## Flows and onboarding

- One task per step, a visible `Stepper`, the step count known up front. Back always works and keeps
  what was typed. Continue validates the current step only.
- Waiting (DNS checks, connections): show progress in place (`Button loading`, `Spinner` + text), say
  what's being checked, and offer a way out ("Check again", "I'll do this later") when it can take long.
- `brand` (orange) is allowed once in onboarding, for the final "Go to dashboard" moment, never for
  step navigation.
- Values the user must copy (DNS records, keys): monospace, with a copy button (compose: gotchas).
- Optional steps say "Optional" in the step title and have a Skip (`ghost`) button.

## Data display

- Numbers through `MetricText` / `formatMetric` (currency, compact, percent) so every app formats the
  same. Right-align numeric table columns; use `tabular-nums`.
- Trend: `MetricText change={…}` (green up, red down). Don't invent arrow colours. For metrics where
  lower is better (cost, latency, error rate) there's no invert option: omit `change` and show the
  delta as muted text ("−12% vs last week"), so a drop isn't painted red.
- Chart series use `--chart-1` … `--chart-12` in order; status never uses chart colours.
- Status: `Badge` variants with a fixed meaning: `success` healthy/done, `alert` needs attention,
  `destructive` failed/blocked, `rest` inactive/neutral, `secondary` informational.

## Forms

- One column. Label above the control. Help text under it in `FieldDescription`; error replaces or
  follows it in `FieldError`.
- Stack fields with `flex flex-col gap-4`; put a pair side by side (first/last name) with `FieldGroup`;
  split long forms into `Card` sections with a title each.
- Primary submit at the end, aligned end, with `loading` while submitting; secondary "Cancel" as
  `outline`/`ghost` before it.
- Validate on blur or submit, not on every keystroke. Keep what the user typed after an error.

## DESIGN mode output

For a new screen or flow, produce:

1. **Purpose** (one line) and primary action.
2. **Layout:** shell, page pattern from [build.md](build.md), regions top to bottom.
3. **Component plan:** region → DS components ([component-map.md](component-map.md)); gaps and how you'll compose them.
4. **States:** loading, empty, error, success for each region that loads or submits.
5. **Copy:** title, description, button labels, empty-state text.
6. **Open questions** for the developer or designer (only real ones).

For a review of an existing screen, list findings against the principles above, each with: where,
what's wrong, the DS-based fix. Rank: broken/inaccessible first, then inconsistent, then polish.
