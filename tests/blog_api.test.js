// eslint-disable-next-line import/no-extraneous-dependencies
const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Blog = require('../models/blog');
const initialBlogs = require('./initial_blogs.json');
const User = require('../models/user');
const initialUsers = require('./initial_users.json');
// const testHelper = require('./test_helper');

const api = supertest(app);

const newBlog = {
  title: 'Algorithmic Visions',
  author: 'Niklaus Wirth',
  url: 'http://www.example.com/algorithmic-visions.pdf',
  likes: 75,
};

let userTokens = [];

const initializeTokens = async () => {
  const tokenPromiseArray = initialUsers.map((user) => (
    api.post('/api/login').send({ username: user.username, password: user.password })
  ));
  userTokens = await Promise.all(tokenPromiseArray);
  userTokens = userTokens.map((userToken) => userToken.body);
};

const randomToken = () => userTokens[Math.floor(Math.random() * userTokens.length)].token;

const getTokenForUser = (user) => (userTokens.find(
  (userToken) => userToken.username === user.username,
)).token;

beforeAll(async () => {
  await User.deleteMany({});
  await Promise.all(initialUsers.map((user) => api.post('/api/users').send(user)));

  await initializeTokens();

  await Blog.deleteMany({});
  const blogPromiseArray = initialBlogs.map((blog) => api.post('/api/blogs').set('authorization', `Bearer ${randomToken()}`).send(blog));
  await Promise.all(blogPromiseArray);
}, 10000);

// Describe function helps defining or describing the initial state of the database.
describe('when there is initially some blogs and users saved', () => {
  // Test function helps with testing a specific operation in that state.
  test('blogs are returned as json and blog count recieved correctly', async () => {
    api.get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /applicaion\/json/)
      .expect('Content-Length', `${initialBlogs.length}`);
  });

  test('All blogs have id defined', async () => {
    const response = await api.get('/api/blogs');

    response.body.forEach((blog) => {
      expect(blog.id).toBeDefined();
    });
  });

  test('New blog is posted correctly', async () => {
    const blogToBeCreated = newBlog;

    const response = await api
      .post('/api/blogs')
      .set('authorization', `Bearer ${randomToken()}`)
      .send(blogToBeCreated)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogCreated = response.body;

    const blogs = await api.get('/api/blogs');
    const blogGot = blogs.body.find((blog) => blog.id === blogCreated.id);
    // When we get blogs(in JSON format) from '/api/blogs' then the userId field is populated
    // user object. But userId field in response from post request above have id saved in userId
    // So the line below replaces userId object with its id.
    blogGot.userId = blogGot.userId.id;

    expect(blogs.body.length).toBe(initialBlogs.length + 1);
    expect(blogGot).toStrictEqual(blogCreated);
  });

  test('Missing like property defaults to 0', async () => {
    const blogToBeCreated = { ...newBlog };
    delete blogToBeCreated.likes;

    const response = await api
      .post('/api/blogs')
      .set('authorization', `Bearer ${randomToken()}`)
      .send(blogToBeCreated)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogCreated = response.body;

    expect(blogCreated.likes).toBe(0);
  });

  test('Bad request check ok', async () => {
    const blogWithMissingTitle = {
      author: newBlog.author,
      url: newBlog.url,
    };

    await api
      .post('/api/blogs')
      .set('authorization', `Bearer ${randomToken()}`)
      .send(blogWithMissingTitle)
      .expect(400);

    const blogWithMissingURL = {
      title: newBlog.title,
      author: newBlog.author,
    };

    await api
      .post('/api/blogs')
      .set('authorization', `Bearer ${randomToken()}`)
      .send(blogWithMissingURL)
      .expect(400);
  });

  test('Blog deletion check', async () => {
    let blogs = await api.get('/api/blogs');

    const toBeDeletedBlog = (blogs.body)[0];

    await api
      .delete(`/api/blogs/${toBeDeletedBlog.id}`)
      .set('authorization', `Bearer ${getTokenForUser(toBeDeletedBlog.userId)}`)
      .expect(204);

    blogs = await api.get('/api/blogs');

    expect(blogs.body.find((blog) => blog.id === toBeDeletedBlog.id)).toBeUndefined();
  });

  test('Blog updation check', async () => {
    const blogs = (await api.get('/api/blogs')).body;

    const whatToUpdate = { likes: 9 };

    const blogToUpdate = blogs[0];

    const upatedBlog = (
      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .set('authorization', `Bearer ${getTokenForUser(blogToUpdate.userId)}`)
        .send(whatToUpdate)).body;

    expect(upatedBlog.likes).toBe(whatToUpdate.likes);
  });

  // Test case for Exercise 4.17
  test('GET blogs are populated with user object', async () => {
    const response = await api.get('/api/blogs');
    const blogs = response.body;

    blogs.forEach((blog) => {
      expect(blog.userId.id).toBeDefined();
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
