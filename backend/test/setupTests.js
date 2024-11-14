const { get } = require('http');
const app = require('../server');

beforeAll(() => {
  // Initialize the database
  db = app.load_db(false);
  db.users.insert({"_id":"testuser","name":"Test User","email":"testuser@fakemail.com"});
});

function generate_random_id() {
  return Math.random().toString(36).substring(2);
}

beforeEach(() => {
  // clear the database
  const db = app.get_db();
  db.todos.remove({}, { multi: true });
  // insert some test data
  db.todos.insert([
    {
      "_id": generate_random_id(),
      "text": "test todo item 1",
      "completed": false,
      "priority": null
    },
    {
      "_id": generate_random_id(),
      "text": "test todo item 2",
      "completed": true,
      "priority": 1
    }
  ]);
});