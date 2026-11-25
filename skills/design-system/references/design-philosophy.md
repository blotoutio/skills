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
   `Drawer` or a detail page, filters live in the section's heading row.
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
- **Landmarks:** the page content sits in one `<main>`. Each page section has a real `<h2>` heading
  above its content (see "Sections" below).
- **Page width:** app pages use the full width of the content area: `w-full`, no `max-w-*` container.
  Don't cap dashboards, tables, detail or settings pages. Pages are left-aligned (no `mx-auto`) and never
  centred in the viewport. Exceptions: auth pages (a single centred `Card`; see [build.md](build.md)), a
  wizard's step card, and a standalone form's `Card`, which may keep a `max-w-*` on the card itself
  so inputs don't stretch. The page around them stays full width.
- **Page header:** breadcrumb (when nested), title, one-line description in `text-muted-foreground`,
  actions on the right (primary last). Use the DS `PageHeader` when the installed version exports it
  (0.1.3+): `PageHeaderBanner` holds `PageHeaderHeading` and `PageHeaderActions`. The heading holds a
  `PageHeaderTitleRow` (optional icon, `PageHeaderTitle`, then `PageHeaderAddons` for a status badge)
  and the `PageHeaderDescription` under it. Icons: `PageHeaderIcon` (24px) for a plain icon,
  `PageHeaderRoundIcon` (36px circle) for a brand mark such as the Facebook app's logo. On older
  versions, compose it (markup in [build.md](build.md)).
- **Scope selectors go with the actions.** A selector that scopes the whole page (app instance, account,
  dataset, workspace) is part of the page header. Put it in the header's action area, before the
  action buttons (first child of `PageHeaderActions`). Never put it in its own row above or below the
  header, and not in `PageHeaderAddons` (that slot is for a status badge next to the title). The
  Storybook "With Title Addons" example puts a select there; Blotout apps don't.
- **Sub-pages are page-header tabs.** When an app has more than one page (a main view plus its
  settings), show them as tabs in the page header, not as separate pages reached through buttons.
  Use `PageHeaderTabs` + `PageHeaderTabsList` (or `<TabsList variant='header'>`, 0.1.3+) directly
  under the header's title row, full width. Each sub-page is one tab, and a settings page is always a
  tab of its app, never a separate page. Example: the Facebook app has two tabs, "Event match
  quality" and "Settings".
  - In a routed app each tab has its own URL (`/apps/facebook/settings`). Keep the tab value in sync
    with the route so tabs can be linked to and survive a reload.
  - Header actions that apply to one tab only (Refresh on the EMQ tab) show only while that tab is
    active. The scope selector stays on every tab.
  - On a DS version without the header variant, use `<TabsList variant='line'>` in the same place and
    report the version gap.
- **Navigation inside the app vs leaving it:**
  - Going to another page of the same app is a tab (above). Never a header button or CTA that jumps
    there ("Settings", "Configure", "View details").
  - Leaving for an external site (Meta Events Manager, Google Ads, Shopify admin) is a
    `Button variant='outline'` rendered as an anchor that opens a new tab, with `ExternalLinkIcon` and
    screen-reader text "(opens in a new tab)". Not a text link.
  - Plain text links are only for links inside running text (a sentence or help text).
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
  one column, tables scroll horizontally or switch to `Item` lists,
  `Sidebar` becomes a sheet automatically. With `PageHeader` the title truncates rather than
  wrapping; if the actions don't fit at phone width, add `flex-wrap` to `PageHeaderBanner` (a layout
  class).

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

## Sections: heading above, data in the card

A page section is a heading row followed by its content. The title, filters and actions sit above
the card, never inside it. The card holds only the data (a chart, a form, content). Notes and counts
go below the card or table.

- **Heading row, left:** the section title as an `<h2>` (`text-lg font-semibold`), with an optional
  one-line description under it (`text-sm text-muted-foreground`). Short meta that belongs to the
  title ("Updated 10:28 AM") sits on the title's line after it, in
  `text-sm font-normal text-muted-foreground`.
- **Heading row, right:** filters and actions on one line, in this order: segmented toggles and filter
  selects, then action buttons, then search last (far right).
- Every control in the row is the same height, 32px (the default `Button`). Use default-size selects
  here, so a button beside a dropdown lines up. A `size='sm'` select trigger (28px) can be bumped to
  32px with `className='h-8'`; that's the one allowed height override on it.
- On small screens the row stacks: `flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between`.
- The card is a plain `Card` + `CardContent`, with no `CardHeader` or `CardTitle`. KPI tiles are the
  exception: a tile's label sits inside its small `Card`.
- Settings pages use their own section rows (title column on the left; see below).

Markup: [build.md](build.md), "Section with a heading row".

## Tables

- **Bordered, with no section card.** When a section's content is a table, use a bordered table on its
  own: no `Card` around it. The heading row (title, filters, actions) sits above the table and notes
  sit below it.
