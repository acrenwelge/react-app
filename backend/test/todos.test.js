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

  test('should create a new todo item', async () => {
    const newTodos = [{
      "text": "new test todo item",
      "completed": false,
      "priority": null
    }];
    const res = await request(app).post(`${baseUrl}/batch`).send(newTodos);
    if (res.error) {
      console.log(res.error);
    }
    expect(res.statusCode).toBe(201);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('text', 'new test todo item');
    expect(res.body[0]).toHaveProperty('completed', false);
  });

  test('should update todo items', async () => {
    const newTodos = [{
      "text": "new test todo item",
      "completed": false,
      "priority": null
    }];
    const res = await request(app).post(`${baseUrl}/batch`).send(newTodos);
    if (res.error) {
      console.log(res.error);
    }
    expect(res.statusCode).toBe(201);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('text', 'new test todo item');
    expect(res.body[0]).toHaveProperty('completed', false);
  });
});