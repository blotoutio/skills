# MUI → DS

Remove `sx`, `styled()`, theme overrides and `Box`/`Stack`/`Grid` in favour of `div` + Tailwind
flex/grid + `gap-*`. Check every DS prop in the installed package's type definitions
(https://design.blotout.io/api.md is the quick reference).

| MUI                                                       | DS                                                                                                                                                    |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button variant="contained" / "outlined" / "text"`        | `Button variant='default' / 'outline' / 'ghost'`                                                                                                      |
| `Button color="error"`                                    | `Button variant='destructive'`                                                                                                                        |
| `LoadingButton loading`                                   | `Button loading`                                                                                                                                      |
| `IconButton`                                              | `Button size='icon'` + `aria-label`                                                                                                                   |
| `TextField` (label, helperText, error)                    | `Field invalid` + `FieldLabel` + `Input` + `FieldDescription` / `FieldError match`                                                                    |
| `TextField multiline`                                     | `Textarea` in `Field`                                                                                                                                 |
| `TextField InputProps.startAdornment`                     | `InputGroup` + icon (`className='size-4 shrink-0 text-muted-foreground'`) + `InputGroupInput`                                                         |
| `Select` + `MenuItem`                                     | `Select` + `SelectItem` (pass `items`)                                                                                                                |
| `Autocomplete`                                            | `Combobox` (`multiple` for chips)                                                                                                                     |
| `Checkbox`, `Switch`, `Radio`/`RadioGroup`, `Slider`      | same names; `onChange(e)` → `onCheckedChange` / `onValueChange`                                                                                       |
| `FormControlLabel`                                        | `Field className='flex-row items-center gap-2'` + control + `FieldLabel`, or `CheckboxCard`/`SwitchCard`                                              |
| `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions` | `Dialog`, `DialogHeader`+`DialogTitle`, `DialogBody`, `DialogFooter` (`open`/`onOpenChange`)                                                          |
| `Drawer anchor="right"`                                   | `Drawer direction='right'`                                                                                                                            |
| `Menu` + `MenuItem onClick`                               | `DropdownMenu` + `DropdownMenuItem onClick`                                                                                                           |
| `Snackbar` / `notistack`                                  | `toast()`                                                                                                                                             |
| `Alert severity="error/warning/success/info"`             | `Alert variant='destructive'/'warning'/'success'/'default'`                                                                                           |
| `Chip`                                                    | `Badge`; deletable chip in an input → `ComboboxChip`; elsewhere `Badge` + ghost icon `Button`                                                         |
| `Badge badgeContent` (count on icon/avatar)               | `AvatarBadge` / `BadgeDot`, or a `Badge type='number'` beside the icon                                                                                |
| `Avatar`, `AvatarGroup`                                   | `Avatar` + `AvatarImage` + `AvatarFallback`, `AvatarGroup`                                                                                            |
| `Tooltip title`                                           | `Tooltip` + `TooltipTrigger render` + `TooltipContent`                                                                                                |
| `Tabs` + `Tab`                                            | sub-pages of the app → header tabs (`PageHeaderTabs`); in a section → `Tabs` + `TabsList` + `TabsTrigger` + `TabsContent`                             |
| `Accordion expanded/onChange`                             | `Accordion value={[id]} onValueChange` (arrays)                                                                                                       |
| `CircularProgress`                                        | `Spinner`                                                                                                                                             |
| `LinearProgress`                                          | `Progress`                                                                                                                                            |
| `Skeleton`                                                | `Skeleton`                                                                                                                                            |
| `Stepper` + `Step`                                        | `Stepper`                                                                                                                                             |
| `Pagination`                                              | `Pagination`                                                                                                                                          |
| `Table*`                                                  | bordered `Table*` with no `Card` (shared app table, build.md)                                                                                         |
| `DataGrid` (client data)                                  | `BorderedDataTable` (build.md); server mode → bordered `Table` + `Pagination`                                                                         |
| `Card`, `CardHeader`, `CardContent`, `CardActions`        | `Card`, `CardHeader`, `CardContent`, `CardFooter`; a titled section card → heading row above a plain `Card`; settings cards → settings section rows   |
| `Paper`                                                   | `Card`, or `div` with `rounded-lg border border-border bg-card`                                                                                       |
| `Divider`                                                 | `Separator`                                                                                                                                           |
| `List` + `ListItem`                                       | `ItemGroup` + `Item`                                                                                                                                  |
| `Breadcrumbs`                                             | `Breadcrumb`                                                                                                                                          |
| `AppBar` + `Toolbar`                                      | `Navbar`                                                                                                                                              |
| `Drawer variant="permanent"` (nav)                        | `Sidebar`                                                                                                                                             |
| `Typography variant="h4/h6/body2/caption"`                | the type roles in [tokens.md](tokens.md) on plain elements                                                                                            |
| `@mui/icons-material`                                     | closest Lucide icon from the DS. ⚠️ `DeleteIcon` → `TrashIcon`, `EditIcon` → `PencilIcon` (Lucide's own `DeleteIcon`/`EditIcon` are different glyphs) |
| `DatePicker` (`@mui/x-date-pickers`)                      | `DatePicker` / `DateRangePicker`                                                                                                                      |
