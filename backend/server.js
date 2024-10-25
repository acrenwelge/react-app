import cors from 'cors';
import express from 'express';

const app = express();
const port = 3002;
app.use(cors());
app.use(express.json());

let db = {
  "acrenwelge": {
    "todos": [
      {
        "id": 1,
        "text": "Do some testing!!",
        "completed": false,
        "priority": 2,
        "dueDate": "2022-12-31T00:00:00Z"
      },
      {
        "id": 2,
        "text": "Write a React app",
        "completed": true,
        "priority": 1
      },
      {
        "id": 3,
        "text": "Get a job!",
        "completed": false,
        "priority": 3
      }
    ]
  }
}

let getMaxId = () => {
  let maxId = 0;
  for (let todo of db.acrenwelge.todos) {
    if (todo.id > maxId) maxId = todo.id;
  }
  return maxId;
}

app.get('/todos', (req, res) => {
  res.send(db.acrenwelge.todos);
});

app.post('/todos/batch', (req, res) => {
  let todos = req.body;
  let nextId = getMaxId() + 1;
  for (let todo of todos) {
    todo.id = nextId++;
  }
  db.acrenwelge.todos = db.acrenwelge.todos.concat(todos);
  res.send(todos);
});

app.put('/todos/batch', (req, res) => {
  const todos = req.body;
  db.acrenwelge.todos = db.acrenwelge.todos.map(t => todos.find(t2 => t2.id == t.id) || t);
  res.send(todos);
});

app.delete('/todos/batch', (req, res) => {
  const ids = req.body.map(t => t.id);
  db.acrenwelge.todos = db.acrenwelge.todos.filter(t => !ids.includes(t.id));
  res.send();
});

app.get('/todos/:id', (req, res) => {
  const id = req.params.id;
  const todo = db.acrenwelge.todos.find(t => t.id == id);
  res.send(todo);
});

app.put('/todos/:id', (req, res) => {
  const id = req.params.id;
  const todo = req.body;
  db.acrenwelge.todos = db.acrenwelge.todos.map(t => t.id == id ? todo : t);
  res.send(todo);
});

app.delete('/todos/:id', (req, res) => {
  const id = req.params.id;
  db.acrenwelge.todos = db.acrenwelge.todos.filter(t => t.id != id);
  res.send();
});

app.listen(port, () => {
  console.log(`Node.js server running on http://localhost:${port}`);
});