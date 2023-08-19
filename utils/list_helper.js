// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => 1;

const totalLikes = (blogs) => {
  const reducer = (total, current) => total + current.likes;

  return blogs.reduce(reducer, 0);
};

const favoriteBlog = (blogs) => {
  const reducer = (max, current) => {
    if (current.likes > max.likes) {
      return current;
    }

    return max;
  };

  const max = blogs.reduce(reducer, { likes: 0 });

  return {
    title: max.title,
    author: max.author,
    likes: max.likes,
  };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
};