- **Frame:** 1px `border-border`, `rounded-lg`, no padding inside the frame; the rows carry the
  spacing. Use `<Table bordered>` (0.1.3+). On older versions, wrap the table in
  `<div className='overflow-hidden rounded-lg border border-border'>` and report the version gap.
  `DataTable` has no `bordered` prop (0.1.3), and its toolbar and pagination sit inside its root, so
  frame only its inner table with the shared `BorderedDataTable` (build.md) and list
  `DataTable bordered` as a DS candidate.
- **Cells:** header labels in `text-muted-foreground`, first column `font-medium`, and no line under
  the last body row. An expanded last row keeps its line, to separate it from its panel.
- **Sizes:**
  - Default, for every table that isn't expandable: header 40px, body rows 36px, 12px padding at the
    outer edges and 8px between columns. This is `<Table bordered>` as the DS ships it.
  - Large (`lg`), for expandable tables: header 42px, body rows 48px, 16px left and right padding in
    every cell, and the expanded panel's content 50px from the edge.
  - When the installed `Table` has a `size` prop (DS #33, after 0.1.3), use
    `<Table bordered size='lg'>` directly. Until then, set the sizes and the cell styles above in one
    shared app component (`BorderedTable size='lg' | 'default'`, build.md), not per page, and mark
    it `TODO(design-system): Table size`.
- **Per-item breakdowns use an expandable table, not expandable cards.** When each item in a list
  (events, channels, rules) has a detail breakdown, show it as an expandable `Table` (`lg` size),
  not as a grid of cards with a "Show details" collapsible. `TableRowGroup` wraps each row and its
  `TableExpandedRow`. In the first cell, `TableExpandToggle` goes first in a
  `flex items-center gap-2.5` wrapper, followed by `TableCellContent` (not inside it), and the
  panel holds `TableDetailList` + `TableDetailItem label=…`. Give the toggle an `aria-label` that
  names the row (its default is a generic "Toggle row"). The panel's content lines up with the row's
  first-column text (edge padding + 16px chevron + 8px + 10px gap). Clicking anywhere on the row may also toggle
  it, as long as the chevron button stays the accessible control.
- **Row actions are `link` buttons.** Use `Button variant='link'`, not `outline` or `ghost`, for
  actions in a row.
- **Icons over text.** Row actions are icon-only by default:
  `<Button variant='link' size='icon-sm' aria-label='Retry'>` wrapping a DS icon, with a `Tooltip`
  that names the action. Use text labels (`<Button variant='link' size='sm'>Retry</Button>`) only
  when asked. Keep every row action inline, destructive ones included (four is fine). Use the
  `DataTableRowActions` overflow menu only when asked, or when there are more than four actions.
  Then the most used actions stay inline.
- A destructive row action follows the same rule: an icon `link` button that opens an `AlertDialog`,
  and only the dialog's confirming action is `destructive`.

## Settings and configuration pages

A settings or configuration page is a stack of sections, never a stack of titled cards. It is a tab
of its app in the page header (see "Sub-pages are page-header tabs"), not a separate page.

**Layout**

- Each section is a row. The title and description sit on the left, 300px wide and fixed
  (`lg:w-75`). The content sits on the right and fills the rest. The two are 32px apart (`lg:gap-8`).
- Sections are separated by a 1px `border-b` with 24px vertical padding (`py-6`). The last section
  has no border (`last:border-b-0`).
- The right side is a `Card` (24px padding, 16px gap: `gap-4 p-4 md:p-6`) with no `CardHeader`,
  `CardTitle` or `CardFooter`. The left side is the section's heading (`<h2>`).
- If a section holds only code snippets, skip the `Card` and place the code block directly on the
  right. Mixed code and controls go back in a `Card`.
- A section's save button sits at the bottom right of its card, default size, never full width
  (`md:w-auto md:self-end`).

**Responsive**

- Below 1024px (`lg`), the title and description move above the content. Both are full width and
  16px apart (`gap-4`).
- Below 768px (`md`), card padding drops to 16px (`p-4`), fields go one per row, and the save button
  goes full width (`w-full`).

The markup is in [build.md](build.md) under "Settings / configuration page".

## Forms

- One column. Label above the control. Help text under it in `FieldDescription`; error replaces or
  follows it in `FieldError`.
- Stack fields with `flex flex-col gap-4`; put a pair side by side (first/last name) with
  `grid gap-4 md:grid-cols-2`, so it collapses to one column on mobile. `FieldGroup` never collapses:
  use it only for a row that must stay side by side on mobile. Split long forms into sections. On a settings page, use the section rows under "Settings and
  configuration pages", not a `Card` with a title per section.
- Primary submit at the end, aligned end, with `loading` while submitting; secondary "Cancel" as
  `outline`, `secondary` or `ghost` before it.
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
