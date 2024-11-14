const request = require('supertest');
const app = require('../server');

const baseUrl = '/users';

describe('Users API', () => {
  test('should fetch all users', async () => {
    const res = await request(app).get(baseUrl);
    if (res.error) console.log(res.error.message);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});