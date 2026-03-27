---
status: done
type: feature
created: 2026-03-27
---

# Visit tracking with email notifications

Add a `/api/visit` route to the existing Express backend that sends an email (via Resend) whenever someone opens the demo. This is for tracking when the hiring team at Sola views the project.

## Approach

- Add a `GET /api/visit` (or `POST`) route in `server/routes/`
- On page load, the frontend fires a fetch to `/api/visit` with referrer and user-agent
- The route calls Resend's API to send an email with: timestamp, referrer, user-agent
- Fully invisible to the visitor — no cookies, no third-party scripts on the page
- Deploy alongside the existing Express server on Railway/Render/Fly.io

## Details

- Use [Resend](https://resend.com) free tier (100 emails/day, 3k/month — more than enough)
- Consider deduplication or rate-limiting to avoid spam if the page gets unexpected traffic
- Keep it simple — just visits, not deep engagement tracking

## Env vars needed

- `RESEND_API_KEY` — API key from [Resend dashboard](https://resend.com/api-keys)
- `NOTIFICATION_EMAIL` — email address to send visit notifications to
