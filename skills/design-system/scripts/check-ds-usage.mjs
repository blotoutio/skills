#!/usr/bin/env node
// Scan app code for UI that bypasses @blotoutio/design-system.
//
// Usage: node check-ds-usage.mjs <file-or-dir> [...more]
//        (no args: scans whichever of src/ app/ components/ pages/ exist)
// Exit:  0 = no errors (warnings allowed), 1 = errors, 2 = nothing scanned / bad path (never a false green).
// Escape: `ds-allow: <reason>` in a comment on the line or the line above accepts a hit.
//         Every ds-allow is printed so it can be listed in the report.
// Zero dependencies. Node 18+.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'

const CODE = new Set(['.tsx', '.jsx', '.ts', '.js', '.mjs', '.cjs', '.mdx'])
const STYLE = new Set(['.css', '.scss', '.sass', '.less'])
const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  'out',
  '.next',
  '.nuxt',
  'coverage',
  '.git',
  'storybook-static',
  '.turbo',
])
const PALETTE =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
const UTIL =
  'bg|text|border|border-[trblxy]|ring|ring-offset|fill|stroke|from|to|via|outline|divide|placeholder|accent|caret|decoration|shadow'
const NAMED_COLOURS =
  'red|blue|green|yellow|orange|purple|pink|gray|grey|black|white|tomato|navy|teal|silver|maroon|olive|lime|aqua|fuchsia|crimson|gold|coral|salmon|indigo|violet'

const P = '[^\'"]'
const ERROR_PKGS = [
  `@radix-ui/${P}+`,
  '@base-ui/react',
  `@base-ui-components/${P}+`,
  `@mui/${P}+`,
  `@material-ui/${P}+`,
  'antd',
  `@ant-design/${P}+`,
  `@chakra-ui/${P}+`,
  `@headlessui/${P}+`,
  'react-bootstrap',
  'bootstrap',
  `@mantine/${P}+`,
  `@nextui-org/${P}+`,
  `@heroui/${P}+`,
  'primereact',
  '@tremor/react',
  'lucide-react',
  'react-icons',
  `@heroicons/${P}+`,
  '@tabler/icons-react',
  `@phosphor-icons/${P}+`,
  'sonner',
  'react-hot-toast',
  'react-toastify',
  'notistack',
  'vaul',
  'cmdk',
  'react-select',
  'react-datepicker',
  'react-day-picker',
  'styled-components',
  `@emotion/${P}+`,
]
const WARN_PKGS = ['class-variance-authority', 'tailwind-merge', 'clsx']
const importRe = (pkgs) =>
  new RegExp(
    `(?:from\\s+|import\\s*\\(?\\s*|require\\(\\s*)['"]((?:${pkgs.join('|')}))(?:/[^'"]*)?['"]`,
    'g',
  )
const IMPORT_ERR = importRe(ERROR_PKGS)
const IMPORT_WARN = importRe(WARN_PKGS)
const LOCAL_UI_RE =
  /(?:from\s+|import\s*\(?\s*)['"]([^'"]*\/components\/ui(?:\/[^'"]*)?)['"]/g

// Arbitrary values: selectors/variants and layout-only utilities are fine; sizes warn; colour/spacing/type error.
const ARBITRARY_RE =
  /(?<![\w-])((?:[a-z0-9-]+:)*)(-?[a-z][a-z0-9-]*)-\[([^\]\s]+)\]/g
const ARBITRARY_OK =
  /^(grid-cols|grid-rows|col-span|row-span|col-start|row-start|aspect|z|content|animate|transition|duration|ease|delay|will-change|cursor|columns|order|line-clamp|font-feature|supports|data|aria|group-data|peer-data|has|group-has|nth|not|in|group|peer)$/
const ARBITRARY_SIZE =
  /^(w|h|min-w|max-w|min-h|max-h|size|basis|top|left|right|bottom|inset|inset-[xy]|start|end|translate-[xy]|scale|rotate)$/

