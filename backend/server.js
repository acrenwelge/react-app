import cors from 'cors';
import express from 'express';
import Datastore from 'nedb';

const app = express();
const port = 3002;
app.use(cors());
app.use(express.json());

let database = {};
// use the --persist flag to write to a file; otherwise, use in-memory db
if (process.argv.length > 2 && process.argv[2] === '--persist') {
  console.log(`Loading db from ./db-todos.jsonl`);
  database.todos = new Datastore({ filename: './db-todos.jsonl', autoload: true });
  database.users = new Datastore({ filename: './db-users.jsonl', autoload: true });
} else {
  console.log('No db file provided, using in-memory db');
  database.todos = new Datastore();
  database.users = new Datastore();
  database.users.insert({"_id":"testuser","name":"Test User","email":"testuser@fakemail.com"});
}

const handleResult = (err, res, docs) => {
  if (err) {
    console.error(err);
    res.status(500).send();
  } else {
    res.send(docs);
  }
}

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
  database.todos.insert(todos);
  res.send(todos);
});

app.put('/todos/batch', (req, res) => {
  const todos = req.body;
  for (let todo of todos) {
    database.todos.update({ _id: todo.id }, todo);
  }
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

app.listen(port, () => {
  console.log(`Node.js server running on http://localhost:${port}`);
});