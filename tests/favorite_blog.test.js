const listHelper = require('../utils/list_helper');

describe('favorite blog', () => {
  const blogList0 = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'The Power of Algorithms',
      author: 'Grace Hopper',
      url: 'http://www.cs.yale.edu/homes/hoppe/power-algorithms.pdf',
      likes: 8,
      __v: 0,
    },
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Mastering Data Structures',
      author: 'Ada Lovelace',
      url: 'http://www.cs.yale.edu/homes/lovelace/mastering-data-structures.pdf',
      likes: 14,
      __v: 0,
    },
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Coding Paradigms Unleashed',
      author: 'Alan Turing',
      url: 'http://www.cs.yale.edu/homes/turing/coding-paradigms.pdf',
      likes: 6,
      __v: 0,
    },
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'The Evolution of Software Engineering',
      author: 'Margaret Hamilton',
      url: 'http://www.cs.yale.edu/homes/hamilton/software-evolution.pdf',
      likes: 18,
      __v: 0,
    },
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Innovations in Computer Science Education',
      author: 'John Backus',
      url: 'http://www.cs.yale.edu/homes/backus/cs-education-innovations.pdf',
      likes: 5,
      __v: 0,
    },
  ];

  test('when list has 5 random blogs', () => {
    const result = listHelper.favoriteBlog(blogList0);

    expect(result).toEqual({
      title: 'The Evolution of Software Engineering',
      author: 'Margaret Hamilton',
      likes: 18,
    });
  });
});
