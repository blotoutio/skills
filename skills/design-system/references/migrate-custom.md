# Hand-written, Claude-generated and other UI → DS

## Raw HTML and hand-rolled widgets

| Old                                                 | DS                                                                                                               |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `<button>`                                          | `Button` (pick the variant by role, not by old colour)                                                           |
| `<input>` + `<label>`                               | `Field` + `FieldLabel` + `Input` (checkbox: `Field className='flex-row items-center gap-2'`)                     |
| `<select>`                                          | `Select` (`items`); keep native behaviour with `NativeSelect`                                                    |
| `<textarea>`                                        | `Textarea`                                                                                                       |
| `<table>`                                           | `Table` family, or `DataTable` for sortable/filterable data                                                      |
| Error `<p className="text-red-…">` under a field    | `<FieldError match={!!error}>` inside `<Field invalid={!!error}>`                                                |
| Toggle built from `button` + sliding `span`         | `Switch`                                                                                                         |
| Clickable selectable cards (radio-like)             | `RadioGroup` + `RadioCard`                                                                                       |
| Multi-select cards                                  | `CheckboxGroup` + `CheckboxCard`                                                                                 |
| Modal (`fixed inset-0` overlay + box)               | `Dialog`; confirm/cancel of something destructive → `AlertDialog` (Title + Description inside `AlertDialogText`) |
| Dropdown (`absolute` list + open state)             | `DropdownMenu` (actions) or `Select`/`Combobox` (values)                                                         |
| Custom toast/snackbar state + `fixed bottom-…` div  | `toast()` + `<Toaster />` at the root; delete the state                                                          |
| `animate-spin` div/SVG                              | `Spinner`, or `Button loading` when it's inside a button                                                         |
| Status pill `span` with colour classes              | `Badge` by meaning, not by old colour (a green "Popular" tag is `secondary`, not `success`)                      |
| Bordered + rounded + padded `div` panel             | `Card` (`CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter`)                                   |
| Coloured info/warning box (`bg-yellow-50 …`)        | `Alert variant='warning'` (`default`/`destructive`/`success`)                                                    |
| Page-wide notice bar                                | `Banner`                                                                                                         |
| Tab buttons with an underline                       | `Tabs` + `TabsList variant='line'`                                                                               |
| Hand-made pagination                                | `Pagination`                                                                                                     |
| `<a>` styled with palette colours (`text-blue-600`) | token-styled link (classes in [component-map.md](component-map.md), "Inline text link")                          |
| `toLocaleString`/`Intl.NumberFormat` money in JSX   | `MetricText` / `formatMetric` (⚠️ percent takes 12.6, not 0.126)                                                 |
| `toLocaleDateString` in JSX                         | `DateLabel` / `RelativeTime`                                                                                     |
| Emoji or inline SVG icons                           | Lucide icons from the DS                                                                                         |

## Claude-generated look → Blotout look

| Pattern                                                                | Fix                                                                        |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Palette colours (`bg-blue-600`, `text-gray-500`, `border-gray-200`)    | tokens by meaning ([tokens.md](tokens.md))                                 |
| Gradients (`bg-gradient-to-*`, `bg-linear-*`), glass, coloured shadows | remove; neutral surfaces                                                   |
| `shadow-xl`/`shadow-2xl` on resting cards                              | `Card` (border, no heavy shadow)                                           |
| `rounded-2xl`/`rounded-3xl` panels                                     | `Card` / `rounded-lg`                                                      |
| Emoji in headings and labels (💳 ⚠️ ✓)                                 | remove, or a Lucide icon where it carries meaning                          |
| Several coloured buttons                                               | one `default`; others `outline`/`ghost`; destructive via `AlertDialog`     |
| `text-4xl font-bold` page titles                                       | `text-2xl font-semibold tracking-tight`                                    |
| Exclamation marks, Title Case buttons                                  | sentence case, no `!` (copy changes only where it's styling, keep meaning) |
| Full-viewport gradient page background                                 | `bg-background` (the app shell provides it)                                |
| `w-[420px]`-style fixed sizes                                          | DS component sizing or `max-w-*` scale                                     |

## Styling libraries

| Old                                    | DS                                                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| styled-components / emotion `styled.x` | delete the styled wrapper; DS component + Tailwind layout classes                                      |
| CSS modules / Sass                     | move layout to Tailwind classes, delete colour/spacing rules; keep only what has no utility equivalent |
| Theme objects (`theme.colors.primary`) | DS tokens; delete the theme once unused                                                                |

## Other kits

Chakra, Headless UI, React Bootstrap, Mantine, NextUI/HeroUI, PrimeReact: map each component by role
with [component-map.md](component-map.md), using the shadcn/MUI tables as the pattern. Notification
libs (`react-hot-toast`, `react-toastify`) → `toast()`. `react-select` → `Combobox`.
`react-datepicker` → `DatePicker`.
