const express = require('express');
const rateLimit = require('express-rate-limit');
const appRoutes = require('./app/v1/routes/appRoutes');

const app = express();

app.use(express.json());

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.use('/api/v1', appRoutes);
app.get('/', (req, res) => {
  res.send('Server is running');
});

module.exports = app;