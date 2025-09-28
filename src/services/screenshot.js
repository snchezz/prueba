const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const puppeteer = require('puppeteer');
const config = require('../config');
const logger = require('../logger');

let browser;

function createError(message, code, cause) {
  const error = new Error(message);
  if (code) error.code = code;
  if (cause) error.cause = cause;
  return error;
}

function buildLaunchError(error) {
  let hint = 'No se pudo iniciar el navegador de capturas.';
  const text = error && error.message ? error.message : '';
  if (text.includes('error while loading shared libraries') || text.includes('Failed to launch the browser process')) {
    hint += ' Faltan dependencias del sistema necesarias para Chromium (por ejemplo libatk-1.0-0, libx11-xcb1, libnss3, libxcomposite1).'
      + ' Instálalas en el servidor y vuelve a intentarlo.';
  }
  return createError(hint, 'BROWSER_LAUNCH_FAILED', error);
}

async function getBrowser() {
  if (browser) return browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: config.puppeteer.executablePath || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  } catch (error) {
    browser = null;
    throw buildLaunchError(error);
  }
  return browser;
}

async function capture(url, websiteId) {
  let page;
  try {
    const instance = await getBrowser();
    page = await instance.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
    const filename = `${timestamp}.png`;
    const directory = path.join(__dirname, '..', '..', 'storage', 'screenshots', String(websiteId));
    fs.mkdirSync(directory, { recursive: true });
    const filePath = path.join(directory, filename);
    await page.screenshot({ path: filePath, fullPage: true });
    logger.info('Captured screenshot', { url, filePath });
    return filePath;
  } catch (error) {
    if (error && error.code === 'BROWSER_LAUNCH_FAILED') {
      throw error;
    }
    const wrapped = createError(`No se pudo capturar la web ${url}.`, 'CAPTURE_FAILED', error);
    throw wrapped;
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (closeError) {
        logger.warn('Error closing page after failure', { url, error: closeError.message });
      }
    }
  }
}

async function shutdown() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

module.exports = { capture, shutdown };
