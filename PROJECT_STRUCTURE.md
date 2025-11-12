# Project Structure Documentation

## 📁 Complete Directory Structure

```
supabase-auth-main/
├── app/                          # Next.js App Router directory
│   ├── (onboarding)/            # Route group for onboarding flow
│   │   └── onboarding/         # Onboarding pages (steps 1-8)
│   ├── about/                   # About page
│   ├── api/                     # API routes (Backend endpoints)
│   │   ├── activity-log/        # Activity logging endpoints
│   │   ├── billing/             # Billing & subscription management
│   │   ├── data-export/         # User data export functionality
│   │   ├── groups/              # Group management endpoints
│   │   ├── matches/             # Match functionality endpoints
│   │   ├── messages/            # Messaging endpoints
│   │   ├── onboarding/          # Onboarding API endpoints
│   │   ├── profile/             # Profile management endpoints
│   │   ├── profiles/            # User profiles endpoints
│   │   ├── resend/              # Email resend functionality
│   │   └── seed/                # Database seeding endpoint
│   ├── auth/                    # Authentication pages
│   │   ├── login/               # Login page
│   │   ├── signup/              # Signup page
│   │   ├── verify/              # Email verification page
│   │   ├── reset-password/      # Password reset request page
│   │   └── new-password/        # New password setup page
│   ├── dashboard/               # Protected dashboard pages
│   │   ├── billing/             # Billing management
│   │   ├── groups/              # Groups management
│   │   ├── matches/             # Matches view
│   │   ├── messages/            # Messaging interface
│   │   ├── notifications/       # Notifications center
│   │   ├── profile/             # User profile pages
│   │   ├── settings/            # Settings & preferences
│   │   └── page.tsx             # Main dashboard page
│   ├── faq/                     # FAQ page
│   ├── pricing/                 # Pricing page
│   ├── privacy/                  # Privacy policy page
│   ├── support/                  # Support page
│   ├── terms/                    # Terms of service page
│   ├── cancellation/             # Cancellation page
│   ├── layout.tsx               # Root layout component
│   ├── page.tsx                 # Home page
│   ├── globals.css              # Global styles
│   └── favicon.ico              # Site favicon
│
├── components/                   # React components directory
│   ├── auth/                    # Authentication components
│   │   ├── auth-form.tsx        # Base auth form component
│   │   ├── login-form.tsx       # Login form
│   │   ├── signup-form.tsx      # Signup form
│   │   ├── verify-form.tsx      # Email verification form
│   │   ├── reset-password-form.tsx
│   │   └── new-password-form.tsx
│   ├── dashboard/               # Dashboard-specific components
│   │   ├── activity-list.tsx    # Activity log list
│   │   ├── activity-log.tsx     # Activity log component
│   │   ├── cancel-subscription-dialog.tsx
│   │   ├── chart-card.tsx       # Chart display card
│   │   ├── dashboard-layout.tsx # Dashboard layout wrapper
│   │   ├── data-export.tsx      # Data export component
│   │   ├── feedback-modal.tsx   # Feedback collection modal
│   │   ├── notification-bell.tsx # Notification bell icon
│   │   ├── placeholder-chart.tsx
│   │   ├── pricing-modal.tsx    # Pricing modal
│   │   ├── stats-card.tsx       # Statistics card component
│   │   ├── two-factor-auth.tsx  # 2FA setup component
│   │   └── welcome-section.tsx  # Welcome banner
│   ├── layout/                  # Layout components
│   │   ├── content-page-layout.tsx
│   │   ├── main-footer.tsx      # Site footer
│   │   └── main-nav.tsx         # Main navigation
│   ├── onboarding/              # Onboarding step components
│   │   ├── Step1.tsx through Step8.tsx
│   ├── theme/                   # Theme components
│   │   ├── theme-provider.tsx   # Theme context provider
│   │   └── theme-toggle.tsx     # Theme switcher button
│   └── ui/                      # shadcn/ui components
│       ├── alert.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── progress.tsx
│       ├── radio-group.tsx
│       ├── separator.tsx
│       ├── sonner.tsx           # Toast notifications
│       ├── switch.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       └── textarea.tsx
│
├── lib/                         # Library & utility functions
│   ├── emails/                  # Email templates (React Email)
│   │   ├── password-reset-confirmation-email.tsx
│   │   ├── reset-password-email.tsx
│   │   ├── verification-email.tsx
│   │   └── welcome-email.tsx
│   ├── notifications.ts         # Notification utilities
│   └── utils/                   # Utility functions
│       ├── auth-helpers.ts      # Authentication helpers
│       └── validation.ts        # Form validation schemas (Zod)
│
├── utils/                       # Additional utilities
│   └── supabase/               # Supabase client utilities
│       ├── client.ts           # Browser client creation
│       ├── server.ts           # Server-side client creation
│       └── middleware.ts      # Auth middleware logic
│
├── types/                       # TypeScript type definitions
│   └── onboarding.ts           # Onboarding flow types
│
├── supabase/                    # Supabase configuration
│   └── migrations/             # Database migrations
│       ├── 20241029_add_matchable_and_feedback.sql
│       ├── 20241030_notifications_system.sql
│       └── 20241031_billing_system.sql
│
├── public/                      # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── .env                         # Environment variables (not in repo)
├── .env.local                   # Local environment variables
├── .gitignore                   # Git ignore rules
├── components.json              # shadcn/ui configuration
├── eslint.config.mjs            # ESLint configuration
├── middleware.ts                # Next.js middleware (auth routing)
├── next.config.ts               # Next.js configuration
├── next-env.d.ts               # Next.js TypeScript definitions
├── package.json                 # NPM dependencies & scripts
├── package-lock.json            # NPM lock file
├── postcss.config.mjs           # PostCSS configuration
├── seed.js                      # Database seeding script
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
│
└── Documentation files:
    ├── README.md
    ├── CHANGES_README.md
    ├── DEVELOPER_GUIDE.md
    ├── IMPLEMENTATION_INDEX.md
    ├── IMPLEMENTATION_SUMMARY.md
    ├── NEXT_IMPLEMENTATION_README_AR.md
    ├── NOTIFICATIONS_GUIDE.md
    ├── NOTIFICATIONS_SUMMARY.md
    ├── QUICK_START.md
    └── SETUP_ENV.md
```

