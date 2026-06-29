# Help Content

## Purpose

This document is the source text for the future in-app help page.

It defines:

- the recommended help topics for Version 1
- the user-facing wording baseline
- the boundaries of what the help page should and should not promise

This document does not add a new route by itself. It is content preparation for a future help entry in the UI.

## Help Page Goals

The help page should help a user quickly understand:

- what the product is
- how to start working in a notebook
- how text and code blocks differ
- how code execution works
- how local work and sync behave
- how AI assistance fits into the notebook flow

The help page should stay practical and compact.

It should not become:

- a marketing page
- a developer architecture document
- a full troubleshooting center

## Draft User-Facing Copy

### Welcome to Notebook

Notebook is a block-based workspace for technical notes and executable `JavaScript`.

You can write explanations, add code, run it step by step, and keep the results next to the block that produced them.

### What You Can Do

- Create and open notebooks
- Add text blocks for notes and prompts
- Add code blocks for executable `JavaScript`
- Run one block, all blocks, or continue from a selected block
- Review outputs directly in the notebook flow
- Keep working locally and sync changes manually
- Use AI to generate or revise code from a text instruction

### How Notebook Is Organized

Each notebook is a vertical document made of blocks.

Version 1 supports two block types:

- `Text blocks` for notes, instructions, and AI prompts
- `Code blocks` for executable `JavaScript`

Outputs are shown under the code that produced them. Outputs are results of execution, not notebook blocks.

### Quick Start

1. Open the notebook list and create a new notebook.
2. Add a text block if you want to write notes or describe what code should do.
3. Add a code block to write `JavaScript`.
4. Run the current block to see the result.
5. Continue building the notebook from top to bottom.
6. Sync manually when you want to save the latest local changes to the server.

### Working With Text Blocks

Use text blocks for:

- documentation
- step descriptions
- TODO notes
- AI instructions

Text blocks use `Markdown`, so you can keep notes readable without leaving the notebook flow.

### Working With Code Blocks

Code blocks are used for executable `JavaScript`.

You can:

- run a single block
- run all blocks in order
- run from a selected block downward

Blocks in the same execution session can reuse values created earlier, so the usual workflow is top-to-bottom.

### Understanding Outputs

After a code block runs, Notebook shows the result near that block.

Outputs may appear as:

- text
- structured objects
- tables
- charts
- errors

If a block fails, fix the code and run it again.

### Local Work and Sync

Notebook is local-first.

Your active work is kept locally so you can continue editing even when the backend is unavailable.

Sync is manual:

- local edits do not sync automatically
- use sync when you decide the notebook is ready to save to the server
- if local and server versions conflict, Notebook shows the conflict instead of merging silently

### Using AI in a Notebook

AI assistance is block-scoped.

Use a text block to describe the code you want. Notebook sends that request through the backend AI flow and returns generated code into the notebook so you can review, edit, and run it yourself.

Treat AI output like any other untrusted code:

- review it
- edit it
- run it carefully

### Good Working Pattern

- keep notebooks small and readable
- place explanation before code when context matters
- run code in small steps
- reuse earlier variables intentionally
- sync after meaningful progress, not after every keystroke

### Current Version Limits

Version 1 is intentionally focused.

Current limits include:

- `JavaScript` only
- no real-time collaboration
- no automatic sync
- no hidden background merge of conflicts

### Need Help While Working?

If something looks wrong, first check:

- whether you are editing a text block or a code block
- whether the code depends on a value from an earlier block
- whether your latest local changes still need a manual sync

For product issues, use the project support or issue workflow defined by the team.

## Content Notes For Future UI Implementation

- Keep the help page readable in a narrow main content column.
- Use short sections and clear headings instead of long prose.
- Add anchor navigation only if the page becomes substantially longer.
- Do not promise features that are not implemented in Version 1.
- If the product later adds localization, keep this English document as the canonical source copy.
