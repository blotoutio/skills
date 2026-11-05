# Component map: need → DS component

Pick from this table first. Confirm props in https://design.blotout.io/api.md. Live list with Storybook
links: https://design.blotout.io/llms.txt

## App structure

| Need                                    | Use                                                                                                                                                                                                                                                                                                             |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App shell with left navigation          | `SidebarProvider` + `Sidebar` (+ `SidebarInset` for the content)                                                                                                                                                                                                                                                |
| Top navigation bar                      | `Navbar` (+ `NavbarMobileMenu`)                                                                                                                                                                                                                                                                                 |
| Breadcrumb / page location              | `Breadcrumb`                                                                                                                                                                                                                                                                                                    |
| Inline text link / list of links        | Plain `<a>` (or the router's `Link`) with `font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground focus-visible:ring-3 focus-visible:ring-focus-ring rounded-sm outline-none`; there's no `TextLink`. Don't use `Button variant='link'` inline: it adds button height and padding |
| Tabs between views of one object        | `Tabs` (`<TabsList variant='line'>` for page-level tabs)                                                                                                                                                                                                                                                        |
| Command palette / quick search          | `CommandDialog` / `CommandPalette`                                                                                                                                                                                                                                                                              |
| Date range filter                       | `DateRangePicker` (trigger + popover); inline panel: `CalendarPicker`                                                                                                                                                                                                                                           |
| Resizable split panes                   | `ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle`                                                                                                                                                                                                                                                      |
| Scrolling region with styled scrollbar  | `ScrollArea`                                                                                                                                                                                                                                                                                                    |
| Wizard / multi-step setup or onboarding | `Stepper` + `Card` per step + your own Back/Continue buttons (pattern in build.md). `Questionnaire` is only for chat-style question-and-answer surveys, not setup wizards                                                                                                                                       |

## Content and data

| Need                                                      | Use                                                                                                                                                  |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Surface / panel / widget                                  | `Card` (`CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`)                                                     |
| KPI / stat tile                                           | `Card size='sm'` + `MetricText` (with `change` for trend)                                                                                            |
| Sortable, filterable, selectable table (client-side data) | `DataTable`                                                                                                                                          |
| Read-only list with search and pages (no row selection)   | `Table` family + `Pagination` + `InputGroup` search (DataTable's footer always shows a selection count)                                              |
| Server-paginated / server-sorted table                    | `Table` family + `Pagination` (`usePagination`)                                                                                                      |
| Simple static table                                       | `Table` family                                                                                                                                       |
| Expandable / tree rows, row detail panel                  | `TableRowGroup`, `TableExpandToggle`, `TableExpandedRow`, `TableDetailList` + `TableDetailItem label=…`, `TableTreeToggle`                           |
| List of rows with icon, title, actions                    | `ItemGroup` + `Item`                                                                                                                                 |
| Show/hide sections                                        | `Accordion` (many) / `Collapsible` + `CollapsiblePanel` (one)                                                                                        |
| Event history / activity feed                             | `Timeline`                                                                                                                                           |
| Status / count label                                      | `Badge`                                                                                                                                              |
| User picture                                              | `Avatar`, `AvatarGroup`                                                                                                                              |
| Dates and times in text                                   | `DateLabel`, `RelativeTime`                                                                                                                          |
| Numbers / money / percent                                 | `MetricText`, `formatMetric`                                                                                                                         |
| Image with loading/error states                           | `Image`                                                                                                                                              |
| Charts                                                    | `Chart` if the installed version exports it; otherwise keep/use the app's chart lib coloured with `var(--chart-1…12)` and mark `TODO(design-system)` |

## Forms

| Need                                                   | Use                                                                                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Labelled field + help + error                          | `Field`, `FieldLabel`, `FieldDescription`, `FieldError match`; stack with `flex flex-col gap-4`; side-by-side pair: `FieldGroup` |
| Checkbox/switch with inline label                      | `Field className='flex-row items-center gap-2'` + control + `FieldLabel`; rich rows `CheckboxCard`/`SwitchCard`                  |
| Text / email / password                                | `Input`; addons and icons: `InputGroup` + `InputGroupInput`, `InputGroupPasswordToggle`, `InputGroupClear`                       |
| Long text                                              | `Textarea` (`InputGroupTextarea` with addons)                                                                                    |
| Pick one from a short list                             | `Select` (≤ ~15 options) or `RadioGroup` (2–5, all visible)                                                                      |
| Pick from a long / searchable list, multi-select, tags | `Combobox`                                                                                                                       |
| On/off setting                                         | `Switch` (applies instantly) / `Checkbox` (submitted with a form)                                                                |
| Rich option cards                                      | `RadioCard`, `CheckboxCard`, `SwitchCard`                                                                                        |
| Date / range                                           | `DatePicker`, `DateRangePicker`, `CalendarPicker` (presets + timezone)                                                           |
| Time                                                   | `TimePicker`                                                                                                                     |
| Number in a range                                      | `Slider`                                                                                                                         |
| Verification code                                      | `OTPField`                                                                                                                       |
| File upload                                            | `FileUpload` (full flow) / `Dropzone` (just the drop area)                                                                       |
| Segmented control                                      | `ToggleGroup`                                                                                                                    |

## Actions and feedback

| Need                                    | Use                                                                         |
| --------------------------------------- | --------------------------------------------------------------------------- |
| Action                                  | `Button` (`loading` while pending)                                          |
| Joined buttons / split button           | `ButtonGroup`                                                               |
| Overflow "more" actions                 | `DropdownMenu` with an icon `Button` trigger                                |
| Right-click menu                        | `ContextMenu`                                                               |
| Confirm a destructive action            | `AlertDialog`                                                               |
| Modal task / form                       | `Dialog`                                                                    |
| Side panel / detail view / mobile sheet | `Drawer`                                                                    |
| Small anchored panel                    | `Popover`; on hover with rich content: `HoverCard`; plain hint: `Tooltip`   |
| Result of an action                     | `toast()` (`Toaster` mounted once)                                          |
| Inline message in a section             | `Alert`                                                                     |
| Page-wide announcement                  | `Banner`                                                                    |
| Loading                                 | `Skeleton` (content-shaped), `Spinner` (small inline), `Progress` (known %) |
| Keyboard key hint                       | `Kbd`                                                                       |

## Chat and AI

`Message`, `Bubble`, `PromptInput`, `Scroller`, `Suggestion`, `Sources`, `Tool`, `Marker`,
`Checkpoint`, `Attachment`. Use these for any assistant or chat surface; don't hand-build bubbles.

## Gap rule: when the DS has no component

1. Re-read this map and `llms.txt`: most "missing" components are a composition (empty state = `Item`/`Card` + icon + `Button`; page header = heading + `Breadcrumb` + `ButtonGroup`; stat tile = `Card` + `MetricText`).
2. Compose from DS parts and tokens in the app's own `components/` folder. Name it for what it is (`EmptyState`, `PageHeader`), keep it thin, and don't fork or copy DS source.
3. Never pull in another UI library to fill the gap.
4. If it's generic enough that other apps will need it, tell the developer it's a candidate for the design system. Don't open issues or PRs; just list it in your summary.
