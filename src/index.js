require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const { createClient } = require('redis');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const client = createClient({ url: REDIS_URL });

client.on('error', (err) => console.error(`[${new Date().toISOString()}] Redis client error:`, err.message));
client.on('connect', () => console.log(`[${new Date().toISOString()}] Connected to Redis`));

(async () => {
  try {
    await client.connect();
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Failed to connect to Redis:`, err.message);
    process.exit(1);
  }
})();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

app.use(limiter);

const KEY_PATTERN = /^[a-zA-Z0-9_:.-]{1,256}$/;

function isValidKey(key) {
  return typeof key === 'string' && KEY_PATTERN.test(key);
}

// Set a key
app.post('/set', async (req, res) => {
  const { key, value, ttl } = req.body;
  if (!isValidKey(key) || value === undefined) {
    return res.status(400).json({ error: 'key (alphanumeric/underscore/colon/dot/dash, max 256 chars) and value are required' });
  }
  const options = ttl !== undefined ? { EX: Math.max(1, Math.floor(Number(ttl))) } : {};
  await client.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value), options);
  res.json({ message: `Key "${key}" set successfully` });
});

// Get a key
app.get('/get/:key', async (req, res) => {
  const { key } = req.params;
  if (!isValidKey(key)) {
    return res.status(400).json({ error: 'Invalid key format' });
  }
  const value = await client.get(key);
  if (value === null) {
    return res.status(404).json({ error: `Key "${key}" not found` });
  }
  let parsed = value;
  try { parsed = JSON.parse(value); } catch (_) {}
  res.json({ key, value: parsed });
});

// Delete a key
app.delete('/delete/:key', async (req, res) => {
  const { key } = req.params;
  if (!isValidKey(key)) {
    return res.status(400).json({ error: 'Invalid key format' });
  }
  const deleted = await client.del(key);
  if (deleted === 0) {
    return res.status(404).json({ error: `Key "${key}" not found` });
  }
  res.json({ message: `Key "${key}" deleted successfully` });
});

// List all keys using SCAN (non-blocking), limited to first 1000
app.get('/keys', async (req, res) => {
  const keys = [];
  const limit = 1000;
  for await (const key of client.scanIterator({ MATCH: '*', COUNT: 100 })) {
    keys.push(key);
    if (keys.length >= limit) break;
  }
  res.json({ keys, truncated: keys.length >= limit });
});

// Health check
app.get('/health', async (req, res) => {
  const ping = await client.ping();
  res.json({ status: 'ok', redis: ping });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
