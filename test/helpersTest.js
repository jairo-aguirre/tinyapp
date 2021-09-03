const { assert } = require('chai');

const { getUserObject } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserObject', () => {
  it('should return a user with valid email', () => {
    const user = getUserObject('email', "user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    
    assert.equal(user.id, expectedOutput);
  });
  it('should return null if user\'s email is not registered', () => {
    const email = 'jairo@aguirre.com';
    assert.isNull(getUserObject('email', email, testUsers), `${email} is not in our users database, sorry.`);
  });
});