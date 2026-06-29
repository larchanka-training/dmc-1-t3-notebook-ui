# Screen Specifications

## Purpose

This document defines the Version 1 screen expectations for the frontend routes.

## `/login`

### Layout

- centered auth card or column
- email OTP form
- OTP verification form state
- Google sign-in action
- inline request and error messaging

### States

- initial
- requesting OTP
- OTP requested
- verifying OTP
- auth error
- authenticated redirect state

### Actions

- enter email
- request OTP
- enter OTP
- verify OTP
- start Google sign-in

### Acceptance Criteria

- user can request OTP
- user can submit OTP
- Google sign-in entry is visible
- loading and error feedback are visible

## `/notebooks`

### Layout

- top page header
- create notebook action
- notebook search or filter entry when implemented
- notebook list area

### States

- loading
- empty
- error
- success

### Actions

- create notebook
- open notebook
- search notebooks when implemented

### Acceptance Criteria

- user can see list feedback states
- user can create a notebook
- user can open a notebook

## `/notebooks/:notebookId`

### Layout

- left notebook sidebar
- notebook header with title and notebook metadata
- top notebook action bar
- right editor scroll area with central vertical block list
- inline insert controls between blocks
- block-local action cluster
- active-block toolbar for structural block actions
- output area attached to code blocks

### States

- loading
- notebook load error
- empty notebook
- populated notebook
- execution running
- syncing
- sync conflict

### Actions

- edit title
- add text block
- add code block
- insert a block between existing blocks
- delete block
- move block up
- move block down
- edit text
- edit code
- run current block
- run all
- run from selected block
- stop execution
- open AI prompt for eligible text block
- sync notebook

### Acceptance Criteria

- a newly created local notebook opens with the default title `Untitled` until the user renames it
- user-visible notebook title never falls back to an internal local route or storage id
- notebook header supports an explicit rename flow inside the editor
- notebook uses a vertical notion-like flow
- notebook editor shell keeps the sidebar fixed while block content scrolls
- inline insert controls are available inside the block sequence
- block action cluster contains only the primary action relevant to the current block type
- structural block actions are available through an active-block toolbar
- code output appears near the originating block
- sync state is visible
- AI entry is block-scoped and available for eligible text blocks only

## `/help`

### Layout

- left notebook sidebar
- help page header
- readable help content column
- sectioned cards or content groups for major help topics

### States

- default content state
- collapsed sidebar state

### Actions

- open help from the sidebar utility area
- collapse and expand the sidebar
- navigate back to notebooks from the sidebar

### Acceptance Criteria

- help is available as an authenticated route
- the help route uses the same sidebar shell style as the notebook editor
- the sidebar exposes a dedicated help entry in the utility area
- the help entry is still accessible when the sidebar is collapsed
- the page explains notebook basics, blocks, execution, outputs, sync, and AI usage
