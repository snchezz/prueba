const path = require('path');
const express = require('express');
const websitesRouter = require('./routes/websites');
const logger = require('./logger');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use('/api/websites', websitesRouter);

app.use('/storage', express.static(path.join(__dirname, '..', 'storage')));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message });
  res.status(500).json({ message: 'Error interno del servidor' });
});

module.exports = app;
