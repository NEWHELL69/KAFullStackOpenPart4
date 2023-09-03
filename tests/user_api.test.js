const bcrypt = require('bcrypt');
const supertest = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/user');
const helper = require('./test_helper');
const app = require('../app');

const api = supertest(app);

beforeAll(async () => {
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash('sekret', 10);
  const user = new User({ username: 'root', passwordHash });

  await user.save();
});

// Describe function helps defining or describing the initial state of the database.
describe('when there is initially one user in db', () => {
  // Test function helps with testing a specific operation in that state.
  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('expected `username` to be unique');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toEqual(usersAtStart);
  });

  test('creation fails with proper statuscode and message if username and password are in invalid format', async () => {
    const userWithInvalidUsername = {
      username: 'ro',
      name: 'Superuser',
      password: 'salainen',
    };

    const userWithInvalidPassword = {
      username: 'root',
      name: 'Superuser',
      password: undefined,
    };

    let response = await api
      .post('/api/users')
      .send(userWithInvalidUsername)
      .expect(400);

    expect(response.body.error).toContain('Both username and password must be at least 3 characters long.');

    response = await api
      .post('/api/users')
      .send(userWithInvalidPassword)
      .expect(400);

    expect(response.body.error).toContain('Both username and password must be at least 3 characters long.');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
