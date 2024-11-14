const app = require('./server');
const PORT = process.env.PORT || 3002;
const logger = require('./logger');

if (process.argv.length > 2 && process.argv[2] === '--persist') {
  app.load_db(true);
} else {
  app.load_db(false);
}

app.listen(PORT, () => {
  logger.info(`Node.js server running on http://localhost:${PORT}`);
});