---

## 📋 File Descriptions

### Configuration Files

#### `package.json`
- **Purpose**: Defines project dependencies and scripts
- **Key Dependencies**:
  - Next.js 15.2.2 (App Router)
  - React 19
  - Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
  - shadcn/ui components (Radix UI)
  - Form handling (`react-hook-form`, `zod`)
  - Email (`@react-email/components`, `resend`)
  - Styling (`tailwindcss`, `next-themes`)

#### `tsconfig.json`
- **Purpose**: TypeScript compiler configuration
- **Key Settings**:
  - Path aliases: `@/*` mapped to root
  - Strict mode enabled
  - ES2017 target
  - Next.js plugin enabled

#### `next.config.ts`
- **Purpose**: Next.js framework configuration
- **Current**: Minimal configuration (can be extended)

#### `tailwind.config.js`
- **Purpose**: Tailwind CSS styling configuration
- **Features**:
  - Dark mode support (class-based)
  - Custom color variables (HSL)
  - Container configuration
  - Animation utilities

#### `components.json`
- **Purpose**: shadcn/ui component library configuration
- **Settings**:
  - Style: "new-york"
  - RSC: true (React Server Components)
  - Path aliases for components, utils, lib

#### `middleware.ts`
- **Purpose**: Next.js middleware for authentication & routing
- **Functionality**:
  - Session management
  - Route protection
  - Onboarding flow enforcement
  - Admin role checking
  - User cache (1-minute TTL)

---

