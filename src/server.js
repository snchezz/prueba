const http = require('http');
const app = require('./app');
const config = require('./config');
const logger = require('./logger');
const { startScheduler } = require('./scheduler');
const screenshotService = require('./services/screenshot');

const server = http.createServer(app);

server.listen(config.port, () => {
  logger.info(`Servidor escuchando en http://localhost:${config.port}`);
  startScheduler();
});

process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully');
  await screenshotService.shutdown();
  server.close(() => {
    process.exit(0);
  });
});
