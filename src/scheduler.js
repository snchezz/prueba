const cron = require('node-cron');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const config = require('./config');
const logger = require('./logger');
const models = require('./models');
const screenshotService = require('./services/screenshot');
const emailService = require('./services/email');
const pdfService = require('./services/pdf');

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault(config.timezone);

async function processWebsite(website) {
  try {
    const capturedAt = dayjs().toISOString();
    const imagePath = await screenshotService.capture(website.url, website.id);
    models.recordCapture(website.id, imagePath, capturedAt);

    await emailService.sendScreenshotEmail({
      to: website.recipient_email,
      url: website.url,
      imagePath,
      capturedAt
    });

    const since = website.last_digest_at || dayjs().subtract(30, 'day').toISOString();
    const captures = models.recentCaptures(website.id, 30);
    const countSince = models.capturesSince(website.id, since);
    if (captures.length >= 30 && countSince >= 30) {
      const periodStart = captures[captures.length - 1].captured_at;
      const periodEnd = captures[0].captured_at;
      const pdfPath = await pdfService.buildDigest(website.id, website.url, captures.slice().reverse());
      await emailService.sendDigestEmail({
        to: website.recipient_email,
        url: website.url,
        pdfPath,
        periodStart,
        periodEnd
      });
      models.updateDigestTimestamp(website.id, capturedAt);
    }
  } catch (error) {
    logger.error('Error processing website', { id: website.id, error: error.message });
  }
}

function startScheduler() {
  const task = cron.schedule('0 10 * * *', async () => {
    logger.info('Running daily capture task');
    const websites = models.listWebsites();
    for (const website of websites) {
      // eslint-disable-next-line no-await-in-loop
      await processWebsite(website);
    }
  }, {
    timezone: config.timezone
  });

  logger.info('Scheduler initialized', { timezone: config.timezone, schedule: '0 10 * * *' });
  return task;
}

module.exports = { startScheduler };
