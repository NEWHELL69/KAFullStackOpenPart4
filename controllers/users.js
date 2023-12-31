// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');
const middleware = require('../utils/middleware');

usersRouter.post('/', async (request, response) => {
  const {
    username, name, password, blogs,
  } = request.body;

  if (!(password && username && /...+/.test(password) && /...+/.test(username))) {
    response.status(400).json({
      error: 'Both username and password must be at least 3 characters long.',
    });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
    blogs,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

usersRouter.get('/singleUser', middleware.userExtractor, async (request, response) => {
  const users = await User.findById(request.user.id).populate('blogs');
  response.json(users);
});

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs');
  response.json(users);
});

module.exports = usersRouter;
