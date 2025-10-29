# Quick Reference: Best Practices Checklist

## 🏗️ Project Structure

### ✅ DO:
- ✅ Organize files by feature/domain
- ✅ Use consistent naming (kebab-case for files, PascalCase for components)
- ✅ Keep components small and focused
- ✅ Group related files together
- ✅ Use route groups for organization `(groupName)`

### ❌ DON'T:
- ❌ Create deeply nested directories (>3 levels)
- ❌ Use generic file names (`component.tsx`, `utils.ts`)
- ❌ Mix concerns in single directories
- ❌ Mix naming conventions

---

## 🎯 Next.js App Router

### Server vs Client Components
```typescript
// ✅ DO: Default to Server Components
export default async function Page() {
  const data = await fetchData();
  return <ClientComponent data={data} />;
}

// ✅ DO: Use 'use client' only when needed
'use client'; // Only for: useState, useEffect, event handlers, browser APIs
```

### API Routes
```typescript
// ✅ DO: Always handle errors
export async function GET() {
  try {
    const data = await getData();
    return Response.json({ data }, { status: 200 });
  } catch (error) {
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}
```

---

## 🔐 Supabase

### Client Usage
```typescript
// ✅ Browser: utils/supabase/client.ts
'use client';
const supabase = createClient();

// ✅ Server: utils/supabase/server.ts
const supabase = await createClient();

// ❌ DON'T: Mix client types
```

### Security
- ✅ Enable Row Level Security (RLS) on all tables
- ✅ Never expose service role key to client
- ✅ Always validate user input
- ✅ Filter queries by user ID

---

## 📝 TypeScript

### Type Safety
```typescript
// ✅ DO: Use interfaces for objects
interface User {
  id: string;
  email: string;
  name?: string;
}

// ✅ DO: Use Zod for runtime validation
import { z } from 'zod';
const schema = z.object({
  email: z.string().email(),
});
```

---

## 🎨 Components

### Structure
```typescript
// ✅ DO: Keep components focused
export function UserCard({ user }: { user: User }) {
  return <Card>{user.name}</Card>;
}

// ✅ DO: Use composition
function Dashboard() {
  return (
    <Layout>
      <Header />
      <Content />
    </Layout>
  );
}
```

### Forms
```typescript
// ✅ DO: Use React Hook Form + Zod
const { register, handleSubmit } = useForm({
  resolver: zodResolver(schema),
});
```

---

## 🎨 Styling

```typescript
// ✅ DO: Use Tailwind utilities
<div className="px-4 py-2 bg-blue-500 rounded">

// ✅ DO: Use cn() for conditional classes
import { cn } from '@/lib/utils';
<div className={cn('base-class', condition && 'conditional-class')}>
```

---

## 🔒 Security Checklist

- [ ] Never expose service role keys
- [ ] Validate all inputs with Zod
- [ ] Enable RLS on Supabase tables
- [ ] Sanitize user input
- [ ] Use HTTPS in production
- [ ] Implement rate limiting for API routes
- [ ] Protect sensitive routes in middleware

---

## 🚀 Before Deploying

- [ ] Set all environment variables
- [ ] Run `npm run build` successfully
- [ ] Run database migrations
- [ ] Test authentication flow
- [ ] Check error handling
- [ ] Verify RLS policies
- [ ] Test on mobile devices
- [ ] Enable error monitoring

---

## 📦 Adding New Features

- [ ] Create TypeScript types
- [ ] Add form validation (if needed)
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Protect API routes
- [ ] Create database migrations (if needed)
- [ ] Update environment variables documentation
- [ ] Follow project structure conventions

---

## 🔍 Quick Commands

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint

# Database
npm run seed            # Seed database (with .env)
```

---

## 📚 Key File Locations

- **Pages**: `app/*/page.tsx`
- **API Routes**: `app/api/*/route.ts`
- **Components**: `components/*/`
- **Utils**: `lib/utils/` or `utils/supabase/`
- **Types**: `types/*.ts`
- **Migrations**: `supabase/migrations/*.sql`
- **Config**: Root level (`next.config.ts`, `tailwind.config.js`)

---

## 🎯 Quick Tips

1. **Always use Server Components by default** - Only add 'use client' when necessary
2. **Protect routes in middleware** - Don't rely only on client-side checks
3. **Validate with Zod** - Both client and server side
4. **Cache appropriately** - Already implemented in middleware (1-min TTL)
5. **Handle errors gracefully** - Always show user-friendly messages
6. **Use TypeScript strictly** - Leverage type safety
7. **Follow existing patterns** - Maintain consistency

---

For detailed documentation, see `PROJECT_STRUCTURE.md`

