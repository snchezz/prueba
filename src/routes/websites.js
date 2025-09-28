const express = require('express');
const dayjs = require('dayjs');
const models = require('../models');
const captureWebsite = require('../usecases/captureWebsite');
const logger = require('../logger');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(models.listWebsites());
});

router.post('/', (req, res) => {
  const { url, recipientEmail } = req.body;
  if (!url || !recipientEmail) {
    return res.status(400).json({ message: 'url y recipientEmail son obligatorios.' });
  }
  const created = models.createWebsite({ url, recipientEmail });
  return res.status(201).json(created);
});

router.get('/:id', (req, res) => {
  const website = models.findWebsite(req.params.id);
  if (!website) return res.status(404).json({ message: 'No encontrado' });
  const captures = models.listCaptures(website.id);
  return res.json({ ...website, captures });
});

router.put('/:id', (req, res) => {
  const { url, recipientEmail } = req.body;
  if (!url || !recipientEmail) {
    return res.status(400).json({ message: 'url y recipientEmail son obligatorios.' });
  }
  const website = models.findWebsite(req.params.id);
  if (!website) return res.status(404).json({ message: 'No encontrado' });
  const updated = models.updateWebsite(req.params.id, { url, recipientEmail });
  return res.json(updated);
});

router.delete('/:id', (req, res) => {
  const website = models.findWebsite(req.params.id);
  if (!website) return res.status(404).json({ message: 'No encontrado' });
  models.deleteWebsite(req.params.id);
  return res.status(204).send();
});

router.get('/:id/captures', (req, res) => {
  const website = models.findWebsite(req.params.id);
  if (!website) return res.status(404).json({ message: 'No encontrado' });
  const captures = models.listCaptures(website.id).map(capture => ({
    ...capture,
    captured_at_formatted: dayjs(capture.captured_at).format('YYYY-MM-DD HH:mm:ss')
  }));
  return res.json(captures);
});

router.post('/:id/capture', async (req, res) => {
  const website = models.findWebsite(req.params.id);
  if (!website) return res.status(404).json({ message: 'No encontrado' });
  try {
    const result = await captureWebsite.run(website);
    const capture = {
      ...result.capture,
      captured_at_formatted: dayjs(result.capture.captured_at).format('YYYY-MM-DD HH:mm:ss')
    };
    return res.status(201).json({
      message: 'Captura generada correctamente.',
      capture,
      notifications: {
        screenshotEmailSent: result.screenshotEmailSent,
        digestEmailSent: result.digest ? result.digest.sent : false,
        digestPeriod: result.digest
          ? { start: result.digest.periodStart, end: result.digest.periodEnd }
          : null
      }
    });
  } catch (error) {
    logger.error('Error en captura manual', {
      id: website.id,
      error: error.message,
      details: error.cause ? error.cause.message : undefined
    });
    return res.status(500).json({
      message: error.message || 'No se pudo generar la captura.',
      details: error.cause ? error.cause.message : undefined
    });
  }
});

module.exports = router;
