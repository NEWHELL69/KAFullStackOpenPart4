const fs = require('fs');
const { default: mongoose } = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const createObjectId = () => new mongoose.Types.ObjectId();

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

module.exports = {
  usersInDb,
  createObjectId,
};
