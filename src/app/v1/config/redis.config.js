const { createClient } = require('redis');
const { REDIS_URL } = require('./env.config');

const client = createClient({ url: REDIS_URL });

client.on('error', (err) => console.error(`[${new Date().toISOString()}] Redis client error:`, err.message));
client.on('connect', () => console.log(`[${new Date().toISOString()}] Connected to Redis`));

module.exports = client;
