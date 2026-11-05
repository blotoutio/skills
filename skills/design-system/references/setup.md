# Setup: wire the design system into an app

Do only the steps that are missing. Check first, then change.

## 1. Install

```sh
npm install @blotoutio/design-system
```

Peer deps: `react` and `react-dom` 19. If the app is on React 18, stop before editing and report it:
the DS needs React 19, and upgrading React is the developer's call (unattended: preflight report, end the run).

Don't install `lucide-react`, `@radix-ui/*`, `sonner`, `class-variance-authority` or `tailwind-merge`
for UI work; the DS brings what it needs and re-exports `cn` and icons.

## 2. Styles

**Tailwind v4 app (recommended).** In the main stylesheet:

```css
@import 'tailwindcss';
@import '@blotoutio/design-system/theme.css';
```

This gives the app the DS tokens as Tailwind classes, generates the classes DS components use, and
adds the `dark` variant.

**Tailwind v3 app.** Stop before editing anything and report it. The theme needs Tailwind v4, and
mixing v3 with the precompiled `styles.css` breaks DS styles (v3's unlayered base rules override the
DS's layered ones). The fix is upgrading to v4 (`npx @tailwindcss/upgrade`), which is the developer's
decision. In an unattended run, write this into the preflight report and end the run.

**No Tailwind at all.** Same as Tailwind v3: stop before editing and report it. BUILD and MIGRATE lay
pages out with Tailwind classes, and adding Tailwind is the developer's call; don't install it or edit
vite/postcss config. The precompiled stylesheet is only for dropping a few DS components into a page
that will never use Tailwind:

```ts
import '@blotoutio/design-system/styles.css'
```

It contains only the classes the DS itself uses, so app layout classes like `gap-6` won't work with it.

Never import both `theme.css` and `styles.css`.

If the app has an old shadcn `globals.css` with `:root { --background: … }` blocks, remove those token
blocks after importing `theme.css`; they override the DS tokens. Keep app-specific rules.

## 3. Font

The theme uses Inter Variable but doesn't ship the font files.

```sh
npm install @fontsource-variable/inter
```

```ts
import '@fontsource-variable/inter'
```

## 4. App root

<!-- prettier-ignore -->
```tsx
import { Toaster, TooltipProvider } from '@blotoutio/design-system'

<TooltipProvider>
  <App />
  <Toaster />
</TooltipProvider>
```

Set the base text size once on the app root (the theme leaves `body` at 16px):
`<div className='min-h-svh bg-background font-sans text-sm text-foreground antialiased'>`.

Dark mode: toggle the `dark` class on `<html>` (theme toggle snippet in build.md).

**Next.js App Router:** put the CSS imports in `app/globals.css`, mount `Toaster`/`TooltipProvider` in
a `'use client'` providers component used by `app/layout.tsx`. DS components render from server
components, but helper calls (`cn`, `buttonVariants`, `formatMetric`) belong in client files.

## Verify setup

- `@blotoutio/design-system` is in the app's `package.json`; note its version.
- Render a `<Button>`: it should be dark-filled with rounded corners and Inter text. Unstyled = CSS import missing. Styled but wrong colours = old token overrides still present.
