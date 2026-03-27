---
status: done
type: feature
created: 2026-03-26
---

# Workflow Diff Editor

Build the diff editor that visualizes proposed changes to a node-based workflow, with per-change approval. This is the core demo feature — the thing that hooks Sola.

Depends on: base workflow editor being complete.

## Diff Editor Features

- **Hybrid view**: Inline overlay (default) with toggle to side-by-side
- **Visual indicators**: Ghost nodes (red/strikethrough) for removed, green highlights for added, yellow for modified
- **Expandable detail panel**: Click a modified node → side panel slides out with text-style config diff
- **Per-change approval**: Accept/reject individual nodes and connections (like reviewing hunks in a PR)
- **Animated connections**: Connections animate between old and new states

## The Proposed Change (Mocked "AI" Output)

Starting from the base contract parsing workflow, the diff proposes:

- **Modified**: "Extract Fields" node config adds `effective_date`, `jurisdiction`
- **Added**: "Cross-Check Registry" node (web lookup between Validate and Format)
- **Added**: New connection wiring (Validate → Cross-Check → Format)
- **Removed**: Direct connection from Validate → Format (rewired through new node)

## Diff Data Model

Define a representation for workflow changes:
- Added nodes and edges
- Removed nodes and edges
- Modified nodes (with before/after config)

## Steps

1. **Diff data model** — define types for representing workflow changes
2. **Inline overlay diff** — render ghost nodes, highlights, animated connections on the existing canvas
3. **Side-by-side toggle** — second canvas showing the "before" state alongside the "after" with changes
4. **Detail panel** — click a modified (yellow) node → expandable side panel with text-style config diff
5. **Per-change approval UX** — accept/reject controls on each node/connection change
6. **Screen recording integration** — real screen capture that triggers the mocked diff
7. **Polish** — transitions, animations, overall demo narrative flow

## Definition of Done

- Can toggle between inline overlay and side-by-side diff views
- Added/removed/modified nodes are visually distinct
- Clicking a modified node shows config diff in a detail panel
- Individual changes can be accepted or rejected
- Screen recording triggers the diff flow (mocked AI interpretation)
