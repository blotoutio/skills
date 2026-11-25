# BUILD mode: new page, screen or composite component

Goal: ship UI made only of DS components and tokens, that reads as part of the same product as every
other Blotout app.

## Steps

Extending UI that's already on the DS? Skip to step 4 and keep the change scoped.

1. **Setup check.** Run the setup check in SKILL.md. Note the installed DS version.
2. **Read the app.** Find how the app already structures pages: router, layout/shell, where shared
   components live, data-fetching pattern, existing DS usage. Follow the app's conventions for files,
   naming and state (no convention yet: `src/pages/<Name>.tsx`, shared composites in `src/components/`).
   If the app already has a DS shell (`Sidebar`/`Navbar`), put the page inside it; don't build a second
   shell. If the task needs you to change a non-DS shell (e.g. "add it to the navigation"), migrate just
   that shell to `Navbar`/`Sidebar` as part of the task and say so in the report; leave other screens alone.
   No backend yet: use typed mock data inside the page or component, marked
   `// TODO: replace with the real API`, so loading and error states can be shown.
3. **Plan the layout** (in your head or as a short list for big pages) using
   [design-philosophy.md](design-philosophy.md): page pattern, regions, at most one primary action
   (read-only pages like dashboards may have none; don't invent one), the states (loading, empty,
   error, populated).
4. **Map every region to DS components** with [component-map.md](component-map.md). Write the list:
   region → components. Anything without a match goes through the gap rule.
5. **Check the APIs** you'll use in the installed package's type definitions (typecheck or editor
   go-to-definition), with https://design.blotout.io/api.md as the quick reference, and the
   pitfalls in [gotchas.md](gotchas.md) (`render` not `asChild`, Select `items`, array values for
   Accordion/ToggleGroup, `toast` options).
6. **Write the code.**
   - Imports only from `@blotout/design-system` for UI and icons.
   - Layout with flex/grid + `gap-*` on the spacing steps in [tokens.md](tokens.md).
   - Colours, radius, shadows only through token classes.
   - Every state handled: `Skeleton` while loading, an empty state, an `Alert` or inline `FieldError` on error, disabled/`loading` buttons while submitting.
   - Real labels on every control; `aria-label` on icon-only buttons.
   - Composite component (reusable): typed props, `className` passed through with `cn()`, spread the rest props onto the root, no hard-coded copy that callers need to change, no data fetching inside it.
7. **Verify** with [verification.md](verification.md). Fix what it finds.
8. **Report** to the developer: files created, DS components used, gaps composed (and DS candidates).

## Page skeletons

Copy the matching one and fill it in. Adjust to the app's router and shell.

### Page inside an existing app shell

Full width (`w-full`, no `max-w-*`). With the DS `PageHeader` (0.1.3+):

```tsx
import {
  Button,
  PageHeader,
  PageHeaderActions,
  PageHeaderBanner,
  PageHeaderDescription,
  PageHeaderHeading,
  PageHeaderTitle,
  PageHeaderTitleRow,
  PlusIcon,
} from '@blotout/design-system'

export function ProjectsPage() {
  return (
    <div className="flex w-full flex-col">
      <PageHeader>
        <PageHeaderBanner>
          <PageHeaderHeading>
            <PageHeaderTitleRow>
              <PageHeaderTitle>Projects</PageHeaderTitle>
            </PageHeaderTitleRow>
            <PageHeaderDescription>
              Everything your team is tracking.
            </PageHeaderDescription>
          </PageHeaderHeading>
          <PageHeaderActions>
            {/* scope selector first (if any), then the actions, primary last */}
            <Button>
              <PlusIcon />
              New project
            </Button>
          </PageHeaderActions>
        </PageHeaderBanner>
      </PageHeader>
      <div className="flex flex-col gap-6 p-6">{/* sections */}</div>
    </div>
  )
}
```

