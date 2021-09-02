const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const PORT = 8080;

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

let urlDatabase = {
  "b2xVn2": "http://www.nfl.com",
  "9sm5xK": "http://www.canada.ca",
  "1hr5xK": "http://www.yahoo.com"
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
    email: "jairo@aguirre.com",
    password: "dark-matter"
  }
};

const generateRandomString = (() => {
  return Math.random().toString(32).substring(2, 8); // string of 6 pseudo-random alphanumeric characters
});

const getUserObject = (user) => {
  for (const key in users) {
    if (key === user) return users[key];
  }
  return null;
};

const getUserObjectByEmail = (email) => {
  for (const key in users) {
    if (users[key].email === email) return users[key];
  }
  return null;
};

const emailLookUp = (email) => {
  for (const key in users) {
    if (users[key].email === email) return true;
  }
  return false;
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World<b><body><html>\n');
});

app.get('/urls', (req, res) => {
  const templateVars = { username: getUserObject(req.cookies['username']), urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { username: getUserObject(req.cookies['username']) };
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { username: getUserObject(req.cookies['username']), shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = { username: getUserObject(req.cookies['username']) };
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = { username: getUserObject(req.cookies['username']) };
  res.render('login', templateVars);
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/edit', (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.url;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(`/urls/`);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  if ((email === '') || (password === '')) {
    return res.status(400).send('Missing email or password');
  }

  if (!emailLookUp(email)) {
    return res.status(403).send('Forbidden access');
  }

  const user = getUserObjectByEmail(email);

  if (user.password !== password) {
    return res.status(403).send('Forbidden access');
  }

  res.cookie('username', user.id);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls/');
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if ((email === '') || (password === '')) {
    return res.status(400).send('Missing email or password');
  }

  if (emailLookUp(email)) {
    return res.status(400).send('Email already registered');
  }

  const userID = generateRandomString();
  users[userID] = { id: userID, email: email, password: password };
  
  res.cookie('username', userID);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port: ${PORT}!`);
});