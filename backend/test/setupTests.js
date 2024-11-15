const { get } = require('http');
const app = require('../server');
const load_db = require('../db');

// Initialize the database in memory
db = load_db(false);

beforeAll(() => {
  db.users.insert({"_id":"testuser","name":"Test User","email":"testuser@fakemail.com"});
});

function generate_random_id() {
  return Math.random().toString(36).substring(2);
}

beforeEach(() => {
  // clear the database
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