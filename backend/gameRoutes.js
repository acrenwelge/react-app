const logger = require('./logger');
const load_db = require('./db');
const express = require('express');
const router = express.Router();

const database = load_db();

router.get('/gameResults', (req, res) => {
  database.games.find({}, (err, docs) => {
    if (err) {
      logger.error(err);
      res.status(500).send();
    } else {
      res.send(docs);
    }
  });
});

router.post('/gameResults', (req, res) => {
  const game = req.body;
  database.games.insert(game, (err, docs) => {
    if (err) {
      logger.error(err);
      res.status(500).send();
    } else {
      res.status(201).send(docs);
    }
  });
});

module.exports = router;