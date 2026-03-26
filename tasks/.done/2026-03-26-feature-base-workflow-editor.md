---
status: done
type: feature
created: 2026-03-26
---

# Base Workflow Editor — Sola-Faithful

Scaffold the app and build the base workflow editor with Sola-faithful styling and a static contract parsing workflow. This is the foundation that the diff editor builds on top of.

## Tech Stack

- Vite + React + TypeScript
- shadcn/ui for components
- React Flow for the node-based canvas
- Tailwind (comes with shadcn)
- Lucide icons (bundled with shadcn)
- Bun as package manager

## Design Decisions

- **Visual style**: Inspired by Sola's aesthetic — dark, clean, professional — not a pixel-clone
- **Layout**: Linear left-to-right pipeline
- **App shell**: Full chrome — sidebar + top bar + status/breadcrumb bar
- **Node cards**: Detail style — Lucide icon, title, separator, and 2-3 inline config fields per node
- **Icons**: Lucide SVG icons (ships with shadcn)

## Steps

1. **Scaffold** — Vite + React + shadcn + React Flow boilerplate (bun)
2. **Sola-inspired dark theme** — design tokens, color palette, typography referencing sola.ai
3. **App shell** — full layout with sidebar, top bar, and status bar so it feels like a real product
4. **Custom node components** — detail cards with Lucide icon, title, separator, and config fields; input/output handles
5. **Base workflow** — render the 6-node contract parsing pipeline left-to-right with connections
6. **Polish** — spacing, transitions, overall cohesion

## Base Workflow — 6 Nodes (Linear L→R)

1. **Upload Contract** (PDF input)
2. **Parse Document** (OCR/extraction)
3. **Extract Fields** (party names, dates, values)
4. **Validate Data** (check required fields)
5. **Format Output** (structure for downstream)
6. **Upload to System** (API call)

Nodes are connected linearly: Upload → Parse → Extract → Validate → Format → Upload to System.

## Definition of Done

- App runs locally with `bun run dev`
- Dark-themed workflow editor inspired by Sola's visual style
- Full app shell (sidebar, top bar, status bar) — looks like a real product
- 6 custom detail-card nodes with Lucide icons rendered on a React Flow canvas
- Nodes connected left-to-right with proper edges
- Nodes are selectable and the canvas is pannable/zoomable
- Looks like a real product, not a tutorial project
