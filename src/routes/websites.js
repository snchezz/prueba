const express = require('express');
const dayjs = require('dayjs');
const models = require('../models');

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

module.exports = router;
