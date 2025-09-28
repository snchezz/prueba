const cron = require('node-cron');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const config = require('./config');
const logger = require('./logger');
const models = require('./models');
const captureWebsite = require('./usecases/captureWebsite');

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault(config.timezone);

async function processWebsite(website) {
  try {
    await captureWebsite.run(website);
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
