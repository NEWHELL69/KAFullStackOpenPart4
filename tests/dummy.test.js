const listHelper = require('../utils/list_helper');

// Test function helps with testing a specific operation in that state.
test('dummy returns one', () => {
  const blogs = [];

  const result = listHelper.dummy(blogs);
  expect(result).toBe(1);
});
