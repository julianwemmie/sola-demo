---
status: done
type: feature
created: 2026-03-27
---

# Functioning recording button with audio processing pipeline

Wire up the existing no-op recording button to capture screen + voice, send to backend for processing, and return structured node modifications that auto-stage as a diff.

## Architecture

- **Frontend**: Reuse existing `RecordingOverlay.tsx` component (state machine: idle -> recording -> analyzing -> done), triggered from TopBar record button
- **Backend**: vite-express server (frontend + backend in same repo)
- **Transcription**: OpenAI Whisper API (audio -> text)
- **Reasoning**: Claude API with structured output (transcript + current nodes -> structured JSON node modifications)
- **Audio handling**: ffmpeg on backend to extract audio from webm recording

## Flow

1. User clicks record -> `RecordingOverlay` activates -> captures screen + mic via `getDisplayMedia`/`getUserMedia`
2. User clicks stop -> webm blob sent to Express backend (`/api/process-recording`)
3. Backend extracts audio from webm using ffmpeg, converts to wav/mp3
4. Audio sent to OpenAI Whisper for transcription
5. Transcript + current node structure sent to Claude with contract-parsing-specific prompt and strict JSON schema
6. Claude returns structured JSON: nodes to add, modify, or remove
7. Frontend receives proposed changes -> auto-stages as uncommitted edits -> existing diff/staging UI lights up for review

## Key decisions

- Record video for demo purposes but only process audio
- Whisper + Claude (two calls) rather than single OpenAI audio model
- Claude structured output for guaranteed valid JSON response (add/modify/remove operations)
- Contract-parsing domain-specific prompt (not generic)
- Auto-stage changes as diff using existing staging/versioning system
- API keys in `.env` (demo, not production)

## Implementation steps

1. Install vite-express, openai sdk, anthropic sdk, fluent-ffmpeg
2. Set up backend entry point with vite-express
3. Wire `RecordingOverlay` to TopBar record button
4. Build `/api/process-recording` endpoint (receive webm -> ffmpeg extract audio -> Whisper transcribe -> Claude structured output -> return JSON)
5. Define Claude structured output schema for node modifications
6. Build frontend handler that applies Claude's response via existing `addNode`/`deleteNode`/`updateNodeLabel`/`updateNodeConfig` actions
