const fs = require('fs');
const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../logger');

let transporter;

function getTransporter() {
  if (!config.smtp.host) {
    logger.warn('SMTP configuration missing. Emails will be skipped.');
    return null;
  }
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port || 587,
    secure: (config.smtp.port || 587) === 465,
    auth: config.smtp.user && config.smtp.pass ? {
      user: config.smtp.user,
      pass: config.smtp.pass
    } : undefined
  });
  return transporter;
}

async function sendScreenshotEmail({ to, url, imagePath, capturedAt }) {
  const mailer = getTransporter();
  if (!mailer) return false;
  const info = await mailer.sendMail({
    from: config.smtp.from,
    to,
    subject: `Captura diaria - ${url}`,
    text: `Se adjunta la captura del ${capturedAt} para ${url}.`,
    attachments: [
      {
        filename: imagePath.split('/').pop(),
        path: imagePath
      }
    ]
  });
  logger.info('Screenshot email sent', { to, messageId: info.messageId });
  return true;
}

async function sendDigestEmail({ to, url, pdfPath, periodStart, periodEnd }) {
  const mailer = getTransporter();
  if (!mailer) return false;
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`PDF file not found at ${pdfPath}`);
  }
  const info = await mailer.sendMail({
    from: config.smtp.from,
    to,
    subject: `Resumen mensual - ${url}`,
    text: `Se adjunta el resumen de capturas entre ${periodStart} y ${periodEnd}.`,
    attachments: [
      {
        filename: pdfPath.split('/').pop(),
        path: pdfPath
      }
    ]
  });
  logger.info('Digest email sent', { to, messageId: info.messageId });
  return true;
}

module.exports = { sendScreenshotEmail, sendDigestEmail };