`PageHeaderTitleRow` holds, in order: an optional icon, the `PageHeaderTitle`, then
`PageHeaderAddons` (a status `Badge`). Use `PageHeaderIcon` for a plain 24px icon, or
`PageHeaderRoundIcon` (a 36px circle) for a brand mark such as the Facebook app's logo.

`PageHeaderBanner` doesn't wrap: the title truncates. If the actions don't fit at phone width, add
`flex-wrap` to `PageHeaderBanner` (a layout class).

Without `PageHeader` (older DS), compose the same thing:

```tsx
<header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
  <div className="flex flex-col gap-1">
    {/* Breadcrumb when nested */}
    <h1 className="text-2xl font-semibold tracking-tight">Facebook</h1>
    <p className="text-sm text-muted-foreground">
      Event match quality for your Meta pixel.
    </p>
  </div>
  <div className="flex flex-wrap items-center gap-2">
    <Select items={INSTANCES} value={id} onValueChange={setId}>
      <SelectTrigger aria-label="Facebook instance" className="w-auto">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>{/* SelectItem per instance */}</SelectContent>
    </Select>
    <Button variant="outline">Refresh</Button>
  </div>
</header>
```

The scope selector (instance, account, dataset, workspace) sits in the action area before the
buttons, never in its own row.

### App with sub-pages (header tabs)

An app with more than one page (main view + settings) shows them as header tabs. Every sub-page,
settings included, is a tab, never a separate page reached through a button.

```tsx
<PageHeader>
  <PageHeaderBanner>
    <PageHeaderHeading>
      <PageHeaderTitleRow>
        <PageHeaderRoundIcon>{/* Facebook logo */}</PageHeaderRoundIcon>
        <PageHeaderTitle>Facebook</PageHeaderTitle>
        <PageHeaderAddons>
          <Badge variant="success">Connected</Badge>
        </PageHeaderAddons>
      </PageHeaderTitleRow>
      <PageHeaderDescription>Event match quality and settings for your Meta pixel.</PageHeaderDescription>
    </PageHeaderHeading>
    <PageHeaderActions>
      {/* scope selector (all tabs), then actions; tab-only actions render only on their tab */}
      {tab === 'emq' && <Button variant="outline">Refresh</Button>}
    </PageHeaderActions>
  </PageHeaderBanner>
  <PageHeaderTabs value={tab} onValueChange={setTab}>
    <PageHeaderTabsList>
      <TabsTrigger value="emq">Event match quality</TabsTrigger>
      <TabsTrigger value="settings">Settings</TabsTrigger>
    </PageHeaderTabsList>
  </PageHeaderTabs>
</PageHeader>
<div className="flex flex-col gap-6 p-6">
  {tab === 'emq' ? <EmqTab /> : <SettingsTab />}
</div>
```

- Routed apps: one URL per tab (`/apps/facebook/settings`). Derive `tab` from the route and navigate
  in `onValueChange`, so tabs can be linked to and survive a reload.
- Without `PageHeaderTabs`: wrap the header and content in `Tabs`, put `<TabsList variant='header'>`
  under the title row (`variant='line'` before 0.1.3), and render each sub-page in `TabsContent`.

### Link to an external site

Leaving the app (Meta Events Manager, Google Ads, Shopify admin) is an outline button, not a text link:

```tsx
<Button
  variant="outline"
  nativeButton={false}
  render={<a href={url} target="_blank" rel="noreferrer" />}
>
  Open Events Manager
  <ExternalLinkIcon />
  <span className="sr-only">(opens in a new tab)</span>
</Button>
```

Going to another page of the same app is a header tab, not a button. Plain text links are only for
links inside running text.

### Section with a heading row

Title, filters and actions above the card; the card holds only the data; notes below.