## 🔧 Core Directories Explained

### `/app` - Next.js App Router
**Purpose**: Contains all pages and API routes using Next.js 15 App Router

**Structure**:
- **Route Groups**: `(onboarding)` - Groups routes without affecting URL
- **Dynamic Routes**: `[id]` - Dynamic route segments
- **API Routes**: Server-side endpoints under `/api`
- **Layouts**: `layout.tsx` - Wraps pages with shared UI

**Best Practices**:
- ✅ Co-locate related files
- ✅ Use route groups for organization
- ✅ Keep API routes in `/api` subdirectory
- ✅ Use server components by default

### `/components` - React Components
**Purpose**: Reusable UI components organized by feature

**Organization**:
- **`/auth`**: Authentication forms
- **`/dashboard`**: Dashboard-specific components
- **`/layout`**: Layout components (nav, footer)
- **`/onboarding`**: Onboarding step components
- **`/theme`**: Theme management
- **`/ui`**: shadcn/ui base components

**Best Practices**:
- ✅ Group by feature/domain
- ✅ Keep components small and focused
- ✅ Use composition over inheritance
- ✅ Export components from index files (optional)

### `/lib` - Library Code
**Purpose**: Shared utilities, helpers, and business logic

**Contents**:
- **`/emails`**: React Email templates
- **`/utils`**: Validation schemas, auth helpers
- **`notifications.ts`**: Notification utilities

**Best Practices**:
- ✅ Keep utilities pure functions when possible
- ✅ Use TypeScript for type safety
- ✅ Avoid side effects in utilities
- ✅ Document complex functions

### `/utils/supabase` - Supabase Clients
**Purpose**: Supabase client instances for different contexts

**Files**:
- **`client.ts`**: Browser client (client-side)
- **`server.ts`**: Server client (server components, API routes)
- **`middleware.ts`**: Middleware authentication logic

**Best Practices**:
- ✅ Always use appropriate client for context
- ✅ Never use browser client in server components
- ✅ Handle cookie management properly
- ✅ Cache user data appropriately

### `/types` - Type Definitions
**Purpose**: TypeScript type definitions and interfaces

**Current**: `onboarding.ts` - Comprehensive onboarding types

**Best Practices**:
- ✅ Co-locate types with components when used together
- ✅ Use shared types in `/types` for cross-cutting concerns
- ✅ Prefer interfaces over types for extensibility
- ✅ Use Zod for runtime validation

### `/supabase/migrations` - Database Migrations
**Purpose**: Database schema changes (version-controlled)

**Best Practices**:
- ✅ Use descriptive migration names with dates
- ✅ Make migrations idempotent when possible
- ✅ Test migrations before applying
- ✅ Never modify existing migrations (create new ones)

---

## 🎯 Best Practices

### 1. **Project Structure Best Practices**

#### Directory Organization
```
✅ DO:
- Group related files together
- Use consistent naming conventions
- Keep component files co-located with pages when tightly coupled
- Separate concerns (components, utils, types, etc.)

❌ DON'T:
- Create deeply nested directories (>3 levels)
- Mix concerns in single directories
- Use inconsistent naming (camelCase vs kebab-case)
```

#### File Naming
```
✅ DO:
- Use kebab-case for files: `user-profile.tsx`
- Use PascalCase for components: `UserProfile`
- Use camelCase for utilities: `formatDate`
- Use descriptive names: `reset-password-form.tsx` not `form.tsx`

❌ DON'T:
- Use generic names: `component.tsx`, `utils.ts`
- Mix naming conventions
- Use abbreviations unless widely understood
```

### 2. **Next.js App Router Best Practices**

#### Server vs Client Components
```typescript
✅ DO: Use Server Components by default
// app/dashboard/page.tsx
export default async function Dashboard() {
  const data = await fetchData(); // Server-side
  return <DashboardClient data={data} />;
}

❌ DON'T: Use 'use client' unnecessarily
// Only add 'use client' when needed:
// - useState, useEffect, onClick handlers
// - Browser APIs (localStorage, window)
// - Third-party libraries requiring client
```

