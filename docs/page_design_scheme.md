# Page Design Scheme

## Purpose

This document captures the current page design scheme used outside the notebook editor and defines how the notebook editor should align with it.

Scope analyzed:

- `/login`
- `/notebooks`
- shared app shell components

Out of scope for analysis:

- `/notebooks/:notebookId` existing editor design

## Source Pages

### App Shell

The application shell uses a quiet product UI:

- fixed-height top header: `h-14`
- white header surface: `bg-surface`
- subtle divider: `border-ink/10`
- compact horizontal padding: `px-6`
- muted navigation links with hover contrast
- no decorative page chrome

The shell establishes a restrained SaaS/work-tool tone. Pages should feel operational and scannable instead of editorial.

### Login Page

The login page uses:

- centered single-purpose form layout
- muted page background: `bg-surface-muted`
- white card surface: `bg-surface`
- thin low-contrast border: `border-ink/10`
- small radius: `rounded-lg`
- compact spacing: `p-6`, `space-y-3`
- primary action with blue accent
- secondary action as bordered white button
- explicit error text with `role="alert"`

### Notebook List Page

The notebook list page uses:

- centered content width: `max-w-3xl`
- simple page padding: `p-6`
- compact page header with title and primary action
- system sans typography
- bordered list container with subtle dividers
- empty, loading, and error states rendered inline

## Design Tokens In Use

The active implementation uses the Tailwind token layer from `tailwind.config.js`:

| Token | Value | Usage |
|---|---:|---|
| `surface` | `#ffffff` | cards, header, controls |
| `surface-muted` | `#f7f7f5` | page background |
| `ink` | `#1f1f1f` | primary text |
| `ink-muted` | `#6b6b6b` | secondary text |
| `accent` | `#2563eb` | primary actions and focus accents |

Global CSS also defines semantic CSS variables. For editor-specific CSS, prefer the project-level semantic variables only when they are aligned to the active Tailwind scheme. Do not introduce a separate warm or decorative palette for one page.

## Typography

Page typography should remain system sans:

- page title: `text-2xl font-semibold`
- card/form title: `text-xl font-semibold`
- labels and metadata: `text-sm text-ink-muted`
- body/list text: `text-sm`
- code text: monospace only inside code-editing surfaces

Avoid:

- serif display headings
- oversized hero typography inside product pages
- negative letter spacing
- uppercase decorative labels except compact technical metadata

## Layout Rules

All pages should use:

- muted app background
- white surfaces for editable or actionable regions
- compact, predictable spacing
- visible but subtle borders
- page widths based on content density

Recommended page widths:

- forms: `max-w-sm`
- notebook list: `max-w-3xl`
- notebook editor document: `max-w-5xl` equivalent, with a narrower block content column inside when needed

## Controls

Controls should follow the shared button language:

- primary: blue filled action
- secondary: white surface with subtle border
- disabled: muted text, no hover emphasis
- focus-visible: clear accent outline

Editor CSS must scope button rules under the editor root. It must not redefine global `button` styles.

## State Patterns

Every user-facing page should provide explicit states:

- loading
- empty
- error
- success when the action has a visible result
- disabled controls where actions are unavailable

For the editor:

- sync, run-all, and export placeholders may be disabled until implemented
- execution placeholder output should stay visibly attached to the code block
- error and conflict states should be visually distinct when those flows are implemented

## Notebook Editor Recommendations

The editor should preserve the documented vertical notebook layout while matching the existing product design language.

Required alignment:

- use the app's neutral background and white surfaces
- keep the editor top bar compact and sticky
- use sans typography for notebook metadata and controls
- use monospace only for JavaScript source
- keep block cards at small radius, no more than `8px`
- keep the block action cluster local to each block
- keep output directly attached to the originating code block
- use subtle borders and dividers instead of heavy shadows
- keep mobile layout as a single vertical flow
- keep all block actions keyboard reachable and visibly focused

Avoid:

- separate warm/editorial palette
- radial or decorative background effects
- oversized hero-style notebook title
- global side panels or permanent split panes
- card-within-card decoration
- global CSS button overrides
- adding a new UI library or frontend dependency

