# Class_redis

Node.js REST API + Redis + Docker demo.

## Stack
- **Node.js** (Express) – REST API
- **Redis 7** – In-memory key-value store
- **Docker / Docker Compose** – Container orchestration

## Getting started

```bash
# Copy env file (optional)
cp .env.example .env

# Build and start all services
docker compose up --build

# Stop services
docker compose down
```

The API will be available at `http://localhost:3000`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check (Redis ping) |
| POST | `/set` | Set a key-value pair |
| GET | `/get/:key` | Get a value by key |
| DELETE | `/delete/:key` | Delete a key |
| GET | `/keys` | List all keys |

### Examples

```bash
# Set a key (with optional TTL in seconds)
curl -X POST http://localhost:3000/set \
  -H "Content-Type: application/json" \
  -d '{"key": "name", "value": "redis", "ttl": 60}'

# Get a key
curl http://localhost:3000/get/name

# Delete a key
curl -X DELETE http://localhost:3000/delete/name

# List all keys
curl http://localhost:3000/keys

# Health check
curl http://localhost:3000/health
```

## Local development (without Docker)

```bash
npm install
# Start a local Redis instance first, then:
npm run dev
```
