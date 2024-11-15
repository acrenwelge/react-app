const express = require('express');
const load_db = require('../db');
const logger = require('../logger');
const router = express.Router();
const testData = require('./TestData.json');

const db = load_db();
const usersDb = db.users;
const todosDb = db.todos;

// Endpoint to reset the database
router.post('/reset', async (req, res) => {
  try {
    logger.info('Resetting database');
    logger.debug('Users:',usersDb);
    logger.debug('Todos:',todosDb);
    await usersDb.remove({}, { multi: true });
    await todosDb.remove({}, { multi: true });
    res.status(200).send('Database reset');
  } catch (error) {
    res.status(500).send('Error resetting database');
    logger.error('Error resetting database:', error);
  }
});

// Endpoint to seed baseline data
router.post('/seed', async (req, res) => {
  try {
    await usersDb.insert(testData.users);
    await todosDb.insert(testData.todos);
    res.status(200).send('Database seeded');
  } catch (error) {
    res.status(500).send('Error seeding database');
  }
});

// Endpoint to seed data for a specific test
router.post('/seedForTest', async (req, res) => {
  const { testName } = req.body;
  try {
    if (testName === 'specificTestData') {
      const additionalData = [];
      await todosDb.insert(additionalData[0]);
    }
    res.status(200).send(`Data seeded for test: ${testName}`);
  } catch (error) {
    res.status(500).send(`Error seeding data for test: ${testName}`);
  }
});

// Endpoint to cleanup test-specific data
router.post('/cleanupForTest', async (req, res) => {
  const { testName } = req.body;
  try {
    if (testName === 'specificTestData') {
      await usersDb.remove({ _id: '2' }, {});
    }
    res.status(200).send(`Data cleaned up for test: ${testName}`);
  } catch (error) {
    res.status(500).send(`Error cleaning up data for test: ${testName}`);
  }
});

module.exports = router;