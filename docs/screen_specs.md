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

- top notebook action bar
- notebook title area
- sync status area
- central vertical block list
- block-local action cluster
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
- delete block
- move block up
- move block down
- edit text
- edit code
- run current block
- run all
- run from selected block
- stop execution
- open AI prompt for selected code block
- sync notebook

### Acceptance Criteria

- notebook uses a vertical notion-like flow
- block actions are local to blocks
- code output appears near the originating block
- sync state is visible
- AI entry is block-scoped
