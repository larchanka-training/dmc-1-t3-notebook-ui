# Notebook Editor Sidebar

## Purpose

This document defines the current left sidebar artifact for the notebook editor route (`/notebooks/:notebookId`).

It records:

- the sidebar's role in the notebook editor shell
- the expected layout and scroll behavior
- collapsed and expanded states
- notebook list behavior
- footer utility area behavior
- accessibility and interaction requirements

This document is a UI artifact and layout contract. It complements `screen_specs.md`, `page_design_scheme.md`, and `ui_architecture.md`.

## Scope

In scope:

- the left sidebar inside the notebook editor route
- notebook navigation within the editor context
- collapse and expand behavior
- icon rail behavior
- footer utility section visibility
- scroll ownership between the sidebar and the editor content area

Out of scope:

- the top global app header
- notebook block chrome and block-local controls
- notebook list page design outside the editor route
- drag and drop, search, pinning, favorites, or tags

## Product Intent

The sidebar should make the notebook editor feel closer to a notebook tool such as Colab:

- navigation remains available while editing
- the current notebook list stays visible without competing with the document
- the footer utility area remains reachable without page scrolling
- the main document remains the visual priority

The sidebar is not intended to be a branded hero panel or a second workspace.

## Layout Structure

The notebook editor shell is split into two regions:

1. left notebook sidebar
2. right editor scroll area

The sidebar is a fixed-height region inside the editor route container. It should use the height available below the global app header, not the full browser viewport.

The sidebar is vertically divided into:

1. top utility row with collapse/expand control
2. create notebook action
3. scrollable notebook list area
4. bottom utility area

## Scroll Model

The sidebar must remain visually fixed while the user scrolls notebook content.

Required behavior:

- the editor page shell uses the height of the route container
- the right editor region owns the primary vertical scroll for notebook content
- the sidebar does not move together with block content
- the sidebar footer stays visible at the bottom of the sidebar
- only the notebook list section inside the sidebar may scroll when the list is taller than the available height

This means the route layout behaves as:

- shell: fixed within the route container
- sidebar: fixed within the shell
- notebook list: internal scroll region
- editor content: independent scroll region

## Expanded State

In expanded state, the sidebar shows:

- collapse button aligned to the top-right edge
- `New notebook` action row
- section label such as `Your notebooks`
- notebook items with title and origin metadata
- bottom utility area with `All notebooks`
- compact user summary card when an authenticated user is present

Visual rules:

- neutral background
- subtle border on the right edge
- low-contrast row separators
- compact spacing
- no decorative brand block at the top

## Collapsed State

In collapsed state, the sidebar becomes an icon rail.

Required behavior:

- width reduces to an icon-first rail
- top control switches to expand affordance
- create notebook remains available as an icon-only action
- notebook items remain clickable as icon-only rows
- bottom utility area remains visible
- item labels are not rendered inline

Collapsed state should preserve recognition through:

- stable row positions
- icon consistency
- hover tooltip text
- `aria-label` on icon-only controls

## Notebook Item Behavior

Each notebook item in the sidebar should:

- open the selected notebook
- visually indicate the active notebook
- show the notebook title
- show concise origin metadata in expanded state
- expose the notebook title as a hover tooltip

The active notebook row should be clearly distinguishable but still low-noise.

Recommended active state:

- subtle surface tint
- faint ring or border emphasis
- stronger text contrast than inactive rows

## Footer Utility Area

The footer utility area is anchored to the bottom of the sidebar.

It currently contains:

- `All notebooks` navigation link
- `Help` navigation link
- authenticated user summary card when available

Requirements:

- the footer must remain visible without scrolling the main page
- the footer should not disappear below the fold because of notebook content scrolling
- the footer should remain compact and operational

## Hover and Tooltip Behavior

The sidebar uses lightweight hover hints rather than persistent explanatory labels in icon-only states.

Required behavior:

- icon-only actions expose a tooltip or equivalent hover hint
- notebook rows expose the notebook title on hover
- create notebook action exposes a hint such as `Add notebook`
- hover hints must not be the only accessible name

`title` attributes are acceptable as a minimum artifact-level implementation. Rich tooltip primitives may replace them later if they follow the same semantics.

## Accessibility Requirements

The sidebar must remain fully keyboard reachable.

Required behavior:

- collapse and expand control is keyboard operable
- create notebook action is keyboard operable
- notebook item buttons are keyboard operable
- icon-only controls expose accessible names
- active notebook row exposes `aria-current="page"` or equivalent route-active semantics
- focus-visible states remain visible on all interactive rows

## Acceptance Criteria

- the notebook editor route includes a left sidebar and a right editor region
- the sidebar remains fixed while the editor content scrolls
- the bottom utility area remains visible at the bottom of the sidebar
- the notebook list area scrolls independently when needed
- the sidebar supports expanded and collapsed states
- the collapsed state remains usable through icons, focus states, and tooltips
- notebook items expose notebook names on hover
- the create notebook control exposes an `Add notebook` hover hint
- the editor shell height respects the global app header and does not use raw viewport height inside the nested route
