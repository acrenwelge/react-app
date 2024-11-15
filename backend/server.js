const cors = require('cors');
const express = require('express');
const Datastore = require('nedb');
const logger = require('./logger');
const load_db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const database = load_db();

const handleResult = (err, res, docs) => {
  if (err) {
    logger.error(err);
    res.status(500).send();
  } else {
    res.send(docs);
  }
}

// middleware that processes all requests
app.use((req, res, next) => {
  logger.verbose(`${req.method} ${req.path}`);
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
      logger.error(err);
      res.status(500).send();
    } else {
      res.status(201).send(docs);
    }
  });
});

app.put('/todos/batch', async (req, res) => {
  const todos = req.body;
  const updatedTodos = [];
  try {
    for (let todo of todos) {
      await new Promise((resolve, reject) => {
        database.todos.update({ _id: todo._id }, todo, {}, (err, numReplaced) => {
          if (err) {return reject(err);}
          database.todos.findOne({ _id: todo._id }, (err, updatedTodo) => {
            if (err) { return reject(err);}
            updatedTodos.push(updatedTodo);
            resolve();
          });
        });
      });
    }
    res.send(updatedTodos);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.delete('/todos/batch', (req, res) => {
  const ids = req.body.map(t => t.id);
  for (let id of ids) {
    database.todos.remove({ _id: id})
  }
  res.status(204).send();
});

app.get('/todos/:id', (req, res) => {
  const id = req.params.id;
  database.todos.find({_id: id}, (err, docs) => handleResult(err, res, docs[0]));
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
  res.status(204).send(); // NO CONTENT
});

module.exports = app;