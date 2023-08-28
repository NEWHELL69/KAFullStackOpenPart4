const blogRouter = require('express').Router();
const { default: mongoose } = require('mongoose');
const Blog = require('../models/blog');
const User = require('../models/user');

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('userId');

  response.json(blogs);
});

blogRouter.post('/', async (request, response) => {
  const { body } = request;

  if (!body.title || !body.url) {
    response.status(400).json({
      error: 'title or url missing',
    });

    return;
  }

  body.id = (new mongoose.Types.ObjectId()).toString();

  // Adding a random user to this blog as per Excersise 4.17
  const users = await User.find({}); // Getting all users
  const randomUser = users[Math.floor(Math.random() * users.length)]; // Selecting a random user
  body.userId = randomUser.id; // Assigning user to blog
  randomUser.blogs.push(body.id); // Assigning blog to user
  await User.findByIdAndUpdate(randomUser.id, randomUser); // Updating the user in DB
  // -----------------------------------------------------------------------------

  const blog = new Blog(body);

  blog
    .save()
    .then((result) => {
      response.status(201).json(result);
    });
});

blogRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id);
  response.status(204).end();
});

blogRouter.put('/:id', async (request, response) => {
  const { body } = request;

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, body, { new: true });

  response.send(updatedBlog);
});

module.exports = blogRouter;
