# API Structure

This API follows a versioned approach with backward compatibility re-exports.

## Structure

```
app/api/
├── v1/                           # Version 1 API (main implementation)
│   ├── activity-log/
│   │   └── route.ts             # GET - Fetch user activity log
│   ├── billing/
│   │   ├── route.ts             # GET - Fetch billing information
│   │   └── actions/
│   │       └── route.ts         # POST - Billing actions (cancel, reactivate, etc.)
│   ├── data-export/
│   │   └── route.ts             # GET - Export user data
│   ├── groups/
│   │   ├── route.ts             # GET - List user groups
│   │   └── [id]/
│   │       └── route.ts         # GET - Get specific group
│   ├── matches/
│   │   ├── route.ts             # GET, POST - List and manage matches
│   │   └── [id]/
│   │       └── route.ts         # GET - Get specific match
│   ├── messages/                # (placeholder for future messaging)
│   ├── onboarding/
│   │   └── route.ts             # GET, POST - User onboarding
│   ├── profile/
│   │   └── route.ts             # GET, POST - User profile management
│   ├── profiles/                # (placeholder for future profiles)
│   ├── resend/
│   │   └── route.ts             # POST - Resend email (disabled)
│   ├── seed/
│   │   └── route.ts             # GET - Seed database with test data
│   └── version/
│       └── route.ts             # GET - Returns API version {"version":"1"}
│
└── [endpoint]/                   # Backward compatibility re-exports
    └── route.ts                 # Re-exports from v1 for legacy clients
```

## Usage

### New Clients (Recommended)
Use the versioned endpoints:
- `GET /api/v1/groups`
- `GET /api/v1/matches`
- `POST /api/v1/onboarding`
- `GET /api/v1/version`
- etc.

### Legacy Clients (Temporary)
Old endpoints still work via re-exports:
- `GET /api/groups` → redirects to `/api/v1/groups`
- `GET /api/matches` → redirects to `/api/v1/matches`
- etc.

**Note:** Legacy endpoints will be removed in a future version. Please migrate to `/api/v1/*` endpoints.

## Available Endpoints

### Activity Log
- `GET /api/v1/activity-log` - Fetch user activity log

### Billing
- `GET /api/v1/billing` - Get billing information (subscription, payment method, history)
- `POST /api/v1/billing/actions` - Perform billing actions (cancel, reactivate, update payment method, create subscription)

### Data Export
- `GET /api/v1/data-export` - Export user data as JSON

### Groups
- `GET /api/v1/groups` - List user groups (supports `?filter=my-groups` or `?filter=all`)
- `GET /api/v1/groups/[id]` - Get specific group details

### Matches
- `GET /api/v1/matches` - List user matches with profiles
- `POST /api/v1/matches` - Accept or reject a match
- `GET /api/v1/matches/[id]` - Get specific match details

### Onboarding
- `GET /api/v1/onboarding` - Get user onboarding status and data
- `POST /api/v1/onboarding` - Submit onboarding data

### Profile
- `GET /api/v1/profile` - Get user profile data
- `POST /api/v1/profile` - Update user profile (supports partial updates)

### Resend
- `POST /api/v1/resend` - Resend verification email (currently disabled)

### Seed
- `GET /api/v1/seed` - Seed database with test data (development only)

### Version
- `GET /api/v1/version` - Get API version information

## Migration Guide

To migrate from legacy endpoints to v1:

1. Update all API calls to use `/api/v1/` prefix
2. Test thoroughly in a staging environment
3. Deploy changes
4. Monitor for any issues

Example:
```typescript
// Before
fetch('/api/groups')

// After
fetch('/api/v1/groups')
```

## Future Versions

When v2 is released:
- v1 endpoints will remain available
- v2 will be available at `/api/v2/*`
- Legacy re-exports will be removed
- Clients will have a clear migration path




