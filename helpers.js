// Get the object representing the logged user. The parameter 'type' is a tag to define whether it is a user or email lookup 
const getUserObject = (type, value, users) => {
  for (const key in users) {
    if (type === "user") {
      if (key === value) return users[key];
    }
    if (type === "email") {
      if (users[key].email === value) return users[key];
    }
  }
  return null;
}

// Get a string of 6 pseudo-random alphanumeric characters
const generateRandomString = (() => {
  return Math.random().toString(32).substring(2, 8); 
});

// Validate whether the user's email already exist in the database
const emailLookUp = (email, users) => {
  for (const key in users) {
    if (users[key].email === email) return true;
  }
  return false;
};

// Get the urls associated with the logged user
const urlsForUser = (user, urlDatabase) => {
  let userUrls = {};

  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === user) {
      userUrls[key] = {longURL: urlDatabase[key].longURL};
    }
  }

  return userUrls;
};

module.exports = { 
  getUserObject,
  generateRandomString,
  emailLookUp,
  urlsForUser
};