const blogRouter = require('express').Router();
const Blog = require('../models/blog');

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({});

  response.json(blogs);
});

blogRouter.post('/', (request, response) => {
  const { body } = request;

  if (!body.title || !body.url) {
    response.status(400).json({
      error: 'title or url missing',
    });

    return;
  }

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
