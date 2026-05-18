# Design Tokens

## Purpose

This document establishes the initial design token direction for the notebook UI.

It is intentionally lightweight and should guide implementation without introducing a new UI library.

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
