# @hyperfixi/multi-tenant

Multi-tenant behavior customization and tenant isolation for HyperFixi applications.

## Installation

```bash
npm install @hyperfixi/multi-tenant
```

## Quick Start

```typescript
import { quickStartMultiTenant } from '@hyperfixi/multi-tenant';

// Simple setup with in-memory tenant storage
const system = await quickStartMultiTenant({
  tenants: [
    { id: 'tenant-1', name: 'Acme Corp', domain: 'acme.example.com', plan: 'premium' },
    { id: 'tenant-2', name: 'Beta Inc', domain: 'beta.example.com', plan: 'basic' }
  ],
  identifier: 'domain'
});

// Use the tenant manager
const tenant = await system.tenantManager.resolveTenant({ type: 'domain', value: 'acme.example.com' });
```

## Full Setup

```typescript
import { createMultiTenantSystem, TenantResolver, CustomizationProvider } from '@hyperfixi/multi-tenant';

// Implement your tenant resolver (e.g., database lookup)
const tenantResolver: TenantResolver = {
  async resolveTenant(identifier) { /* ... */ },
  async resolveTenantByDomain(domain) { /* ... */ },
  async resolveTenantBySubdomain(subdomain) { /* ... */ },
  async resolveTenantById(id) { /* ... */ }
};

// Implement your customization provider
const customizationProvider: CustomizationProvider = {
  async getCustomization(tenantId) { /* ... */ },
  async updateCustomization(tenantId, customization) { /* ... */ },
  async deleteCustomization(tenantId) { /* ... */ }
};

// Create the multi-tenant system
const system = createMultiTenantSystem({
  tenantResolver,
  customizationProvider,
  isolation: {
    sandboxLevel: 'strict',
    enableStorageIsolation: true
  },
  caching: {
    enabled: true,
    ttl: 300000 // 5 minutes
  }
});
```

## Express Middleware

```typescript
import express from 'express';
import { createMultiTenantSystem } from '@hyperfixi/multi-tenant';

const app = express();
const system = createMultiTenantSystem({ /* config */ });

// Add tenant middleware
app.use(system.createExpressMiddleware({
  requireTenant: true,
  enableIsolation: true
}));

// Access tenant in routes
app.get('/api/data', (req, res) => {
  const tenant = req.tenant;
  const context = req.tenantContext;
  // ...
});
```

## Elysia Plugin

```typescript
import { Elysia } from 'elysia';
import { createMultiTenantSystem } from '@hyperfixi/multi-tenant';

const system = createMultiTenantSystem({ /* config */ });

const app = new Elysia()
  .use(system.createElysiaPlugin({
    requireTenant: true
  }))
  .get('/api/data', ({ tenant, tenantContext }) => {
    // Access tenant data
  });
```

## Enhanced Pattern (Type-Safe)

```typescript
import { createEnhancedMultiTenant } from '@hyperfixi/multi-tenant';

const result = await createEnhancedMultiTenant(
  { tenantResolver, isolation: { sandboxLevel: 'strict' } },
  { environment: 'backend', identifier: { type: 'domain', value: 'example.com' } }
);

if (result.success && result.value) {
  const context = result.value;

  // Tenant resolution
  const tenant = await context.tenant.resolve('example.com');

  // Feature management
  if (context.features.isEnabled('premium-feature')) {
    // ...
  }

  // Isolation
  context.isolation.enable();

  // Metrics
  context.metrics.collect({ requests: 1, scriptsExecuted: 5 });
}
```

## Features

- **Tenant Resolution**: Resolve tenants by domain, subdomain, header, or custom identifier
- **Isolation**: Data, style, script, event, and storage isolation between tenants
- **Customization**: Per-tenant scripts, styles, components, features, branding, and localization
- **Framework Integration**: Express and Elysia middleware support
- **Feature Flags**: Per-plan feature availability control
- **Permissions**: Role-based access control per tenant
- **Metrics**: Track tenant usage and resource consumption
- **Caching**: TTL-based caching for performance optimization

## Tenant Identification

| Type | Description | Example |
|------|-------------|---------|
| `domain` | Full domain name | `tenant.example.com` |
| `subdomain` | Subdomain only | `tenant` from `tenant.example.com` |
| `id` | Direct tenant ID | `tenant-123` |
| `header` | Custom HTTP header | `X-Tenant-ID: tenant-123` |
| `custom` | Custom resolver function | `(req) => extractTenant(req)` |

## Isolation Levels

| Level | Description |
|-------|-------------|
| `none` | No isolation |
| `basic` | Element and CSS namespacing |
| `strict` | Complete DOM and script separation |
| `complete` | Full sandbox isolation (backend only) |

## License

MIT
