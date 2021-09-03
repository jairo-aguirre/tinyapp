const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const PORT = 8080;

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

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
    password: "d"
  }
};

const generateRandomString = (() => {
  return Math.random().toString(32).substring(2, 8); // string of 6 pseudo-random alphanumeric characters
});

const getUserObject = (type, value) => {
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

const emailLookUp = (email) => {
  for (const key in users) {
    if (users[key].email === email) return true;
  }
  return false;
};

const urlsForUser = (user) => {
  let userUrls = {};

  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === user) {      
      userUrls[key] = {longURL: urlDatabase[key].longURL};
    }
  }

  return userUrls;
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World<b><body><html>\n');
});

app.get('/urls', (req, res) => {
  const userID = req.cookies.user_ID;

  if (userID) {
    const templateVars = { username: getUserObject('user', req.cookies['user_ID']), urls: urlsForUser(userID) };
    
    res.render('urls_index', templateVars);

    return;
  }

  return res.status(401).send('Hi there, please log in or register to access TinyApp');
});

app.get('/urls/new', (req, res) => {
  const templateVars = { username: getUserObject('user', req.cookies['user_ID']) };
  
  if(templateVars.username === null) {
    res.redirect('/login');
    return;
  }
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.cookies.user_ID;
  const userUrls = urlsForUser(userID);
  
  if (userID) {
    if (userUrls[shortURL]) {
      const templateVars = { username: getUserObject('user', userID), shortURL: shortURL, longURL: userUrls[shortURL].longURL };
      res.render('urls_show', templateVars);
      return;
    } else {
      return res.status(404).send('Not found');
    }
  }

  return res.status(401).send('Hi there, please log in or register to access TinyApp');
});

app.get('/register', (req, res) => {
  const templateVars = { user_ID: getUserObject('user', req.cookies['user_ID']) };
  
  if (templateVars.username !== null) {
    res.redirect('/urls');
    return;
  }
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = { username: getUserObject('user', req.cookies['user_ID']) };

  if (templateVars.username !== null) {
    res.redirect('/urls');
    return;
  }

  res.render('login', templateVars);
});

app.post('/urls', (req, res) => {
  const userID = req.cookies.user_ID;
  
  if (userID) {
    const shortURL = generateRandomString();
    const urlObject = {longURL: req.body.longURL, userID: userID}
    urlDatabase[shortURL] = urlObject;
    res.redirect(`/urls/${shortURL}`);
    return;
  }

  return res.status(403).send('Forbidden access');
});

app.post('/urls/:shortURL/edit', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.cookies.user_ID;
  const userUrls = urlsForUser(userID);

  if (userID) {
    if (userUrls[shortURL]) {
      urlDatabase[shortURL].longURL = req.body.url;
      res.redirect(`/urls/${shortURL}`);      
      return;
    } else {
      return res.status(404).send('Not found');
    }
  } else {
    return res.status(401).send('Hi there, please log in or register to access TinyApp');
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.cookies.user_ID;
  const userUrls = urlsForUser(userID);
  
  if (userID) {
    if (userUrls[shortURL]) {
      delete urlDatabase[shortURL];
      res.redirect(`/urls/`);      
      return;
    } else {
      return res.status(404).send('Not found');
    }
  } else {
    return res.status(401).send('Hi there, please log in or register to access TinyApp');
  }
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

  const user = getUserObject('email', email);

  if (user.password !== password) {
    return res.status(403).send('Forbidden access');
  }

  res.cookie('user_ID', user.id);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_ID');
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
  
  res.cookie('user_ID', userID);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port: ${PORT}!`);
});