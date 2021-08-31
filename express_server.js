const express = require('express');
const bodyParser = require('body-parser');

const PORT = 8080;

const generateRandomString = (() => {
  return Math.random().toString(32).substring(2, 8); // string of 6 pseudo-random alphanumeric characters
});

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.nfl.com",
  "9sm5xK": "http://www.canada.ca"
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

app.post('/urls', (req, res) => {
  console.log(req.body);
  res.send('200 OK');
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World<b><body><html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port: ${PORT}!`);
});