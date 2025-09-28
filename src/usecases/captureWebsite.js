const dayjs = require('dayjs');
const logger = require('../logger');
const models = require('../models');
const screenshotService = require('../services/screenshot');
const emailService = require('../services/email');
const pdfService = require('../services/pdf');

async function run(website) {
  const capturedAt = dayjs().toISOString();
  const imagePath = await screenshotService.capture(website.url, website.id);
  models.recordCapture(website.id, imagePath, capturedAt);

  const capture = models.listCaptures(website.id)[0];

  let screenshotEmailSent = false;
  try {
    screenshotEmailSent = await emailService.sendScreenshotEmail({
      to: website.recipient_email,
      url: website.url,
      imagePath,
      capturedAt
    });
  } catch (error) {
    logger.error('Error sending screenshot email', { id: website.id, error: error.message });
  }

  const since = website.last_digest_at || dayjs().subtract(30, 'day').toISOString();
  const captures = models.recentCaptures(website.id, 30);
  const countSince = models.capturesSince(website.id, since);

  let digest = null;

  if (captures.length >= 30 && countSince >= 30) {
    const periodStart = captures[captures.length - 1].captured_at;
    const periodEnd = captures[0].captured_at;

    try {
      const pdfPath = await pdfService.buildDigest(website.id, website.url, captures.slice().reverse());
      const digestEmailSent = await emailService.sendDigestEmail({
        to: website.recipient_email,
        url: website.url,
        pdfPath,
        periodStart,
        periodEnd
      });
      models.updateDigestTimestamp(website.id, capturedAt);
      digest = {
        sent: digestEmailSent,
        periodStart,
        periodEnd
      };
    } catch (error) {
      logger.error('Error processing digest email', { id: website.id, error: error.message });
    }
  }

  return {
    capture,
    screenshotEmailSent,
    digest
  };
}

module.exports = { run };
