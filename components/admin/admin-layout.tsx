'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { AdminSidebar } from './admin-sidebar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { User } from '@supabase/supabase-js';
import { Crown, Shield, LogOut } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
      
      if (sessionErr || !session) {
        router.push('/auth/login');
        return;
      }

      setUser(session.user);

      // Check admin role - try direct query first
      const { data: adminRole, error: adminError } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (adminError) {
        console.error('Error checking admin role:', adminError);
        console.error('Error details:', {
          message: adminError.message,
          code: adminError.code,
          details: adminError.details,
          hint: adminError.hint
        });
        
        // Try using RPC function as fallback
        const { data: isAdminCheck, error: rpcError } = await supabase.rpc('is_admin', {
          p_user_id: session.user.id
        });
        
        if (rpcError) {
          console.error('RPC admin check failed:', rpcError);
        }
        
        if (!isAdminCheck) {
          console.log('User is not an admin, redirecting to dashboard');
          router.push('/dashboard');
          return;
        }
        
        // If is_admin returns true, try to get role via RPC
        const { data: superAdminCheck } = await supabase.rpc('is_super_admin', {
          p_user_id: session.user.id
        });
        
        console.log('Admin check via RPC - isAdmin:', isAdminCheck, 'isSuperAdmin:', superAdminCheck);
        setIsAdmin(true);
        setIsSuperAdmin(superAdminCheck || false);
        setIsLoading(false);
        return;
      }

      if (!adminRole) {
        console.log('No admin role found for user:', session.user.id);
        router.push('/dashboard');
        return;
      }

      console.log('Admin role found:', adminRole.role);
      setIsAdmin(true);
      setIsSuperAdmin(adminRole.role === 'super_admin');
      setIsLoading(false);
    }

    checkAdmin();
  }, [supabase, router]);

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar 
        isSuperAdmin={isSuperAdmin}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">
              Admin Dashboard
            </h1>
            {isSuperAdmin && (
              <div className="flex items-center gap-2 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                <Crown className="h-4 w-4 text-yellow-500" />
                <span className="text-xs font-medium text-yellow-500">Super Admin</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.user_metadata?.full_name || user?.email}</p>
                <p className="text-xs text-muted-foreground">
                  {isSuperAdmin ? 'Super Admin' : 'Admin'}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                {isSuperAdmin ? (
                  <Crown className="h-5 w-5" />
                ) : (
                  <Shield className="h-5 w-5" />
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6 bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  );
}