#### API Routes
```typescript
✅ DO: Use typed responses and error handling
// app/api/users/route.ts
export async function GET(request: Request) {
  try {
    const users = await getUsers();
    return Response.json({ users }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

❌ DON'T: Return raw objects or unhandled errors
```

#### Route Organization
```
✅ DO:
- Use route groups: (dashboard), (auth)
- Co-locate related files
- Use dynamic routes: [id], [slug]
- Implement proper loading.tsx and error.tsx

❌ DON'T:
- Create unnecessary nesting
- Mix API routes with pages
- Put server logic in page components
```

### 3. **TypeScript Best Practices**

#### Type Safety
```typescript
✅ DO: Use strict types
interface User {
  id: string;
  email: string;
  name?: string; // Optional with ?
}

✅ DO: Use type inference when clear
const users = await getUsers(); // Type inferred from return

✅ DO: Use Zod for runtime validation
import { z } from 'zod';
const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});
```

#### Type Organization
```typescript
✅ DO: Export types from dedicated files
// types/user.ts
export interface User { ... }
export type UserRole = 'admin' | 'user';

✅ DO: Use type utilities
type UserUpdate = Partial<User>;
type UserEmail = Pick<User, 'email'>;
```

### 4. **Supabase Best Practices**

#### Client Usage
```typescript
✅ DO: Use correct client for context
// Browser: utils/supabase/client.ts
'use client';
const supabase = createClient();

// Server: utils/supabase/server.ts
const supabase = await createClient();

// Middleware: utils/supabase/middleware.ts
// Already configured in middleware.ts

❌ DON'T: Mix client types
// Never use browser client in server components
// Never use server client in client components
```

#### Security
```typescript
✅ DO: Use Row Level Security (RLS)
- Enable RLS on all tables
- Create policies for user access
- Never expose service role key to client

✅ DO: Validate inputs
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId) // Always filter by user
  .single();
```

#### Error Handling
```typescript
✅ DO: Check for errors
const { data, error } = await supabase.from('users').select();
if (error) {
  console.error('Supabase error:', error);
  return { error: error.message };
}
```

### 5. **Component Best Practices**

#### Component Structure
```typescript
✅ DO: Keep components focused
export function UserCard({ user }: { user: User }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{user.email}</p>
      </CardContent>
    </Card>
  );
}

✅ DO: Use composition
function Dashboard() {
  return (
    <DashboardLayout>
      <WelcomeSection />
      <StatsCards />
      <ActivityLog />
    </DashboardLayout>
  );
}
```

#### Props & State
```typescript
✅ DO: Use TypeScript for props
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

✅ DO: Use React Hook Form for forms
const { register, handleSubmit } = useForm<FormData>({
  resolver: zodResolver(formSchema),
});
```

### 6. **Styling Best Practices**

#### Tailwind CSS
```typescript
✅ DO: Use utility classes
<button className="px-4 py-2 bg-blue-500 text-white rounded">
  Click me
</button>

✅ DO: Use cn() utility for conditional classes
import { cn } from '@/lib/utils';
<button className={cn(
  'px-4 py-2 rounded',
  isActive && 'bg-blue-500',
  isDisabled && 'opacity-50'
)}>
```

#### CSS Variables
```css
✅ DO: Use CSS variables for theming
:root {
  --primary: 210 100% 50%;
  --background: 0 0% 100%;
}
```

### 7. **Environment Variables**

```bash
✅ DO: Use environment variables
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

✅ DO: Prefix client-side vars with NEXT_PUBLIC_
✅ DO: Never commit .env.local
✅ DO: Document required env vars in README
```

### 8. **Authentication & Authorization**

