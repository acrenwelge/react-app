const app = require('./server');
const PORT = process.env.PORT || 3002;
const logger = require('./logger');
const testDataRoutes = require('./test/testDataRoutes');
const load_db = require('./db');

if (process.argv.length > 2 && process.argv[2] === '--persist') {
  load_db(true);
} else {
  load_db(false);
}

if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
  logger.info('Loading test data routes');
  app.use('/test-data', testDataRoutes); // Load test data routes in test environment only
}

app.listen(PORT, () => {
  logger.info(`Node.js server running on http://localhost:${PORT}`);
});