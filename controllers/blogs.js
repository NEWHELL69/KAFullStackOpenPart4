const blogRouter = require('express').Router();
const Blog = require('../models/blog');

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('userId');

  response.json(blogs);
});

blogRouter.post('/', async (request, response) => {
  const { body, user } = request;

  if (!body.title || !body.url) {
    response.status(400).json({
      error: 'title or url missing',
    });

    return;
  }

  const blogData = {
    ...body,
    userId: user.id, // Assigning user to blog
  };

  const blog = new Blog(blogData);
  await blog.save();

  // Update user with the new blog post
  user.blogs.push(blog.id); // Assigning blog to user
  await user.save();

  response.status(201).json(blog);
});

blogRouter.delete('/:id', async (request, response) => {
  const { user } = request;
  const blogId = request.params.id;

  if (!user.blogs.includes(blogId)) {
    response.status(401).json({ error: 'Blog does not belong to user' });
    return;
  }

  await Blog.findByIdAndDelete(blogId);

  const index = user.blogs.indexOf(blogId);
  if (index > -1) { // only splice array when item is found
    user.blogs.splice(index, 1); // 2nd parameter means remove one item only
  }
  await user.save();

  response.status(204).end();
});

blogRouter.put('/:id', async (request, response) => {
  const { body, user } = request;

  if (!user.blogs.includes(request.params.id)) {
    response.status(401).json({ error: 'Blog does not belong to user' });
    return;
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, body, { new: true });

  response.send(updatedBlog);
});

module.exports = blogRouter;