```typescript
✅ DO: Protect routes in middleware
export async function middleware(request: NextRequest) {
  const { user } = await getSession(request);
  
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  return NextResponse.next();
}

✅ DO: Verify user in API routes
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 9. **Error Handling**

```typescript
✅ DO: Handle errors gracefully
try {
  const result = await riskyOperation();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'Unknown error' 
  };
}

✅ DO: Use error boundaries
// app/error.tsx
'use client';
export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### 10. **Performance Best Practices**

```typescript
✅ DO: Use Next.js Image component
import Image from 'next/image';
<Image src="/logo.png" alt="Logo" width={200} height={200} />

✅ DO: Implement loading states
export default function Loading() {
  return <div>Loading...</div>;
}

✅ DO: Use React.memo for expensive components
export const ExpensiveComponent = React.memo(({ data }) => {
  // Expensive rendering
});

✅ DO: Cache data appropriately
// Middleware caching (already implemented)
// API route caching
export const revalidate = 3600; // Revalidate every hour
```

---

## 🔒 Security Best Practices

1. **Never expose sensitive keys**: Service role keys should never be in client code
2. **Validate all inputs**: Use Zod schemas for API route validation
3. **Use RLS**: Enable Row Level Security on all Supabase tables
4. **Sanitize user input**: Never trust client-side data
5. **Use HTTPS**: Always in production
6. **Implement rate limiting**: For API routes (especially auth endpoints)
7. **CSRF protection**: Next.js handles this automatically
8. **XSS prevention**: React escapes content by default

---

## 📦 Dependency Management

### Core Dependencies
- **Next.js 15**: React framework with App Router
- **React 19**: UI library
- **Supabase**: Backend-as-a-Service
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Zod**: Runtime validation
- **React Hook Form**: Form handling

### Best Practices
```bash
✅ DO: Use exact versions in production
✅ DO: Keep dependencies updated
✅ DO: Review dependency changes
✅ DO: Use npm audit to check vulnerabilities
npm audit

✅ DON'T: Commit node_modules
✅ DON'T: Use * for version ranges in production
```

---

## 🚀 Deployment Best Practices

1. **Environment Variables**: Set all required env vars in hosting platform
2. **Build Optimization**: Run `npm run build` locally before deploying
3. **Database Migrations**: Run migrations before deploying code
4. **Monitoring**: Set up error tracking (Sentry, etc.)
5. **Performance**: Enable Next.js production optimizations
6. **CDN**: Use Vercel Edge Network or similar CDN

---

## 📝 Code Quality

### Linting & Formatting
```bash
✅ DO: Run linter before committing
npm run lint

✅ DO: Use consistent formatting
# Consider adding Prettier
```

### Git Workflow
```
✅ DO: Use descriptive commit messages
✅ DO: Create feature branches
✅ DO: Review code before merging
✅ DON'T: Commit .env files
✅ DON'T: Commit node_modules
```

---

## 🎨 UI/UX Best Practices

1. **Loading States**: Always show loading indicators
2. **Error Messages**: Provide clear, actionable error messages
3. **Form Validation**: Validate on submit and show errors inline
4. **Accessibility**: Use semantic HTML and ARIA labels
5. **Responsive Design**: Test on mobile, tablet, desktop
6. **Dark Mode**: Support theme switching (already implemented)

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Hook Form](https://react-hook-form.com)
- [Zod Documentation](https://zod.dev)

---

## ✅ Checklist for New Features

When adding new features, ensure:

- [ ] TypeScript types are defined
- [ ] Components are properly typed
- [ ] Error handling is implemented
- [ ] Loading states are shown
- [ ] Form validation is added (if applicable)
- [ ] API routes are protected
- [ ] Database migrations are created (if needed)
- [ ] Environment variables are documented
- [ ] Code follows project structure
- [ ] Tests are written (if applicable)

---

**Last Updated**: Based on current project structure
**Project Type**: Next.js 15 + Supabase Authentication Application
**Architecture**: App Router (Server Components) + Client Components




