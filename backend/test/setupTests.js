const app = require('../server');

beforeAll(() => {
  // Initialize the database
  db = app.load_db(false);
  db.users.insert({"_id":"testuser","name":"Test User","email":"testuser@fakemail.com"});
});

beforeEach(() => {
  // clear the database
  const db = app.get_db();
  db.todos.remove({}, { multi: true });
  // insert some test data
  db.todos.insert([
    {
      "text": "test todo item 1",
      "completed": false,
      "priority": null
    },
    {
      "text": "test todo item 2",
      "completed": true,
      "priority": 1
    }
  ]);
});