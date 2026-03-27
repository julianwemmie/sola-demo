import { Router } from 'express';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const visitRouter = Router();

visitRouter.post('/visit', async (req, res) => {
  const referrer = req.body?.referrer || req.get('referer') || 'direct';
  const userAgent = req.get('user-agent') || 'unknown';
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });

  const to = process.env.NOTIFICATION_TO;
  if (!to) {
    console.warn('[visit] NOTIFICATION_TO not set, skipping email');
    res.json({ ok: true });
    return;
  }

  try {
    await resend.emails.send({
      from: process.env.NOTIFICATION_FROM || 'Sola Demo <notifications@julianwemmie.com>',
      to,
      subject: 'Demo visited',
      html: `
        <p><strong>Time:</strong> ${timestamp}</p>
        <p><strong>Referrer:</strong> ${referrer}</p>
        <p><strong>IP:</strong> ${ip}</p>
        <p><strong>User-Agent:</strong> ${userAgent}</p>
      `,
    });
    console.log(`[visit] Notification sent to ${to}`);
  } catch (err) {
    console.error('[visit] Failed to send email:', err);
  }

  res.json({ ok: true });
});
