// eslint-disable-next-line import/no-extraneous-dependencies
const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Blog = require('../models/blog');
const initialBlogs = require('./initial_blogs.json');

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(initialBlogs);
}, 10000);

// Describe function helps defining or describing the initial state of the database.
describe('when there is initially some notes saved', () => {
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
  }, 10000);
});

describe('blog posting related', () => {
  test('New blog is posted correctly', async () => {
    const blogToBeCreated = initialBlogs[0];

    const response = await api
      .post('/api/blogs')
      .send(blogToBeCreated)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogCreated = response.body;

    const blogs = await api.get('/api/blogs');
    const blogGot = blogs.body.find((blog) => blog.id === blogCreated.id);

    expect(blogs.body.length).toBe(initialBlogs.length + 1);
    expect(blogGot.title).toBe(blogToBeCreated.title);
    expect(blogGot.author).toBe(blogToBeCreated.author);
    expect(blogGot.url).toBe(blogToBeCreated.url);
    expect(blogGot.likes).toBe(blogToBeCreated.likes);
  });

  test('Missing like property defaults to 0', async () => {
    const blogToBeCreated = {
      title: initialBlogs[0].title,
      author: initialBlogs[0].author,
      url: initialBlogs[0].url,
    };

    const response = await api
      .post('/api/blogs')
      .send(blogToBeCreated)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogCreated = response.body;

    expect(blogCreated.likes).toBe(0);
  });
});

describe('Missing fields', () => {
  test('Bad request check ok', async () => {
    const blogWithMissingTitle = {
      author: initialBlogs[0].author,
      url: initialBlogs[0].url,
    };

    await api
      .post('/api/blogs')
      .send(blogWithMissingTitle)
      .expect(400);

    const blogWithMissingURL = {
      title: initialBlogs[0].title,
      author: initialBlogs[0].author,
    };

    await api
      .post('/api/blogs')
      .send(blogWithMissingURL)
      .expect(400);
  });
});

describe('Blogs modification', () => {
  test('Blog deletion check', async () => {
    let blogs = await api.get('/api/blogs');

    const toBeDeletedBlog = (blogs.body)[0];

    await api
      .delete(`/api/blogs/${toBeDeletedBlog.id}`)
      .expect(204);

    blogs = await api.get('/api/blogs');

    expect(blogs.body.find((blog) => blog.id === toBeDeletedBlog.id)).toBeUndefined();
  });

  test('Blog updation check', async () => {
    const blogs = (await api.get('/api/blogs')).body;

    const whatToUpdate = { likes: 9 };

    const blogToUpdate = blogs[0];

    const upatedBlog = (await api.put(`/api/blogs/${blogToUpdate.id}`).send(whatToUpdate)).body;

    expect(upatedBlog.likes).toBe(whatToUpdate.likes);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
