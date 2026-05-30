# ADR-012: shadcn/ui Component Layer

## Status

Accepted

## Context

Version 1 needs consistent, accessible UI primitives (buttons, inputs, dialogs, menus) without adopting a monolithic component framework. The frontend already uses Tailwind CSS and FSD with a `shared/ui/` layer.

## Decision

Use **[shadcn/ui](https://ui.shadcn.com/)** as the standard component layer:

- install and update components with `pnpm dlx shadcn@latest` from the `ui/` directory
- store copied components under `src/shared/ui/`
- customize theme via Tailwind CSS variables aligned with `design_tokens.md`
- export primitives through the `shared/ui` public API; features and pages import only from that API

Do not adopt MUI, Chakra UI, or Ant Design for Version 1.

## Consequences

### Positive

- Accessible Radix UI primitives with local source ownership via shadcn `new-york` style
- Fits Tailwind and notebook-specific token customization
- No opaque global theme API from a large UI framework

### Negative

- Components must be added deliberately via CLI; no single `npm install @scope/ui` package
- Team must keep shadcn/Tailwind versions aligned during upgrades

## Related Documents

- [ui_architecture.md](../ui_architecture.md) §2, §4.4
- [libs.md](../libs.md)
- [design_tokens.md](../design_tokens.md)
- [index.md](../index.md) (Repository Tooling)
