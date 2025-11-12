'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Home, 
  BarChart3, 
  Users, 
  Shield, 
  Bell, 
  Settings, 
  Crown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  isSuperAdmin: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  superAdminOnly?: boolean;
}

export function AdminSidebar({ isSuperAdmin, isCollapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: '/admin', label: 'Home', icon: <Home className="h-5 w-5" /> },
    { 
      href: '/admin/super-admin', 
      label: 'Super Admin', 
      icon: <Crown className="h-5 w-5" />,
      superAdminOnly: true 
    },
    { href: '/admin/analytics', label: 'Analytics', icon: <BarChart3 className="h-5 w-5" /> },
    { href: '/admin/users', label: 'Users', icon: <Users className="h-5 w-5" /> },
    { 
      href: '/admin/admins', 
      label: 'Admins', 
      icon: <Shield className="h-5 w-5" />,
      superAdminOnly: true 
    },
    { 
      href: '/admin/notifications', 
      label: 'Notifications', 
      icon: <Bell className="h-5 w-5" />,
      superAdminOnly: true 
    },
    { 
      href: '/admin/settings', 
      label: 'Settings', 
      icon: <Settings className="h-5 w-5" />,
      superAdminOnly: true 
    },
  ];

  const filteredItems = navItems.filter(item => !item.superAdminOnly || isSuperAdmin);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="h-screen bg-card border-r border-border flex flex-col transition-all duration-300"
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            {isSuperAdmin ? (
              <Crown className="h-6 w-6 text-yellow-500" />
            ) : (
              <Shield className="h-6 w-6 text-primary" />
            )}
            <div>
              <h2 className="font-bold text-lg">Admin Panel</h2>
              {isSuperAdmin && (
                <Badge variant="outline" className="text-xs mt-1 border-yellow-500/20 text-yellow-500">
                  Super Admin
                </Badge>
              )}
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex justify-center w-full">
            {isSuperAdmin ? (
              <Crown className="h-6 w-6 text-yellow-500" />
            ) : (
              <Shield className="h-6 w-6 text-primary" />
            )}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname?.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                "hover:bg-accent",
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "flex-shrink-0",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <>
                  <span className="flex-1 font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Admin Panel</p>
            <p>Manage your platform</p>
          </div>
        </div>
      )}
    </motion.aside>
  );
}

