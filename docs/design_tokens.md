# Design Tokens

## Purpose

This document establishes the initial design token direction for the notebook UI.

Tokens are implemented through **Tailwind CSS** and the **shadcn/ui** theme (`src/shared/ui/`, CSS variables in global styles). shadcn primitives are customized here—not replaced by a second component framework. See `libs.md` for install commands (`pnpm dlx shadcn@latest …`).

## Typography

Recommended type roles:

- `font-sans`: default UI font for controls and navigation
- `font-mono`: code and technical values
- `font-reading`: notebook text content if a distinct reading face is introduced later

Guidance:

- keep notebook reading highly legible
- keep code blocks clearly distinct from text blocks
- prefer moderate line height over dense compact typography

## Colors

Recommended token groups:

- `color-bg-app`
- `color-bg-surface`
- `color-bg-editor`
- `color-border-default`
- `color-border-strong`
- `color-text-primary`
- `color-text-secondary`
- `color-text-muted`
- `color-accent-primary`
- `color-accent-danger`
- `color-accent-warning`
- `color-accent-success`

Guidance:

- avoid generic purple-first defaults
- keep outputs and status states visually distinct
- maintain sufficient contrast for text and controls

## Spacing

Recommended spacing scale:

- `space-2`
- `space-4`
- `space-8`
- `space-12`
- `space-16`
- `space-24`
- `space-32`

Usage:

- small inline controls use smaller spacing tokens
- block layout and page sections use larger spacing tokens

## States

Every user-facing flow should define tokens for:

- loading
- empty
- error
- success
- disabled
- conflict

Conflict should be visually distinct from generic error.

## Block Chrome

Recommended block tokens:

- `block-radius`
- `block-padding`
- `block-gap`
- `block-border`
- `block-bg`
- `block-hover-shadow`
- `block-selected-ring`

Guidance:

- block action cluster should feel local to the block
- code and text blocks should share a family resemblance but remain visually distinguishable
- outputs should feel attached to the originating code block

## Tailwind Mapping

Product tokens in `:root` (`app/styles/index.css`) are exposed to components through `tailwind.config.js`:

| CSS variable             | Tailwind utility examples                      |
| ------------------------ | ---------------------------------------------- |
| `--color-bg-app`         | `bg-app`, `bg-surface-muted`                   |
| `--color-bg-surface`     | `bg-surface`                                   |
| `--color-bg-editor`      | `bg-editor`                                    |
| `--color-border-default` | `border-border-token`, `divide-border-token`   |
| `--color-border-strong`  | `border-border-strong`                         |
| `--color-text-primary`   | `text-ink`                                     |
| `--color-text-secondary` | `text-ink-secondary`                           |
| `--color-text-muted`     | `text-ink-muted`                               |
| `--color-accent-primary` | `text-accent-primary`, `border-accent-primary` |
| `--color-accent-danger`  | `text-accent-danger`                           |
| `--space-*`              | `p-token-16`, `gap-token-8`, and similar       |

Prefer these utilities in `pages/*/ui/`, `features/*/ui/`, `entities/*/ui/`, and `app/ui/` instead of hard-coded hex colors or ad hoc `var(--color-*)` in JSX.

Block chrome tokens (`--block-radius`, `--block-padding`, `--block-gap`, and related) remain available as CSS variables for layout that spans multiple elements.

## shadcn Integration

- Map token groups above to Tailwind theme extensions and shadcn CSS variables (`--background`, `--foreground`, `--primary`, `--destructive`, and related tokens).
- shadcn components in this repo use the **`new-york`** style and **Radix UI** packages (for example `@radix-ui/react-slot` on `Button`).
- Add shadcn components only through `pnpm dlx shadcn@latest add <component>`; keep files under `shared/ui/`.
- Prefer composing shadcn primitives in feature or entity `ui/` segments for notebook-specific chrome (block toolbar, sync banner, login form).
- Do not import shadcn internals from deep paths outside `shared/ui/` public API.

## Accessibility Rules

- keyboard access to every block action
- visible focus states
- control labels for icon-only buttons
- status messages readable by assistive technologies where needed
- sufficient contrast for text, borders, and interactive controls

## Responsive Rules

- preserve vertical notebook flow on mobile
- move block action cluster into a compact inline presentation on narrow screens
- avoid fixed split layouts in Version 1