```tsx
<section aria-labelledby="history-title" className="flex flex-col gap-4">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div className="flex min-w-0 flex-col gap-1">
      <h2 id="history-title" className="text-lg font-semibold">
        Match quality history{' '}
        <span className="text-sm font-normal text-muted-foreground">
          Updated 10:28 AM
        </span>
      </h2>
      <p className="text-sm text-muted-foreground">
        Daily values Meta reported for each event.
      </p>
    </div>
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      {/* toggles and filter selects, then action buttons, then search last; all 32px high (a size='sm' select trigger needs className='h-8') */}
    </div>
  </div>
  <Card>
    <CardContent>{/* chart */}</CardContent>
  </Card>
</section>
```

A table section uses the same heading row, with the bordered table in place of the `Card`.

### Dashboard

Full width. KPI row (`grid gap-4 sm:grid-cols-2 lg:grid-cols-4` of `Card size='sm'` + `MetricText`;
the tile label is a plain `CardTitle` or `CardDescription` inside the tile, not a heading). Then the main
chart or table as a section with a heading row (title, filters and actions above the card; tables
bordered, without a card), then secondary sections in a `lg:grid-cols-3` grid. Date range filter that
scopes the whole page: `DateRangePicker` in the page header actions (controlled pattern in gotchas);
one that scopes a single section goes in that section's heading row. Charts: `Chart` (0.1.3+):
`<Chart type='bar' data={rows} label='…' />` (types line/area/bar/pie/donut/funnel/scatter/sankey/
radar/radial; confirm props in the types). A trend line inside a KPI tile: `Sparkline` (0.1.3+),
`<Sparkline data={[…]} label='…' />`. On older versions, a placeholder `Card` (dashed border, muted text, `TODO(design-system): Chart`)
unless the app already has a chart library; don't add a chart library without asking the developer.

### Settings / configuration page

Full width, and a tab of its app in the page header (see "App with sub-pages"), not a separate
page. The page is a stack of section rows, never stacked titled cards. The rules are in
[design-philosophy.md](design-philosophy.md) under "Settings and configuration pages".

```tsx
<div className="flex flex-col">
  <section
    aria-labelledby="general-title"
    className="flex flex-col gap-4 border-b border-border py-6 last:border-b-0 lg:flex-row lg:gap-8"
  >
    <div className="flex w-full flex-col gap-1 lg:w-75 lg:shrink-0">
      <h2 id="general-title" className="text-base font-medium">
        General
      </h2>
      <p className="text-sm text-muted-foreground">
        Name and contact details for this workspace.
      </p>
    </div>
    <Card className="flex-1 gap-4 p-4 md:p-6">
      {/* fields, one per row; a pair side by side only from md: */}
      <div className="grid gap-4 md:grid-cols-2">…</div>
      <Button className="w-full md:w-auto md:self-end">Save changes</Button>
    </Card>
    {/* code-only section: <div className="min-w-0 flex-1">…code block…</div> instead of the Card */}
  </section>
</div>
```

- Put fields straight in the `Card`: no `CardHeader`, `CardContent` or `CardFooter` (the left
  column is the heading). Padding and gap on this `Card` are layout classes, so they're allowed.