// Opening JSX tag starting at `start` (index of '<'); respects {} and quotes so `=>` / `>` inside props don't end it.
function openingTag(text, start) {
  let depth = 0
  let quote = null
  for (let i = start + 1; i < text.length; i++) {
    const c = text[i]
    if (quote) {
      if (c === quote && text[i - 1] !== '\\') quote = null
      continue
    }
    if (c === '"' || c === "'" || c === '`') {
      quote = c
      continue
    }
    if (c === '{') depth++
    else if (c === '}') depth--
    else if (c === '>' && depth === 0) return text.slice(start, i + 1)
  }
  return text.slice(start)
}

function walk(p, out) {
  const st = statSync(p)
  if (st.isDirectory()) {
    for (const name of readdirSync(p))
      if (!SKIP_DIRS.has(name)) walk(join(p, name), out)
  } else {
    const ext = extname(p)
    if (CODE.has(ext) || STYLE.has(ext)) out.push(p)
  }
}

let targets = process.argv.slice(2)
if (!targets.length) {
  targets = ['src', 'app', 'components', 'pages'].filter((d) => existsSync(d))
  if (!targets.length) {
    console.error(
      'No target given and none of src/ app/ components/ pages/ exist. Pass paths explicitly.',
    )
    process.exit(2)
  }
}
const missing = targets.filter((t) => !existsSync(t))
if (missing.length) {
  console.error(`Path(s) not found: ${missing.join(', ')}`)
  process.exit(2)
}
const files = []
for (const t of targets) walk(t, files)
if (!files.length) {
  console.error(`No code or style files under: ${targets.join(', ')}`)
  process.exit(2)
}

const lineOf = (text, idx) => text.slice(0, idx).split('\n').length
let errors = 0
let warns = 0
const allows = []

