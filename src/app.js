const express = require('express');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(express.json());

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.get('/', (req, res) => {
  res.send('Server is running');
});

module.exports = app;