- `lg:w-75` is 300px on the standard scale; don't write `lg:w-[300px]` (the scanner flags it).
- Fields stack one per row (`flex flex-col gap-4`, or the `Card`'s own gap). A pair side by side
  (first/last name) is `grid gap-4 md:grid-cols-2`, so it collapses to one column below 768px.
- Instant toggles use `Switch`, save on change and confirm with a toast. That section has no save
  button. Sections with several fields save on submit, each with its own save button.
- Code blocks: monospace on `bg-muted`, with a copy button (compose: gotchas).

A standalone form that isn't a settings page (create project, invite user) stays one `Card` with
`CardHeader`, `CardContent` and `CardFooter`. The card may be `max-w-3xl` so inputs don't stretch; the
page around it stays full width.

### List / table page

Page header with title + primary action, then a section: heading row (title, filters, actions,
search last), then a bordered table with no `Card` around it, then notes below it. Row actions are
icon-only `Button variant='link'` buttons with `aria-label` and a `Tooltip`; text labels only when
asked (see design-philosophy.md "Tables"). Which table:

- Rows the user selects (bulk actions) or sorts and filters by column, client-side data: `DataTable`
  with its toolbar search and filters.
- Read-only list (no selection), even with search: `Table` family + `Pagination` and an
  `InputGroup` search in the heading row. DataTable's footer always shows "0 of N row(s) selected"
  (see gotchas).
- Server-side pagination or sorting: `Table` family + `Pagination` (DataTable is client-side only).
- Items that each have a detail breakdown: an expandable table (below), not cards with a
  "Show details" collapsible.

`DataTable` has no row-click handler. Put a link in the name cell (to a detail page), or an
actions cell of icon `link` buttons, one of which can open a `Drawer`. Use the
`DataTableRowActions` menu only when asked or for more than four actions.

### Shared bordered table (sizes)

When the installed `Table` has a `size` prop (DS #33, after 0.1.3), use `<Table bordered size='lg'>`
directly and drop the shim's size classes. Until then, put the table design in one app component and
use it on every page:

```tsx
// src/components/BorderedTable.tsx
// TODO(design-system): Table size. Switch to <Table bordered size='lg'> once the installed Table has `size` (DS #33)
type Size = 'default' | 'lg'
const SizeContext = createContext<Size>('default')

export function BorderedTable({
  size = 'default',
  ...props
}: Omit<React.ComponentProps<typeof Table>, 'size'> & { size?: Size }) {
  return (
    <SizeContext.Provider value={size}>
      <Table bordered {...props} />
    </SizeContext.Provider>
  )
}
export function BorderedTableHead({
  className,
  ...props
}: React.ComponentProps<typeof TableHead>) {
  const size = useContext(SizeContext)
  return (
    <TableHead
      className={cn(
        'text-muted-foreground',
        size === 'lg' &&
          'h-10.5 px-4 group-data-bordered/table:first:ps-4 group-data-bordered/table:last:pe-4',
        className,
      )}
      {...props}
    />
  )
}
export function BorderedTableCell({
  className,
  ...props
}: React.ComponentProps<typeof TableCell>) {
  const size = useContext(SizeContext)
  return (
    <TableCell
      className={cn(
        'first:font-medium',
        size === 'lg' &&
          'h-12 px-4 group-data-bordered/table:first:ps-4 group-data-bordered/table:last:pe-4',
        className,
      )}
      {...props}
    />
  )
}
export function BorderedTableExpandedRow({
  className,
  ...props
}: React.ComponentProps<typeof TableExpandedRow>) {
  const size = useContext(SizeContext)
  return (
    <TableExpandedRow
      className={cn(
        // 16px edge + 16px chevron + 8px toggle gap + 10px cell gap = 50px, so the panel lines up with the first-column text
        size === 'lg' &&
          'group-data-bordered/table:ps-12.5 group-data-bordered/table:pe-4',
        className,
      )}
      {...props}
    />
  )
}
```

- Default (40px header, 36px rows, 12px edges, 8px between columns) is `<Table bordered>` as the DS
  ships it. Large (`lg`: 42px header, 48px rows, 16px cell padding) is for expandable tables.
- `TableExpandedRow` passes `className` to the panel's inner padded box, so the `ps-12.5` above
  replaces the DS's bordered start padding (46px in 0.1.3). Don't write `ps-[50px]` (the scanner
  flags arbitrary values).
- This is the one place where height and padding classes on DS table parts are allowed. Keep them
  here, not on pages. The DS already drops the line under the last body row and keeps it under an
  expanded last row (checked on 0.1.3), so don't add borders for those.

`DataTable` (selection, sorting, client-side filtering) renders a plain `Table` with its toolbar and
pagination inside the same root, and has no `bordered` prop. Frame its inner table in one shared
component, not around the whole `DataTable`:

```tsx
// src/components/BorderedDataTable.tsx
// TODO(design-system): DataTable bordered — DataTable renders a plain Table, so frame its table here
const FRAME = [
  '[&_[data-slot=table]]:rounded-lg [&_[data-slot=table]]:border [&_[data-slot=table]]:border-border',
  '[&_th]:text-muted-foreground [&_td:first-child]:font-medium',
  '[&_th:first-child]:ps-3 [&_td:first-child]:ps-3 [&_th:last-child]:pe-3 [&_td:last-child]:pe-3',
].join(' ')

export function BorderedDataTable<TData extends object>({
  className,
  ...props
}: DataTableProps<TData>) {
  return <DataTable className={cn(FRAME, className)} {...props} />
}
```

### Expandable table (per-item breakdown)

```tsx
<BorderedTable size="lg" aria-label="Events">
  <TableHeader>…</TableHeader>
  <TableBody>
    {rows.map((row) => (
      <TableRowGroup key={row.id}>
        <TableRow>
          <BorderedTableCell>
            <div className="flex items-center gap-2.5">
              <TableExpandToggle aria-label={`Show details for ${row.name}`} />
              <TableCellContent>{row.name}</TableCellContent>
            </div>
          </BorderedTableCell>
          …
        </TableRow>
        <BorderedTableExpandedRow>
          <TableDetailList>
            {row.details.map((d) => (
              <TableDetailItem key={d.label} label={d.label}>
                {d.value}
              </TableDetailItem>
            ))}
          </TableDetailList>
        </BorderedTableExpandedRow>
      </TableRowGroup>
    ))}
  </TableBody>
</BorderedTable>
```

The toggle goes first in a `flex items-center gap-2.5` wrapper inside the cell, followed by
`TableCellContent`; not inside `TableCellContent`. Its default label is a generic "Toggle row", so
always pass one that names the row. `BorderedTableExpandedRow` lines the panel's content up with the
first-column text (edge padding + 16px chevron + 8px + 10px gap); check it in the browser. With the
DS `size` prop (#33), use `<Table bordered size='lg'>` and plain `TableExpandedRow`: the DS sets the
50px offset itself.

### Detail page

Page header with the object name in `PageHeaderTitleRow`, a status `Badge` in `PageHeaderAddons`
after the title (inside the same `PageHeaderTitleRow`), and actions (`Button` +
`DropdownMenu` for overflow). Sub-pages are header tabs (see "App with sub-pages"); each tab is a stack
of sections with heading rows.

### Auth page (login, sign-up, reset)

The one place a page is centred in the viewport.

```tsx
<main className="flex min-h-svh items-center justify-center bg-muted p-4">
  <Card className="w-full max-w-sm">
    <CardHeader>
      <CardTitle render={<h1 />}>Sign in</CardTitle>
      <CardDescription>Use your work email.</CardDescription>
    </CardHeader>
    <CardContent>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        {authError && (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertTitle>{authError}</AlertTitle>
          </Alert>
        )}
        <Field invalid={!!emailError}>
          <FieldLabel>Email</FieldLabel>
          <Input type="email" autoComplete="email" required />
          <FieldError match={!!emailError}>{emailError}</FieldError>
        </Field>
        <Field>
          <FieldLabel>Password</FieldLabel>
          <InputGroup>
            <InputGroupInput
              type="password"
              autoComplete="current-password"
              required
            />
            <InputGroupPasswordToggle />
          </InputGroup>
        </Field>
        <Button type="submit" loading={submitting} className="w-full">
          Sign in
        </Button>
      </form>
    </CardContent>
  </Card>
</main>
```

### Empty state (no `Empty` component; compose it)

```tsx
<div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border p-8 text-center">
  <div className="flex size-10 items-center justify-center rounded-full bg-muted">
    <FolderIcon className="size-5 text-muted-foreground" />
  </div>
  <div className="flex flex-col gap-1">
    <h3 className="text-sm font-medium">No projects yet</h3>
    <p className="text-sm text-muted-foreground">
      Projects group your domains and reports.
    </p>
  </div>
  <Button size="sm">
    <PlusIcon />
    New project
  </Button>
</div>
```

If the app needs it in several places, wrap it once as `EmptyState` in the app's components folder.
Chat surfaces use `ScrollerEmpty*` instead.

### Theme toggle (dark mode)

```tsx
// In index.html <head>, before the app script, to avoid a flash of the wrong theme:
// <script>document.documentElement.classList.toggle('dark', localStorage.theme === 'dark' || (!localStorage.theme && matchMedia('(prefers-color-scheme: dark)').matches))</script>

function ThemeToggle() {
  const [dark, setDark] = useState(false)
  useEffect(
    () => setDark(document.documentElement.classList.contains('dark')),
    [],
  ) // SSR-safe
  const toggle = () => {
    const next = !dark
    document.documentElement.classList.toggle('dark', next)
    localStorage.theme = next ? 'dark' : 'light'
    setDark(next)
  }
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={toggle}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}
```

Next.js: put the inline script in `app/layout.tsx` (`<html suppressHydrationWarning>` and a
`<script dangerouslySetInnerHTML={{ __html: '…' }} />` in `<head>`), or use `next-themes` with
`attribute='class'` if the app already has it.

### Wizard / onboarding flow

Full page inside the shell, left-aligned; the step card may be `max-w-2xl`. A `Stepper` at the top
shows progress; the current step's content sits in one `Card`; the footer has Back (`outline`, hidden
or disabled on step 1) and Continue (`default`; "Finish" on the last step) aligned end. Steps that must
validate (an async DNS check) run the check on Continue, with `loading` on the button, and only then
advance; so use your own buttons rather than `StepperNext`. Keep entered values when going back. The
last step is a success state: icon, one sentence, one primary action into the product.

```tsx
const STEPS = ['Domain', 'Verify DNS', 'Channels', 'Done']
const [step, setStep] = useState(1)
const done = step === STEPS.length
const headingRef = useRef<HTMLHeadingElement>(null)
useEffect(() => headingRef.current?.focus(), [step]) // move focus to the new step for keyboard/screen-reader users

<div className='flex w-full flex-col gap-6 p-4 md:p-6'>
  <Stepper value={step} onValueChange={setStep} linear aria-label='Setup progress'>
    {STEPS.map((title, i) => <StepperItem key={title} step={i + 1} title={title} />)}
  </Stepper>
  <Card className='max-w-2xl'>
    <CardHeader><CardTitle render={<h1 ref={headingRef} tabIndex={-1} />}>{STEPS[step - 1]}</CardTitle></CardHeader>
    <CardContent>{/* step content; on the last step: success icon + one sentence */}</CardContent>
    <CardFooter className='justify-end gap-2'>
      {done ? (
        <Button variant='brand' nativeButton={false} render={<a href='/dashboard' />}>Go to dashboard</Button>
      ) : (
        <>
          {step > 1 && <Button variant='outline' onClick={() => setStep(step - 1)}>Back</Button>}
          <Button loading={checking} onClick={onContinue}>{step === STEPS.length - 1 ? 'Finish' : 'Continue'}</Button>
        </>
      )}
    </CardFooter>
  </Card>
</div>
```

`onContinue` validates the current step, then calls `setStep(step + 1)`.

### Active navigation state

`SidebarMenuButton isActive={…}`, `NavbarLink current={…}`. Compute from the router's current path;
don't style active links by hand.

## Done means

- [ ] No import from any UI library other than `@blotout/design-system`.
- [ ] No hex/rgb/oklch, no Tailwind palette colours, no arbitrary `[...]` values, no inline colour/spacing styles.
- [ ] Loading, empty and error states exist and use DS components.
- [ ] Works in light and dark (`.dark` on `<html>`).
- [ ] Typecheck and build pass.
