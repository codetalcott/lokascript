# @lokascript/server-integration

Server-side hyperscript compilation API with enterprise features: API key authentication, tiered rate limiting, Stripe billing integration, and usage tracking.

## Features

- **Hyperscript Compilation**: Compile hyperscript to optimized JavaScript via HTTP API
- **API Key Authentication**: Secure access with hashed API keys and tiered permissions
- **Rate Limiting**: Tier-based rate limits (free: 60/min, pro: 600/min, team: 3000/min)
- **Stripe Billing**: Usage-based metering, webhook handlers, subscription management
- **Usage Tracking**: Per-request logging with response times and error counts
- **PostgreSQL Storage**: Persistent storage for keys, usage logs, and billing events

## Installation

```bash
npm install @lokascript/server-integration
```

## Quick Start

```typescript
import { HyperfixiService } from '@lokascript/server-integration';

const service = new HyperfixiService({
  port: 3000,
  database: process.env.DATABASE_URL,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  apiKeySalt: process.env.API_KEY_SALT,
});

await service.start();
console.log('LokaScript API running on http://localhost:3000');
```

## Server-Side Hyperscript Routes (New!)

The server-integration package now supports declarative HTTP request handling using hyperscript syntax. This enables you to write API routes directly in hyperscript!

### Quick Start with Request Event Source

```typescript
import express from 'express';
import { setupHyperscriptRoutes } from '@lokascript/server-integration';

const app = express();
app.use(express.json());

// Setup hyperscript routes (registers event source and context providers)
await setupHyperscriptRoutes(app, { debug: true });

// Now compile hyperscript route handlers
const { hyperscript } = await import('@lokascript/core');

await hyperscript.compileAsync(`
  on request(GET, /api/users)
    set users to [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" }
    ]
    call response.json(users)
  end

  on request(GET, /api/users/:id)
    set userId to params.id
    set user to { id: userId, name: "User " + userId }
    call response.json(user)
  end

  on request(POST, /api/users)
    set newUser to request.body
    log "Creating user: " newUser.name
    call response.status(201).json(newUser)
  end
`);

app.listen(3000);
```

### Available Context Variables

When using `on request()` event handlers, these variables are automatically available:

- `request` - The HTTP request object
- `response` - The HTTP response builder
- `params` - URL route parameters (e.g., `:id` in `/users/:id`)
- `query` - URL query parameters
- `body` - Parsed request body (JSON)
- `headers` - Request headers
- `method` - HTTP method (GET, POST, etc.)
- `path` - Request path

### Response Methods

The `response` object provides these methods:

```hyperscript
-- Set status code
call response.status(200)

-- Set headers
call response.header("Content-Type", "application/json")

-- Send JSON response
call response.json({ message: "Hello" })

-- Send HTML response
call response.html("<h1>Hello</h1>")

-- Send text response
call response.text("Hello")

-- Redirect
call response.redirect("/new-path")
call response.redirect("/new-path", 301)

-- Generic send
call response.send(data)

-- Chain methods
call response.status(201).json({ created: true })
```

### RESTful API Example

```hyperscript
-- List all items
on request(GET, /api/items)
  set items to db.items.findAll()
  call response.json(items)
end

-- Get single item
on request(GET, /api/items/:id)
  set item to db.items.findById(params.id)
  if item exists
    call response.json(item)
  else
    call response.status(404).json({ error: "Not found" })
  end
end

-- Create item
on request(POST, /api/items)
  set newItem to db.items.create(request.body)
  call response.status(201).json(newItem)
end

-- Update item
on request(PUT, /api/items/:id)
  set updated to db.items.update(params.id, request.body)
  call response.json(updated)
end

-- Delete item
on request(DELETE, /api/items/:id)
  call db.items.delete(params.id)
  call response.status(204).send()
end
```

### Manual Setup (Advanced)

For more control, you can manually configure the request event source:

```typescript
import { createHyperscriptRoutesMiddleware } from '@lokascript/server-integration';
import { registry } from '@lokascript/core/registry';

const middleware = createHyperscriptRoutesMiddleware({
  registry,
  debug: true,
  alwaysCallNext: false, // Don't continue if hyperscript handled it
  onError: (error, req, res) => {
    console.error('Route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  },
});

app.use(middleware);
```

## API Endpoints

### POST /api/compile

Compile hyperscript to JavaScript.

**Request:**

```bash
curl -X POST http://localhost:3000/api/compile \
  -H "X-API-Key: hfx_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "scripts": {
      "main": "on click toggle .active",
      "counter": "on click increment :count then put it into me"
    }
  }'
```

**Response:**

```json
{
  "success": true,
  "compiled": {
    "main": "(function(){ /* compiled JS */ })();",
    "counter": "(function(){ /* compiled JS */ })();"
  },
  "metadata": {
    "main": {
      "events": ["click"],
      "commands": ["toggle"],
      "dependencies": []
    },
    "counter": {
      "events": ["click"],
      "commands": ["increment", "put"],
      "dependencies": []
    }
  },
  "timing": {
    "totalMs": 12,
    "perScript": { "main": 5, "counter": 7 }
  }
}
```

### GET /health

Health check endpoint (no authentication required).

```bash
curl http://localhost:3000/health
```

## Configuration

| Environment Variable    | Description                   | Required |
| ----------------------- | ----------------------------- | -------- |
| `DATABASE_URL`          | PostgreSQL connection string  | Yes      |
| `STRIPE_SECRET_KEY`     | Stripe API secret key         | Yes      |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Yes      |
| `API_KEY_SALT`          | Salt for hashing API keys     | Yes      |
| `PORT`                  | Server port (default: 3000)   | No       |
| `STRIPE_PRO_PRICE_ID`   | Stripe price ID for Pro tier  | No       |
| `STRIPE_TEAM_PRICE_ID`  | Stripe price ID for Team tier | No       |

## Rate Limits

Requests are rate-limited per API key based on subscription tier:

| Tier | Requests/Minute | Monthly Compiles |
| ---- | --------------- | ---------------- |
| Free | 60              | 1,000            |
| Pro  | 600             | Unlimited        |
| Team | 3,000           | Unlimited        |

Rate limit headers are included in all responses:

- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when window resets

## Database Setup

Apply the schema to your PostgreSQL database:

```bash
psql $DATABASE_URL < src/db/schema.sql
```

The schema includes:

- `users`: User accounts linked to Stripe customers
- `api_keys`: Hashed API keys with tier and usage tracking
- `usage_logs`: Detailed per-request usage logs
- `usage_monthly`: Monthly usage aggregates
- `rate_limit_events`: Rate limit violation logging
- `stripe_events`: Webhook idempotency tracking

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Type checking
npm run typecheck

# Development server
npm run dev

# Build
npm run build
```

## Testing

The package includes comprehensive tests for:

- Hyperscript compiler (25 tests)
- Database client (31 tests)
- Authentication middleware (20 tests)
- Rate limiting middleware (14 tests)
- Usage tracking middleware (15 tests)
- Stripe webhooks (14 tests)

Run all tests:

```bash
npm test -- --run
```

## License

MIT
