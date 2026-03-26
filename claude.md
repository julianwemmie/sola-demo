# Sola Workflow Diff Editor — Demo

A proof-of-concept demo targeting [Sola.ai](https://www.sola.ai), showcasing a diff editor for node-based workflows.

Sola is an AI-native process automation platform where users record their screen to generate workflows. This demo explores what it looks like to **modify an existing workflow** — record new steps, have AI propose changes, and review those changes in a purpose-built diff editor.

## Demo Scenario

A contract parsing workflow already exists (upload PDF → parse → extract fields → validate → format → upload). The user records themselves performing new steps (extracting additional fields, cross-checking data on a website). The AI interprets the recording and proposes changes. The **diff editor** visualizes the proposed modifications and lets the user accept or reject each change individually.

## Tech Stack

- Vite + React + TypeScript
- React Flow (node-based canvas)
- shadcn/ui + Tailwind
- Sola-faithful dark theme

## Getting Started

```
bun install
bun run dev
```
