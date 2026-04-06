require('dotenv').config();

const app = require('./src/app');
const client = require('./src/app/v1/config/redis.config');

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await client.connect();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
})();