const cors = require('cors');
const express = require('express');
const Datastore = require('nedb');

const app = express();
app.use(cors());
app.use(express.json());

let database = {};

/**
 * Initializes the document database.
 * Call this before starting the server.
 * @param load_from_file - reads from .jsonl files if true, otherwise uses in-memory db
 * @returns database object
 */
function load_db(load_from_file) {
  if (load_from_file) {
    console.log(`Loading db from ./db-todos.jsonl and ./db-users.jsonl`);
    database.todos = new Datastore({ filename: './db-todos.jsonl', autoload: true });
    database.users = new Datastore({ filename: './db-users.jsonl', autoload: true });
  } else {
    console.log('No db file provided, using in-memory db');
    database.todos = new Datastore();
    database.users = new Datastore();
  }
  return database;
}

function get_db() {
  if (!database) {throw new Error('Database not initialized');}
  return database;
}

const handleResult = (err, res, docs) => {
  if (err) {
    console.error(err);
    res.status(500).send();
  } else {
    res.send(docs);
  }
}

// middleware that processes all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get('/users', (req, res) => {
  database.users.find({}, (err, docs) => handleResult(err, res, docs));
});

app.get('/todos', (req, res) => {
  // use a query parameter to filter by user_id
  if (req.query.user_id) {
    database.todos.find({
      "user_id": req.query.user_id
    }, (err, docs) => handleResult(err, res, docs));
  } else {
    database.todos.find({},  (err, docs) => handleResult(err, res, docs));
  }
});

app.post('/todos/batch', (req, res) => {
  const todos = req.body;
  const user_id = req.query.user_id;
  for (let todo of todos) {
    todo.user_id = user_id;
  }
  database.todos.insert(todos, (err, docs) => {
    if (err) {
      console.error(err);
      res.status(500).send();
    } else {
      res.status(201).send(docs);
    }
  });
});

app.put('/todos/batch', (req, res) => {
  const todos = req.body;
  for (let todo of todos) {
    console.log(`Completed: ${todo.completed}`);
    database.todos.update({ _id: todo.id }, todo);
    database.todos.find({ _id: todo.id }, (err, doc) => {
      console.log(doc);
    })
  }
  console.log(`Updated ${todos.length} todos`);
  res.send(todos);
});

app.delete('/todos/batch', (req, res) => {
  const ids = req.body.map(t => t.id);
  for (let id of ids) {
    database.todos.remove({ _id: id})
  }
  res.send(ids);
});

app.get('/todos/:id', (req, res) => {
  const id = req.params.id;
  database.todos.find({_id: id}, (err, docs) => handleResult(err, res, docs));
});

app.put('/todos/:id', (req, res) => {
  const id = req.params.id;
  const todo = req.body;
  for (let key of Object.keys(todo)) {
    database.todos.update({ _id: id }, { $set: { key: todo[key] } });
  }
  res.send(todo);
});

app.delete('/todos/:id', (req, res) => {
  const id = req.params.id;
  database.todos.remove({ _id: id });
  res.send();
});

module.exports = app;
module.exports.load_db = load_db;
module.exports.get_db = get_db;