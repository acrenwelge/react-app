const request = require('supertest');
const app = require('../server');

const baseUrl = '/todos';

describe('Todos API', () => {
  test('should fetch all todos', async () => {
    const res = await request(app).get(baseUrl);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  test('should get a single todo item', async () => {
    const res = await request(app).get(baseUrl);
    const id = res.body[0]._id;
    const res2 = await request(app).get(`${baseUrl}/${id}`);
    expect(res2.statusCode).toBe(200);
    expect(res2.body).toHaveProperty('_id', id);
  });

  test('should update a todo item', async () => {
    const res = await request(app).get(baseUrl);
    let newTodo = res.body[0];
    newTodo.completed = !newTodo.completed; // toggle the completed status
    const updatedRes = await request(app).put(`${baseUrl}/${newTodo._id}`).send(newTodo);
    expect(updatedRes.statusCode).toBe(200);
    expect(updatedRes.body).toHaveProperty('completed', newTodo.completed);
  });

  test('should delete a todo item', async () => {
    const res = await request(app).get(baseUrl);
    const id = res.body[0]._id;
    const numItems = res.body.length;
    const deleteRes = await request(app).delete(`${baseUrl}/${id}`);
    expect(deleteRes.statusCode).toBe(204);
    const res2 = await request(app).get(baseUrl);
    expect(res2.body.length).toBe(numItems - 1);
  });

  test('should batch create todo items', async () => {
    const newTodos = [
      {
        "text": "new test todo item",
        "completed": false,
        "priority": null
      },
      {
        "text": "another new test todo item",
        "completed": false,
        "priority": 3
      }
    ];
    const res = await request(app).post(`${baseUrl}/batch`).send(newTodos);
    if (res.error) { console.error(res.error);}
    expect(res.statusCode).toBe(201);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('text', 'new test todo item');
    expect(res.body[0]).toHaveProperty('completed', false);
    expect(res.body[1]).toHaveProperty('text', 'another new test todo item');
    expect(res.body[1]).toHaveProperty('priority', 3);
  });

  test('should batch update multiple todo items', async () => {
    // retrieve all todos from API
    const res = await request(app).get(baseUrl);
    if (res.error) console.error(res.error);
    expect(res.statusCode).toBe(200);
    const todos = res.body;
    // update the both todo items
    let firstTodo = todos[0];
    firstTodo.completed = true;
    firstTodo.priority = 1;
    firstTodo.text = 'updated test todo item';
    const secondTodo = todos[1];
    secondTodo.text = 'second item updated';
    const updatedRes = await request(app).put(`${baseUrl}/batch`).send([firstTodo, secondTodo]);
    // validate the response
    if (updatedRes.error) console.error(updatedRes.error);
    expect(updatedRes.statusCode).toBe(200);
    expect(updatedRes.body[0]).toHaveProperty('text', 'updated test todo item');
    expect(updatedRes.body[0]).toHaveProperty('completed', true);
    expect(updatedRes.body[0]).toHaveProperty('priority', 1);
    expect(updatedRes.body[1]).toHaveProperty('text', 'second item updated');
  });

  test('should batch delete multiple todo items', async () => {
    // retrieve all todos from API
    const res = await request(app).get(baseUrl);
    if (res.error) console.error(res.error);
    expect(res.statusCode).toBe(200);
    const todos = res.body;
    // delete all items
    const deleteRes = await request(app).delete(`${baseUrl}/batch`).send([todos]);
    // validate the response
    if (deleteRes.error) console.error(deleteRes.error);
    expect(deleteRes.statusCode).toBe(204);
  });
});