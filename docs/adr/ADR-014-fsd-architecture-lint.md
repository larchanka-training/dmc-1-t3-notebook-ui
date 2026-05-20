# ADR-014: FSD Architecture Lint

## Status

Accepted

## Context

FSD layout and import rules in `ui_architecture.md` §4 are easy to violate during day-to-day edits (deep imports, cross-feature imports, upward layer imports). Manual review does not scale.

The project uses ESLint 9 flat config and needs automated checks that align with the repository layout without blocking the composed Zustand store in `app/model/`.

## Decision

Enforce FSD architecture with **two complementary tools**:

### 1. Steiger + `@feature-sliced/steiger-plugin`

- **Packages:** `steiger`, `@feature-sliced/steiger-plugin` (devDependencies)
- **Config:** `ui/steiger.config.ts` at the UI package root
- **Scope:** `ui/src/`
- **Script:** `pnpm lint:fsd` runs `steiger ./src`; `pnpm lint` runs ESLint then Steiger

Steiger checks slice structure, public API usage, and import rules between slices. Configuration extends `fsd.configs.recommended` with project-specific overrides:

| Rule / area                    | Setting                                                                   | Reason                                                     |
| ------------------------------ | ------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `fsd/no-cross-imports`         | `error`                                                                   | No direct imports between sibling features                 |
| `fsd/no-higher-level-imports`  | `error` globally; **off** in `features/**/model`, `pages/**/model`, tests | Allows `useAppStore` from `@/app/model` per §4.7 migration |
| `fsd/forbidden-imports`        | `off`                                                                     | Split into the two rules above                             |
| `fsd/no-ui-in-app`             | `off`                                                                     | Version 1 uses `app/ui/` shell per `ui_architecture.md`    |
| `fsd/insignificant-slice`      | `off`                                                                     | Multiple entities are intentional domain boundaries        |
| `fsd/segments-by-purpose`      | `off`                                                                     | Reserved `shared/types/` segment                           |
| `fsd/no-cross-imports`         | **off** in `entities/notebook/**`                                         | Notebook aggregate imports `@/entities/block`              |
| `fsd/no-reserved-folder-names` | `off`                                                                     | App router/ui hooks live beside components                 |

### 2. `eslint-plugin-boundaries`

- **Package:** `eslint-plugin-boundaries` (devDependency)
- **Config:** `ui/eslint.fsd.config.js`, merged in `ui/eslint.config.js`
- **Rule:** `boundaries/dependencies` on `src/**/*.{ts,tsx}` (tests excluded)

Layer elements map to paths:

| Type       | Pattern          |
| ---------- | ---------------- |
| `shared`   | `src/shared/**`  |
| `entities` | `src/entities/*` |
| `features` | `src/features/*` |
| `pages`    | `src/pages/*`    |
| `app`      | `src/app/**`     |

Dependency rules match `ui_architecture.md` §4.1, including **allow `app`** from `features` and `pages` for the composed store.

### Verification commands

```bash
pnpm lint       # ESLint (with boundaries) + Steiger; --max-warnings 0
pnpm lint:fsd   # Steiger only
```

CI and local pre-push checks should run `pnpm lint` in `ui/`.

## Rationale

- **Steiger** is the official FSD ecosystem linter for structure and slice imports.
- **eslint-plugin-boundaries** surfaces layer violations inside the existing ESLint IDE integration.
- Splitting `forbidden-imports` and scoping `no-higher-level-imports` off for model segments documents the temporary composed-store pattern without disabling cross-feature checks.

## Consequences

### Positive

- Regressions on layer imports and public API are caught in `pnpm lint`.
- New slices and routes have a documented, repeatable layout contract.

### Negative

- Two tools must be kept in sync when layer rules change (update `steiger.config.ts`, `eslint.fsd.config.js`, and `ui_architecture.md` together).
- `boundaries/dependencies` may print legacy-selector warnings until migrated to v6 object selectors.
- Steiger overrides must be reviewed when the composed store moves out of `app/model`.

## Related Documents

- [ui_architecture.md](../ui_architecture.md) §4
- [ADR-013](./ADR-013-fsd-source-layout.md)
- [ADR-005](./ADR-005-test-stack.md)
- [libs.md](../libs.md)
- [index.md](../index.md) (Repository Tooling)
