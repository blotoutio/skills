// Self-test for check-ds-usage.mjs: node test-check.mjs
// Fixtures are stored as *.txt so they never get type-checked inside an app repo; they're copied to a temp dir to scan.
import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdtempSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const tmp = mkdtempSync(join(here, '.fixtures-'))
for (const f of ['good.tsx', 'bad.tsx', 'bad.css'])
  copyFileSync(join(here, 'fixtures', `${f}.txt`), join(tmp, f))
const run = (...args) =>
  spawnSync(process.execPath, [join(here, 'check-ds-usage.mjs'), ...args], {
    encoding: 'utf8',
  })
let failed = 0
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : `\n${detail}`}`)
  if (!ok) failed++
}

try {
  const good = run(join(tmp, 'good.tsx'))
  check(
    'good.tsx: 0 errors, 0 warnings (exit 0)',
    good.status === 0 && /0 error\(s\), 0 warning/.test(good.stdout),
    good.stdout,
  )
  check(
    'good.tsx lists its ds-allow',
    /1 ds-allow/.test(good.stdout),
    good.stdout,
  )

  const bad = run(join(tmp, 'bad.tsx'))
  check('bad.tsx fails (exit 1)', bad.status === 1, bad.stdout)
  for (const id of [
    'foreign-ui-import',
    'styling-helper-import',
    'local-ui-kit',
    'as-child',
    'raw-control',
    'raw-element',
    'colour-literal',
    'palette-colour',
    'dynamic-palette',
    'inline-style',
    'arbitrary-value',
    'arbitrary-size',
    'gradient',
    'heavy-type',
    'big-radius',
    'button-native',
  ]) {
    check(`bad.tsx reports ${id}`, bad.stdout.includes(`[${id}]`), bad.stdout)
  }
  check(
    'bad.tsx reports both onSelect cases (props with > and => before onSelect)',
    (bad.stdout.match(/\[menu-onselect\]/g) || []).length === 2,
    bad.stdout,
  )

  const css = run(join(tmp, 'bad.css'))
  check(
    'bad.css: token overrides, @apply palette, named colour, px spacing',
    css.status === 1 &&
      (css.stdout.match(/\[colour-literal\]/g) || []).length === 2 &&
      ['palette-colour', 'named-colour', 'css-spacing'].every((id) =>
        css.stdout.includes(`[${id}]`),
      ),
    css.stdout,
  )

  check('missing path exits 2', run(join(here, 'fixtures/nope')).status === 2)
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed')
process.exit(failed ? 1 : 0)
