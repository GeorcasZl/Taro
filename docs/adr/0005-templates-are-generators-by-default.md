# ADR 0005: Templates Are Generators By Default

Date: 2026-05-15

## Status

Accepted

## Context

Templates help creators insert common structures such as investigations, phone chats, and choice clusters. A long-lived template instance model can make later edits, upgrades, and partial overrides complex.

## Decision

Taro templates are generators by default.

After insertion, a template expands into ordinary editable story structure. Taro does not preserve a default template-instance relationship. Plugin authors may provide instance-style capabilities as advanced behavior, but generated critical logic must remain visible.

## Consequences

Benefits:

- Generated logic is easy to inspect and edit.
- Templates do not create hidden maintenance state.
- Creator can freely customize after insertion.

Costs:

- Updating all prior uses of a changed template is not automatic by default.
- Plugin-provided instance behavior needs extra migration rules.

