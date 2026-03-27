---
status: done
type: feature
created: 2026-03-27
---

# Workflow Version History

Git-like version control for workflows. Users edit the canvas, commit to create versions, and browse/compare/restore past versions from a history timeline. The headline demo story is "git for workflows."

## Demo Flow

1. **Open app** — 6-node workflow on canvas. History timeline visible in right sidebar with v1, v2, v3.
2. **Browse history** — Click v1 in timeline. Canvas swaps to show v1's 3-node workflow (preview mode). Timeline card expands with actions.
3. **Compare** — Click "Compare to current" on v1's card. Inline diff activates on canvas (colored overlays: red for removed, green for added, amber for modified).
4. **Restore** — Click "Restore" on v1's card. Canvas becomes the 3-node workflow. v4 ("Restored from v1") appends to timeline.
5. **Edit + Commit** — Make edits on canvas. Click Commit. Instantly creates v5 in timeline. No staging/review step.

## Canvas Editing

Full editing support for the demo:
- **Edit node config** — click node to open edit panel, change field values
- **Add a node** — (UX TBD: edge "+" button, toolbar, or palette)
- **Delete a node** — removes the node and its connected edges

## Commit Flow

Commit is **direct and instant** — no staging area or diff review step:
1. User makes edits on the canvas
2. Clicks "Commit" (location TBD — TopBar? Floating button? Only when uncommitted changes exist?)
3. New version is immediately created in history
4. Commit messages: TBD (auto-generated, user-typed, or none)

## History Timeline UI

- **Location:** Right sidebar, same slot as the current ChangesList (256px panel)
- **Activated by:** History button in left sidebar (currently a no-op)
- Vertical timeline showing version label, date, and summary of changes
- **Selecting a version:** Canvas swaps to show that version (preview mode), timeline card expands
- **Expanded card actions:**
  - "Compare to current" — opens inline diff on canvas (same visual language as existing diff, without accept/reject)
  - "Restore" — immediately swaps workflow to that version, pushes new version to history
- Preloaded with 3 mocked versions:
  - v1 (Mar 15) "Initial workflow" — Upload, Parse, Extract (3 nodes)
  - v2 (Mar 20) "Added validation pipeline" — full 6-node flow
  - v3 (Mar 26) "Current" — same 6-node base
- New versions appended when user commits or restores

## AI Proposal Flow

The existing recording/AI flow is a **no-op** for now. The recording button and related UI remain in place but do nothing. AI integration will be added later.

## Open Questions

- **Add node UX** — how does adding a node work? Edge "+" button? Toolbar? Drag from palette?
- **Commit button placement** — where does it live? TopBar? Floating? Only visible when there are uncommitted changes?
- **Commit messages** — auto-generated summary, user-typed, or no messages at all?

## Steps

1. **Version data model** — types for workflow snapshots and version history
2. **History state management** — hook/context for managing versions, committing, restoring
3. **Mocked history data** — v1/v2/v3 pre-populated versions with actual node/edge snapshots
4. **History timeline UI** — right sidebar with version list, activated by History button
5. **Version preview** — clicking a version swaps the canvas to show it
6. **Compare (inline diff)** — reuse existing diff visual language to compare a past version against current
7. **Restore** — restore a version, creating a new entry in history
8. **Canvas editing** — make nodes editable (config editing, add nodes, delete nodes)
9. **Uncommitted change tracking** — detect working changes vs last committed version
10. **Commit flow** — commit button, instant version creation
11. **Disable AI flow** — make recording/AI proposal a no-op while keeping UI in place
12. **Polish** — transitions, empty states, visual consistency
