---
status: done
type: feature
created: 2026-03-30
---

# Guided tour onboarding for demo recipients

Add a guided tour overlay using React Joyride so demo recipients understand how to use the app without watching the demo video.

## Approach

- **Library**: React Joyride (~15KB gzipped, handles spotlight/overlay/animations/accessibility)
- **Auto-start**: Every page load (it's a demo — every viewer should see it), with a Skip button
- **Polish**: Smooth transitions, clean tooltips styled to match Sola light theme

## Tour stops (3 steps)

1. **Record screen/voice** — highlight the record button, explain that users can record their screen to propose workflow changes via AI
2. **Changes panel** — spotlight the staging toolbar / changes list area, explain how proposed changes appear and can be reviewed
3. **Version history** — highlight the history toggle, explain comparing and previewing versions

## Open questions

- Exact tooltip copy
- Whether to add a "Restart Tour" button (e.g. in the sidebar help icon) for on-demand replay
