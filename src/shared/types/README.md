# `shared/types`

Types used by **more than one module** (layer or slice) live here.

Domain types for a single entity belong in `entities/<name>/model/types.ts` and are imported through that entity’s public API (`@/entities/notebook`, `@/entities/block`, `@/entities/output`).

This folder is intentionally empty in Version 1: block, notebook, and output types are owned by their entities. `entities/notebook` composes `NotebookBlock` from `@/entities/block`.
