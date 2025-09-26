const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const puppeteer = require('puppeteer');
const config = require('../config');
const logger = require('../logger');

let browser;

async function getBrowser() {
  if (browser) return browser;
  browser = await puppeteer.launch({
    headless: 'new',
    executablePath: config.puppeteer.executablePath || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  return browser;
}

async function capture(url, websiteId) {
  const instance = await getBrowser();
  const page = await instance.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

  const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
  const filename = `${timestamp}.png`;
  const directory = path.join(__dirname, '..', '..', 'storage', 'screenshots', String(websiteId));
  fs.mkdirSync(directory, { recursive: true });
  const filePath = path.join(directory, filename);
  await page.screenshot({ path: filePath, fullPage: true });
  await page.close();
  logger.info('Captured screenshot', { url, filePath });
  return filePath;
}

async function shutdown() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

module.exports = { capture, shutdown };
