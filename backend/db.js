const Datastore = require('nedb');
const logger = require('./logger');

let dbInstance = null;

/**
 * Initializes the document database and eagerly returns the database object.
 * @param load_from_file - reads/writes to .jsonl files if true, otherwise uses in-memory db
 * @returns database object
 */
function load_db(load_from_file) {
  if (dbInstance) {
    return dbInstance; // If already initialized, return the instance
  }
  dbInstance = {};
  if (load_from_file) {
    logger.info(`Loading db from ./db-todos.jsonl and ./db-users.jsonl`);
    dbInstance.todos = new Datastore({ filename: './db-todos.jsonl', autoload: true });
    dbInstance.users = new Datastore({ filename: './db-users.jsonl', autoload: true });
  } else {
    logger.info('No db file provided, using in-memory db');
    dbInstance.todos = new Datastore();
    dbInstance.users = new Datastore();
  }
  logger.info('Database initialized successfully');
  return dbInstance;
}

module.exports = load_db;