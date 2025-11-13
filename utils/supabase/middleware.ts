import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Simple in-memory cache (optional)
interface CachedUserData {
  profile: { is_onboarding_complete: boolean } | null;
  adminRole: { role: string } | null;
  timestamp: number;
}

const userCache = new Map<string, CachedUserData>();
const CACHE_DURATION = 60000; // 1 minute

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isNewPasswordPage = request.nextUrl.pathname === '/auth/new-password';
  const isOnboardingPage = request.nextUrl.pathname.startsWith('/onboarding');
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
  const isHomePage = request.nextUrl.pathname === '/';
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');

  // Allow all API routes to pass through
  if (isApiRoute) {
    return supabaseResponse;
  }

  // Allow access to home page for everyone
  if (isHomePage) {
    return supabaseResponse;
  }

  // Redirect unauthenticated users to login for protected routes
  if (!user && (isDashboardRoute || isOnboardingPage || isAdminRoute)) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (user) {
    // Check cache first
    const cached = userCache.get(user.id);
    let profile, adminRole;

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      profile = cached.profile;
      adminRole = cached.adminRole;
    } else {
      // Fetch fresh data
      const [profileRes, adminRoleRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('is_onboarding_complete')
          .eq('id', user.id)
          .single(),
        supabase
          .from('admin_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle()
      ]);

      profile = profileRes.data;
      adminRole = adminRoleRes.data;

      // Log errors if any
      if (adminRoleRes.error) {
        console.error('Error checking admin role:', adminRoleRes.error);
      }

      // Cache the results
      userCache.set(user.id, {
        profile,
        adminRole,
        timestamp: Date.now()
      });
    }

    const isAdmin = !!adminRole;
    const isOnboardingComplete = profile?.is_onboarding_complete ?? false;

    // Handle authenticated users - only redirect from auth pages if they're trying to access login/register
    if (isAuthRoute && !isNewPasswordPage && (request.nextUrl.pathname === '/auth/login' || request.nextUrl.pathname === '/auth/register')) {
      // User is already logged in, redirect based on status
      if (isAdmin) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      if (!isOnboardingComplete) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Admin users should go to admin panel
    // إذا كان admin وحاول الوصول لـ /dashboard فقط (ليس /admin)
    if (isAdmin && request.nextUrl.pathname === '/dashboard') {
      console.log('✅ Redirecting admin to /admin/dashboard');
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // إذا كان admin وفي أي صفحة dashboard فرعية
    if (isAdmin && isDashboardRoute && request.nextUrl.pathname !== '/admin/dashboard') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // إذا كان admin وفي أي صفحة غير admin (عدا auth و home و onboarding)، وجهه إلى admin/dashboard
    if (isAdmin && !isAdminRoute && !isAuthRoute && !isHomePage && !isOnboardingPage) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // Non-admin users shouldn't access admin routes
    // إذا لم يكن admin وحاول الوصول لصفحات admin
    if (!isAdmin && isAdminRoute) {
      console.log('❌ Redirecting non-admin to /dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Users without completed onboarding should go to onboarding
    if (!isOnboardingComplete && !isOnboardingPage && !isAuthRoute && !isAdmin) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    // Users with completed onboarding shouldn't stay on onboarding page
    if (isOnboardingComplete && isOnboardingPage && !isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Admin users shouldn't stay on onboarding page
    if (isAdmin && isOnboardingPage) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    
  }

  return supabaseResponse;
}
