// Importing required modules
const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcryptjs = require('bcryptjs');
const {
  getUserObject,
  generateRandomString,
  emailLookUp,
  urlsForUser
} = require('./helpers'); // TinyApp modules

const PORT = 8080;

const app = express();

// Setting up TinyApp to use imported modules
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['user_ID'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Local databases for urls and users
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "JAG"
  },
  c3R6gg: {
    longURL: "https://www.canada.ca",
    userID: "JAG"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "JAG": {
    id: "JAG",
    email: "j@a.com",
    password: "$2a$10$QooLP1dJG/dq5u9Iu0TiyeabJfLU3KkdyCNZDZvyKl2lgM2Lg6E6C"
  }
};

// GET Routes start HERE!
app.get('/', (req, res) => {
  const userID = req.session.user_ID;

  if (userID) {
    res.redirect('/urls');
    return;
  }

  res.redirect('/login');
});

app.get('/urls', (req, res) => {
  const userID = req.session.user_ID;

  if (userID) {
    const templateVars = { username: getUserObject('user', userID, users), urls: urlsForUser(userID, urlDatabase) };

    res.render('urls_index', templateVars);

    return;
  }

  return res.status(401).send('Hi there, please <a href="/login">log in</a> or <a href="/register">register</a> to access TinyApp');
});

app.get('/urls/new', (req, res) => {
  const userID = req.session.user_ID;

  const templateVars = { username: getUserObject('user', userID, users) };

  if (templateVars.username === null) {
    res.redirect('/login');
    return;
  }
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_ID;
  const userUrls = urlsForUser(userID, urlDatabase);

  if (userID) {
    if (userUrls[shortURL]) {
      const templateVars = { username: getUserObject('user', userID, users), shortURL: shortURL, longURL: userUrls[shortURL].longURL };
      res.render('urls_show', templateVars);
      return;
    } else {
      return res.status(404).send('Not found');
    }
  }

  return res.status(401).send('Hi there, please <a href="/login">log in</a> or <a href="/register">register</a> to access TinyApp');
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;

  if (urlDatabase[shortURL]) {
    res.redirect(urlDatabase[shortURL].longURL);
    return;
  } else {
    return res.status(404).send('Sorry, URL not found');
  }
});

app.get('/register', (req, res) => {
  const userID = req.session.user_ID;
  const templateVars = { username: getUserObject('user', userID, users) };

  if (templateVars.username !== null) {
    res.redirect('/urls');
    return;
  }
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  const userID = req.session.user_ID;
  const templateVars = { username: getUserObject('user', userID, users) };

  if (templateVars.username !== null) {
    res.redirect('/urls');
    return;
  }

  res.render('login', templateVars);
});

// POST Routes start HERE!
app.post('/urls', (req, res) => {
  const userID = req.session.user_ID;

  if (userID) {
    const shortURL = generateRandomString();
    const urlObject = { longURL: req.body.longURL, userID: userID };
    urlDatabase[shortURL] = urlObject;
    res.redirect(`/urls/${shortURL}`);
    return;
  }

  return res.status(403).send('Forbidden access');
});

app.post('/urls/:shortURL/edit', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_ID;
  const userUrls = urlsForUser(userID, urlDatabase);

  if (userID) {
    if (userUrls[shortURL]) {
      urlDatabase[shortURL].longURL = req.body.url;
      res.redirect(`/urls/${shortURL}`);
      return;
    } else {
      return res.status(404).send('Not found');
    }
  } else {
    return res.status(401).send('Hi there, please <a href="/login">log in</a> or <a href="/register">register</a> to access TinyApp');
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_ID;
  const userUrls = urlsForUser(userID, urlDatabase);

  if (userID) {
    if (userUrls[shortURL]) {
      delete urlDatabase[shortURL];
      res.redirect(`/urls/`);
      return;
    } else {
      return res.status(404).send('Not found');
    }
  } else {
    return res.status(401).send('Hi there, please <a href="/login">log in</a> or <a href="/register">register</a> to access TinyApp');
  }
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if ((email === '') || (password === '')) {
    return res.status(400).send('Missing email or password');
  }

  if (!emailLookUp(email, users)) {
    return res.status(403).send('Forbidden access');
  }

  const user = getUserObject('email', email, users);

  if (bcryptjs.compareSync(password, user.password)) {
    req.session.user_ID = user.id;
    res.redirect('/urls');
    return;
  }

  return res.status(403).send('Forbidden access');
});

app.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.redirect('/urls/');
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if ((email === '') || (password === '')) {
    return res.status(400).send('Missing email or password');
  }

  if (emailLookUp(email, users)) {
    return res.status(400).send('Email already registered');
  }

  const userID = generateRandomString();
  users[userID] = { id: userID, email: email, password: bcryptjs.hashSync(password, 10) };

  req.session.user_ID = userID;
  res.redirect('/urls');
});

// Set up the TinyApp server connection and display its port
app.listen(PORT, () => {
  console.log(`TinyApp app listening on port: ${PORT}!`);
});