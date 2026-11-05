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
5. **Check the APIs** you'll use in https://design.blotout.io/api.md, and the
   pitfalls in [gotchas.md](gotchas.md) (`render` not `asChild`, Select `items`, array values for
   Accordion/ToggleGroup, `toast` options).
6. **Write the code.**
   - Imports only from `@blotoutio/design-system` for UI and icons.
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

```tsx
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  PlusIcon,
} from '@blotoutio/design-system'

export function ProjectsPage() {
  return (
    <div className="flex w-full max-w-screen-xl flex-col gap-6 p-4 md:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>{' '}
              {/* router apps: render={<Link to='/' />} */}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Projects</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Everything your team is tracking.
          </p>
        </div>
        <Button>
          <PlusIcon />
          New project
        </Button>
      </header>
      {/* content regions */}
    </div>
  )
}
```

### Dashboard

KPI row (`grid gap-4 sm:grid-cols-2 lg:grid-cols-4` of `Card size='sm'` + `MetricText`; the tile label
is a plain `CardTitle` or `CardDescription`, not a heading: the "every Card has a heading" rule is for
section cards, not KPI tiles), then a main
chart/table `Card`, then secondary cards in a `lg:grid-cols-3` grid. Date range filter: `DateRangePicker`
in the page header actions (controlled pattern in gotchas). Charts: `Chart` if the installed version
exports it. Otherwise a placeholder `Card` (dashed border, muted text, `TODO(design-system): Chart`)
unless the app already has a chart library; don't add a chart library without asking the developer.

### Settings / form page

`max-w-3xl`. One `Card` per settings group with `CardHeader` (title + description), `CardContent`
holding the fields in a `flex flex-col gap-4` stack (`FieldGroup` only for
side-by-side pairs like first/last name), and `CardFooter` with the save `Button` aligned end. Instant toggles use
`Switch` and save on change with a toast; forms with several fields save on submit.

### List / table page

Header with title + primary action, then one `Card` (or bare) holding the table. Which table:

- Rows the user selects (bulk actions) or sorts and filters by column, client-side data: `DataTable`
  with its toolbar search and filters.
- Read-only list (no selection), even with search: `Table` family + `Pagination` and an
  `InputGroup` search above it. DataTable's footer always shows "0 of N row(s) selected" (see gotchas).
- Server-side pagination or sorting: `Table` family + `Pagination` (DataTable is client-side only).

`DataTable` has no row-click handler: put a link in the name cell (to a detail page) or a
`DataTableRowActions` menu / button cell that opens a `Drawer`.

### Detail page

Header with object name, status `Badge`, actions (`Button` + `DropdownMenu` for overflow). `Tabs` with
`<TabsList variant='line'>` for sections; each tab a stack of `Card`s.

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

Full page inside the shell, `max-w-2xl`, left-aligned. A `Stepper` at the top shows progress; the
current step's content sits in one `Card`; the footer has Back (`outline`, hidden or disabled on step

1. and Continue (`default`; "Finish" on the last step) aligned end. Steps that must validate (an async
   DNS check) run the check on Continue, with `loading` on the button, and only then advance; so use your
   own buttons rather than `StepperNext`. Keep entered values when going back. The last step is a success
   state: icon, one sentence, one primary action into the product.

```tsx
const STEPS = ['Domain', 'Verify DNS', 'Channels', 'Done']
const [step, setStep] = useState(1)
const done = step === STEPS.length
const headingRef = useRef<HTMLHeadingElement>(null)
useEffect(() => headingRef.current?.focus(), [step]) // move focus to the new step for keyboard/screen-reader users

<div className='flex w-full max-w-2xl flex-col gap-6 p-4 md:p-6'>
  <Stepper value={step} onValueChange={setStep} linear aria-label='Setup progress'>
    {STEPS.map((title, i) => <StepperItem key={title} step={i + 1} title={title} />)}
  </Stepper>
  <Card>
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

- [ ] No import from any UI library other than `@blotoutio/design-system`.
- [ ] No hex/rgb/oklch, no Tailwind palette colours, no arbitrary `[...]` values, no inline colour/spacing styles.
- [ ] Loading, empty and error states exist and use DS components.
- [ ] Works in light and dark (`.dark` on `<html>`).
- [ ] Typecheck and build pass.
