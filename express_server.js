const express = require('express');
const app = express();
const PORT = 8080;

const urlDatabase = {
  "b2xVn2": "http://www.nfl.com",
  "9sm5xK": "http://www.canada.ca"
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port: ${PORT}!`);
});