for (const file of files) {
  const ext = extname(file)
  const isStyle = STYLE.has(ext)
  const raw = readFileSync(file, 'utf8')
  // Blank out comments (keeping offsets and newlines) so commented-out code isn't reported.
  const text = isStyle
    ? raw.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    : raw.replace(
        /\{\/\*[\s\S]*?\*\/\}|\/\*[\s\S]*?\*\/|(?<![:'"`\\])\/\/[^\n]*/g,
        (m) => m.replace(/[^\n]/g, ' '),
      )
  const lines = raw.split('\n')
  const hasJsx =
    ext === '.tsx' ||
    ext === '.jsx' ||
    ext === '.mdx' ||
    (ext === '.js' && /return\s*\(?\s*<[A-Za-z]/.test(text))
  const seen = new Set()

  const report = (idx, id, level, msg) => {
    const ln = lineOf(text, idx)
    const key = `${ln}:${id}`
    if (seen.has(key)) return
    seen.add(key)
    const here = lines[ln - 1] ?? ''
    const above = lines[ln - 2] ?? ''
    const allow =
      here.match(/ds-allow:?\s*([^*}]*)/) ||
      above.match(/ds-allow:?\s*([^*}]*)/)
    if (allow) {
      allows.push(`${file}:${ln} [${id}] ${allow[1].trim()}`)
      return
    }
    if (level === 'warn') warns++
    else errors++
    console.log(
      `${file}:${ln}  ${level === 'warn' ? 'warn ' : 'error'} [${id}] ${msg}\n    ${here.trim().slice(0, 160)}`,
    )
  }
  const each = (re, fn) => {
    for (const m of text.matchAll(re)) fn(m)
  }

  if (isStyle) {
    each(
      /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color-mix)\(/g,
      (m) =>
        report(
          m.index,
          'colour-literal',
          'error',
          'colour literal in app CSS; use theme tokens (var(--…)) and never redefine theme colours',
        ),
    )
    each(
      new RegExp(
        `(?<![\\w-])(?:[a-z-]+:)*(?:${UTIL})-(?:${PALETTE})-(?:50|[1-9]00|950)(?![\\w-])`,
        'g',
      ),
      (m) =>
        report(
          m.index,
          'palette-colour',
          'error',
          'Tailwind palette colour in @apply; use a semantic token',
        ),
    )
    each(
      new RegExp(
        `\\b(?:color|background(?:-color)?|border(?:-[a-z]+)?-color|border|fill|stroke|outline)\\s*:[^;{}]*\\b(?:${NAMED_COLOURS})\\b`,
        'gi',
      ),
      (m) =>
        report(
          m.index,
          'named-colour',
          'error',
          'named colour in CSS; use a theme token',
        ),
    )
    each(
      /\b(?:padding|margin|gap|row-gap|column-gap)(?:-[a-z]+)?\s*:\s*[^;{}]*\b\d+(?:\.\d+)?px/g,
      (m) =>
        report(
          m.index,
          'css-spacing',
          'warn',
          'px spacing in CSS; move layout to Tailwind classes on the scale',
        ),
    )
  } else {
    const isTypeOnly = (idx) =>
      /import\s+type\b[^;]*$/.test(
        text.slice(text.lastIndexOf('import', idx), idx),
      )
    each(IMPORT_ERR, (m) => {
      if (!isTypeOnly(m.index))
        report(
          m.index,
          'foreign-ui-import',
          'error',
          `import from ${m[1]}; use @blotoutio/design-system`,
        )
    })
    each(IMPORT_WARN, (m) =>
      report(
        m.index,
        'styling-helper-import',
        'warn',
        `${m[1]}: use cn from @blotoutio/design-system; for variants map props to class strings unless the component really needs CVA`,
      ),
    )
    each(LOCAL_UI_RE, (m) =>
      report(
        m.index,
        'local-ui-kit',
        'error',
        `local components/ui import (${m[1]}); use @blotoutio/design-system`,
      ),
    )
    each(/\basChild\b/g, (m) =>
      report(
        m.index,
        'as-child',
        'error',
        'asChild is Radix; use render={<El />}',
      ),
    )

    // Colour literals in code: only in string/className/style/colour contexts; skip in-page anchors.
    each(
      /(?<![\w&/?=-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b(?![\w-])|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color-mix)\(/g,
      (m) => {
        const line = text.split('\n')[lineOf(text, m.index) - 1]
        if (m[0].startsWith('#')) {
          if (new RegExp(`(?:href|to)=\\{?['"\`][^'"\`]*${m[0]}`).test(line))
            return
          if (
            !/(['"`]|className|style|color|fill|stroke|background)/.test(line)
          )
            return
        }
        report(
          m.index,
          'colour-literal',
          'error',
          'colour literal; use a theme token',
        )
      },
    )
    each(
      new RegExp(
        `(?<![\\w-])(?:[a-z0-9-]+:)*(?:${UTIL})-(?:${PALETTE})-(?:50|[1-9]00|950)(?:/\\d+)?(?![\\w-])|(?<![\\w-])(?:[a-z0-9-]+:)*(?:bg|text|border)-(?:white|black)(?:/\\d+)?(?![\\w-])`,
        'g',
      ),
      (m) =>
        report(
          m.index,
          'palette-colour',
          'error',
          'Tailwind palette colour; use a semantic token (bg-background, text-muted-foreground, border-border, ...)',
        ),
    )
    // Dynamic colour classes: `bg-${x}-500`, or a variable named like a colour.
    each(new RegExp(`(?:${UTIL})-\\$\\{([^}]+)\\}(-\\d{2,3})?`, 'g'), (m) => {
      if (m[2] || /tone|colou?r|variant|status|intent|palette|hue/i.test(m[1]))
        report(
          m.index,
          'dynamic-palette',
          'error',
          'dynamically built colour class; map values to token classes explicitly',
        )
    })
    each(ARBITRARY_RE, (m) => {
      const [, variants, util, value] = m
      if (ARBITRARY_OK.test(util)) return
      const at = m.index + variants.length
      if (
        /^(?:var\(--|--|theme\()/.test(value) &&
        !/^(?:p[trblxyse]?|m[trblxyse]?|gap(?:-[xy])?|space-[xy])$/.test(util)
      )
        return
      if (ARBITRARY_SIZE.test(util)) {
        if (
          /^(?:\d+(?:\.\d+)?(?:%|vh|vw|svh|dvh|lvh|ch|fr)|calc\(.*\)|var\(--[\w-]+\)|--[\w-]+)$/.test(
            value,
          )
        )
          return
        report(
          at,
          'arbitrary-size',
          'warn',
          `fixed size ${util}-[${value}]; prefer the scale or max-w-*; keep with ds-allow when it's a real constraint`,
        )
        return
      }
      report(
        at,
        'arbitrary-value',
        'error',
        `arbitrary value ${util}-[${value}]; use the scale or a token`,
      )
    })
    each(/(?<![\w-])(?:[a-z-]+:)*bg-(?:gradient|linear|radial|conic)-/g, (m) =>
      report(
        m.index,
        'gradient',
        'warn',
        'gradient; Blotout surfaces are flat',
      ),
    )
    each(
      /(?<![\w-])font-(?:bold|extrabold|black|light|thin|extralight)(?![\w-])/g,
      (m) =>
        report(
          m.index,
          'heavy-type',
          'warn',
          'off-scale weight; use font-normal / font-medium / font-semibold',
        ),
    )
    each(/(?<![\w-])rounded-(?:2xl|3xl|4xl)(?![\w-])/g, (m) =>
      report(
        m.index,
        'big-radius',
        'warn',
        'large radius; surfaces use Card / rounded-lg',
      ),
    )

    if (hasJsx) {
      each(/<(button|input|select|textarea|table)\b(?=[\s/>])/g, (m) => {
        const tag = openingTag(text, m.index)
        if (m[1] === 'input' && /type=\{?['"](?:hidden)['"]/.test(tag)) return
        if (
          /render=\{\s*$/.test(text.slice(Math.max(0, m.index - 12), m.index))
        )
          return // render={<button />} on a DS part is the Base UI pattern
        report(
          m.index,
          'raw-control',
          'error',
          `raw <${m[1]}>; use Button / Field+Input / Select / Textarea / Table`,
        )
      })
      each(/<(img|progress|dialog)\b(?=[\s/>])/g, (m) =>
        report(
          m.index,
          'raw-element',
          'warn',
          `raw <${m[1]}>; DS has Image / Progress / Dialog`,
        ),
      )
      each(
        /<(?:(?:DropdownMenu|ContextMenu|Menubar)(?:Checkbox|Radio)?Item|CommandItem)\b/g,
        (m) => {
          if (/\bonSelect=/.test(openingTag(text, m.index)))
            report(
              m.index,
              'menu-onselect',
              'error',
              'onSelect on a Base UI menu/command item never fires; use onClick',
            )
        },
      )
      each(/<Button\b/g, (m) => {
        const tag = openingTag(text, m.index)
        if (
          /\brender=\{\s*<(?!button\b)[A-Za-z]/.test(tag) &&
          !/\bnativeButton=/.test(tag)
        )
          report(
            m.index,
            'button-native',
            'error',
            'Button rendering a non-button needs nativeButton={false} (or use buttonVariants on the link)',
          )
      })
      each(/style=\{\{/g, (m) => {
        const tag = openingTag(text, text.lastIndexOf('<', m.index))
        const obj = tag.slice(tag.indexOf('style={{'))
        const props = [
          ...obj.matchAll(
            /\b(color|background|backgroundColor|border\w*|margin\w*|padding\w*|gap|rowGap|columnGap|borderRadius|fontSize|fontWeight|fontFamily|boxShadow|lineHeight)\s*:\s*([^,}]+)/g,
          ),
        ]
        if (props.some(([, , v]) => !/var\(--/.test(v)))
          report(
            m.index,
            'inline-style',
            'error',
            'inline style for colour/spacing/type; use classes and tokens (var(--token) values are fine)',
          )
      })
    }
  }
}

console.log(`\nScanned ${files.length} file(s) under: ${targets.join(', ')}`)
console.log(
  `${errors} error(s), ${warns} warning(s), ${allows.length} ds-allow exception(s).`,
)
if (allows.length)
  console.log(
    `ds-allow exceptions (list these in your report):\n  ${allows.join('\n  ')}`,
  )
process.exit(errors ? 1 : 0)
