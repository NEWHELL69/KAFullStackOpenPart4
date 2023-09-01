const blogRouter = require('express').Router();
const { default: mongoose } = require('mongoose');
const Blog = require('../models/blog');
const User = require('../models/user');

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('userId');

  response.json(blogs);
});

// Adding a random user to a blog as per Excersise 4.17
const assignRandomUser = async (request, response, next) => {
  const usersCount = await User.countDocuments();
  const randomIndex = Math.floor(Math.random() * usersCount);
  const randomUser = await User.findOne().skip(randomIndex);
  request.randomUser = randomUser;
  next();
};

blogRouter.post('/', assignRandomUser, async (request, response) => {
  const { body, randomUser } = request;

  if (!body.title || !body.url) {
    response.status(400).json({
      error: 'title or url missing',
    });

    return;
  }

  const blogData = {
    ...body,
    id: (new mongoose.Types.ObjectId()).toString(),
    userId: randomUser.id, // Assigning user to blog
  };

  const blog = new Blog(blogData);
  await blog.save();

  // Update user with the new blog post
  randomUser.blogs.push(blog.id); // Assigning blog to user
  await randomUser.save();

  response.status(201).json(blog);
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
