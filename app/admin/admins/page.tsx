'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createClient } from '@/utils/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, Plus, Edit, Trash2, Crown, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

interface AdminRole {
  id: string;
  user_id: string;
  role: 'admin' | 'super_admin';
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_full_name?: string;
}

const PAGE_SIZE = 10;

export default function AdminAdminsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [admins, setAdmins] = useState<AdminRole[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // CRUD states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminRole | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<AdminRole | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<{
    user_id: string;
    role: 'admin' | 'super_admin';
  }>({
    user_id: '',
    role: 'admin',
  });

  // Check super admin access on mount
  useEffect(() => {
    let isMounted = true;

    async function checkAccess() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          if (isMounted) {
            setIsSuperAdmin(false);
            setIsCheckingAccess(false);
          }
          return;
        }

        const { data: isSuper, error: rpcError } = await supabase.rpc('is_super_admin', {
          p_user_id: user.id
        });

        if (!isMounted) return;

        if (rpcError) {
          console.warn('RPC check failed in access check, trying fallback:', rpcError);
          // Fallback: query directly
          const { data: adminRole } = await supabase
            .from('admin_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'super_admin')
            .maybeSingle();
          
          if (isMounted) {
            setIsSuperAdmin(!!adminRole);
            setIsCheckingAccess(false);
          }
        } else {
          if (isMounted) {
            setIsSuperAdmin(isSuper === true);
            setIsCheckingAccess(false);
          }
        }
      } catch (error) {
        console.error('Error in access check:', error);
        if (isMounted) {
          setIsSuperAdmin(false);
          setIsCheckingAccess(false);
        }
      }
    }

    checkAccess();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const loadAdmins = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      if (isMountedRef.current) {
        setIsLoading(true);
        setError(null);
      }
      
      // Check if user is super admin
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        if (!isMountedRef.current) return;
        if (isMountedRef.current) {
          setError(`Authentication error: ${userError?.message || 'Not authenticated'}`);
          setIsLoading(false);
        }
        return;
      }

      // Check super admin status with fallback
      let isSuper = false;
      const { data: rpcResult, error: rpcError } = await supabase.rpc('is_super_admin', {
        p_user_id: user.id
      });

      if (rpcError) {
        console.warn('RPC check failed, trying direct query:', rpcError);
        // Fallback: query admin_roles directly
        const { data: adminRole, error: queryError } = await supabase
          .from('admin_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'super_admin')
          .maybeSingle();
        
        if (queryError) {
          if (!isMountedRef.current) return;
          if (isMountedRef.current) {
            setError(`Access check failed: ${queryError.message || 'Unknown error'}`);
            setIsLoading(false);
          }
          return;
        }
        
        isSuper = !!adminRole;
      } else {
        isSuper = rpcResult === true;
      }

      if (!isSuper) {
        if (!isMountedRef.current) return;
        if (isMountedRef.current) {
          setIsLoading(false);
        }
        return;
      }

      // Build query - use admin_roles table with RLS policy
      let query = supabase
        .from('admin_roles')
        .select(`
          id,
          user_id,
          role,
          created_at,
          updated_at
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply search
      if (searchQuery.trim()) {
        // Search by user_id (we'll enhance this later with user info)
        query = query.ilike('user_id', `%${searchQuery}%`);
      }

      // Apply pagination
      const from = (currentPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);

      let result;
      try {
        result = await query;
      } catch (queryError) {
        const errorMsg = queryError instanceof Error ? queryError.message : String(queryError);
        console.error('Error executing query:', queryError);
        throw new Error(`Query execution failed: ${errorMsg}`);
      }

      if (result.error) {
        const errorDetails = {
          message: result.error.message || 'Unknown error',
          code: result.error.code || 'UNKNOWN',
          details: result.error.details || null,
          hint: result.error.hint || null
        };
        console.error('Error fetching admin roles:', errorDetails);
        throw new Error(
          result.error.message || 
          result.error.hint || 
          `Database error: ${result.error.code || 'UNKNOWN'}`
        );
      }

      // Fetch user details for each admin with better error handling
      const adminsData = result.data || [];
      const adminsWithUsers = await Promise.allSettled(
        adminsData.map(async (admin): Promise<AdminRole> => {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles_with_email')
              .select('email, full_name')
              .eq('id', admin.user_id)
              .single();
            
            if (profileError) {
              console.warn(`Failed to fetch profile for user ${admin.user_id}:`, profileError.message);
            }
            
            return {
              ...admin,
              user_email: profile?.email || undefined,
              user_full_name: profile?.full_name || undefined,
            };
          } catch (profileErr) {
            console.warn(`Error fetching profile for ${admin.user_id}:`, profileErr);
            return {
              ...admin,
              user_email: undefined,
              user_full_name: undefined,
            };
          }
        })
      );

      // Extract successful results and handle failures
      let successfulAdmins: AdminRole[] = [];
      try {
        successfulAdmins = adminsWithUsers
          .filter((result): result is PromiseFulfilledResult<AdminRole> => {
            return result.status === 'fulfilled';
          })
          .map(result => {
            try {
              return result.value;
            } catch (valueError) {
              console.warn('Error extracting admin value:', valueError);
              return null;
            }
          })
          .filter((admin): admin is AdminRole => admin !== null);
        
        const failedAdmins = adminsWithUsers.filter(result => result.status === 'rejected');
        if (failedAdmins.length > 0) {
          console.warn(`${failedAdmins.length} admin profile fetches failed`);
          failedAdmins.forEach((failed, index) => {
            if (failed.status === 'rejected') {
              console.warn(`Failed admin fetch ${index}:`, failed.reason);
            }
          });
        }
      } catch (processingError) {
        console.error('Error processing admin results:', processingError);
        // If processing fails, try to use raw data without profiles
        successfulAdmins = adminsData.map(admin => ({
          ...admin,
          user_email: undefined,
          user_full_name: undefined,
        }));
      }

      if (!isMountedRef.current) return;
      
      if (isMountedRef.current) {
        setAdmins(successfulAdmins);
        setTotalCount(result.count || 0);
        setError(null);
        setIsLoading(false);
      }
    } catch (error) {
      try {
        let errorMessage = 'Failed to load admins';
        
        if (error instanceof Error) {
          errorMessage = error.message || 'Unknown error occurred';
        } else if (error && typeof error === 'object') {
          // Handle Supabase error objects
          try {
            const err = error as { message?: string; hint?: string; details?: string; code?: string };
            errorMessage = err.message || err.hint || err.details || err.code || 'Database error';
            
            // Try to stringify if needed
            if (!errorMessage || errorMessage === '[object Object]') {
              try {
                errorMessage = JSON.stringify(error);
              } catch {
                errorMessage = 'Unknown error occurred';
              }
            }
          } catch (parseError) {
            console.error('Error parsing error object:', parseError);
            errorMessage = 'Unknown error occurred';
          }
        } else {
          try {
            errorMessage = String(error);
            if (errorMessage === '[object Object]') {
              errorMessage = 'Unknown error occurred';
            }
          } catch {
            errorMessage = 'Unknown error occurred';
          }
        }
        
        console.error('Error loading admins:', error);
        console.error('Error message:', errorMessage);
        
        if (isMountedRef.current) {
          setError(`Failed to load admins: ${errorMessage}`);
          setAdmins([]);
          setTotalCount(0);
          setIsLoading(false);
        }
      } catch (stateUpdateError) {
        // If state update fails, log it but don't throw
        console.error('Critical error: Failed to update state after error:', stateUpdateError);
        console.error('Original error:', error);
        // Try to set a minimal error state
        if (isMountedRef.current) {
          try {
            setError('Failed to load admins: Critical error occurred');
            setIsLoading(false);
          } catch {
            // If even this fails, just log it
            console.error('Unable to update error state');
          }
        }
      }
    }
  }, [supabase, currentPage, searchQuery]);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Ensure formData is properly initialized when dialog opens
  useEffect(() => {
    if (isFormOpen && selectedAdmin) {
      // Editing existing admin
      setFormData({
        user_id: selectedAdmin.user_id || '',
        role: selectedAdmin.role || 'admin',
      });
    } else if (isFormOpen && !selectedAdmin) {
      // Adding new admin
      setFormData({
        user_id: '',
        role: 'admin',
      });
    }
  }, [isFormOpen, selectedAdmin]);

  const handleEdit = (admin: AdminRole) => {
    if (!admin || !admin.id) {
      console.error('Invalid admin data for editing');
      return;
    }
    setSelectedAdmin(admin);
    setFormData({
      user_id: admin.user_id || '',
      role: admin.role || 'admin',
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleDelete = (admin: AdminRole) => {
    setAdminToDelete(admin);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!selectedAdmin && !formData.user_id?.trim()) {
      setFormError('User ID is required');
      return;
    }

    if (!formData.role || !['admin', 'super_admin'].includes(formData.role)) {
      setFormError('Invalid role selected');
      return;
    }

    setIsSaving(true);
    setFormError(null);
    setError(null);

    try {
      if (selectedAdmin) {
        // Update existing admin
        const { error: updateError } = await supabase
          .from('admin_roles')
          .update({
            role: formData.role,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedAdmin.id);

        if (updateError) {
          const errorDetails = {
            message: updateError.message || 'Unknown error',
            code: updateError.code || 'UNKNOWN',
            hint: updateError.hint || null
          };
          console.error('Error updating admin role:', errorDetails);
          
          // Check for permission denied error
          if (updateError.code === '42501' || updateError.message?.includes('permission denied')) {
            throw new Error('Permission denied. Make sure you are a Super Admin and the migration has been applied.');
          } else {
            throw new Error(updateError.message || updateError.hint || 'Failed to update admin role');
          }
        }
        
        if (isMountedRef.current) {
          setSuccess('Admin role updated successfully');
          setIsFormOpen(false);
          setSelectedAdmin(null);
          setFormData({ user_id: '', role: 'admin' });
          setFormError(null);
          loadAdmins();
          
          setTimeout(() => {
            if (isMountedRef.current) {
              setSuccess(null);
            }
          }, 3000);
        }
      } else {
        // Create new admin
        const { error: insertError } = await supabase
          .from('admin_roles')
          .insert({
            user_id: formData.user_id.trim(),
            role: formData.role,
          });

        if (insertError) {
          const errorDetails = {
            message: insertError.message || 'Unknown error',
            code: insertError.code || 'UNKNOWN',
            hint: insertError.hint || null
          };
          console.error('Error creating admin role:', errorDetails);
          
          // Check for permission denied error
          if (insertError.code === '42501' || insertError.message?.includes('permission denied')) {
            throw new Error('Permission denied. Make sure you are a Super Admin and the migration has been applied.');
          } else {
            throw new Error(insertError.message || insertError.hint || 'Failed to create admin role');
          }
        }
        
        if (isMountedRef.current) {
          setSuccess('Admin role created successfully');
          setIsFormOpen(false);
          setSelectedAdmin(null);
          setFormData({ user_id: '', role: 'admin' });
          setFormError(null);
          loadAdmins();
          
          setTimeout(() => {
            if (isMountedRef.current) {
              setSuccess(null);
            }
          }, 3000);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save admin';
      if (isMountedRef.current) {
        setFormError(errorMsg);
      }
      console.error('Error saving admin:', err);
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  };

  const confirmDelete = async () => {
    try {
      if (!adminToDelete || !adminToDelete.id) {
        console.error('Cannot delete: invalid admin data');
        if (isMountedRef.current) {
          setError('Invalid admin data. Cannot delete.');
        }
        return;
      }

      if (!isMountedRef.current) return;

      setIsDeleting(true);
      setError(null);
      setFormError(null);
      
      // Validate adminToDelete before deletion
      const adminId = adminToDelete.id;
      if (!adminId || typeof adminId !== 'string') {
        throw new Error('Invalid admin ID');
      }

      const { error: deleteError } = await supabase
        .from('admin_roles')
        .delete()
        .eq('id', adminId);

      if (deleteError) {
        const errorDetails = {
          message: deleteError.message || 'Unknown error',
          code: deleteError.code || 'UNKNOWN',
          hint: deleteError.hint || null
        };
        console.error('Error deleting admin role:', errorDetails);
        
        if (isMountedRef.current) {
          // Check for permission denied error
          if (deleteError.code === '42501' || deleteError.message?.includes('permission denied')) {
            setError('Permission denied. Make sure you are a Super Admin and the migration has been applied.');
          } else {
            setError(deleteError.message || deleteError.hint || 'Failed to delete admin role');
          }
        }
        return;
      }

      // Success - only update state if component is still mounted
      if (!isMountedRef.current) return;

      setSuccess('Admin role deleted successfully');
      setIsDeleteDialogOpen(false);
      setAdminToDelete(null);
      
      // Reload admins list - wrap in try-catch to prevent errors from breaking the flow
      try {
        await loadAdmins();
      } catch (loadError) {
        console.error('Error reloading admins after delete:', loadError);
        // Don't throw - deletion was successful, just reload failed
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        if (isMountedRef.current) {
          setSuccess(null);
        }
      }, 3000);
    } catch (error) {
      console.error('Error in confirmDelete:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete admin';
      
      if (isMountedRef.current) {
        setError(errorMsg);
      }
    } finally {
      // Always ensure loading state is cleared, regardless of success or error
      if (isMountedRef.current) {
        setIsDeleting(false);
      }
    }
  };

  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / PAGE_SIZE));
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, totalCount || 0);

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  if (isCheckingAccess || (isLoading && admins.length === 0 && !error)) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading admins...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isSuperAdmin) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-yellow-500" />
                Access Denied
              </CardTitle>
              <CardDescription>
                Super Admin privileges required
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This page is only accessible to Super Admins. Only Super Admins can manage admin roles and permissions.
              </p>
              <Link href="/admin">
                <Button variant="outline" className="w-full">
                  Go to Admin Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Management</h1>
            <p className="text-muted-foreground">
              Manage admin users and their roles
            </p>
          </div>
          <Button onClick={() => {
            setSelectedAdmin(null);
            setFormData({ user_id: '', role: 'admin' });
            setFormError(null);
            setIsFormOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Admin
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-500/10 border-green-500/20">
            <AlertDescription className="text-green-500">{success}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Admins</CardTitle>
                <CardDescription>
                  {totalCount > 0 ? `Total: ${totalCount} admins` : 'No admins found'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search by user ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Admins Table */}
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        {isLoading ? 'Loading...' : 'No admins found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    admins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-foreground">
                              {admin.user_full_name || 'No name'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {admin.user_email || (admin.user_id ? `${admin.user_id.substring(0, 8)}...` : 'N/A')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {admin.role === 'super_admin' ? (
                            <Badge variant="default" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                              <Crown className="h-3 w-3 mr-1" />
                              Super Admin
                            </Badge>
                          ) : (
                            <Badge variant="default" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {admin.created_at ? formatDate(admin.created_at) : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(admin)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(admin)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {startItem} to {endItem} of {totalCount} admins
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {totalPages > 0 && Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      try {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        // Ensure pageNum is valid
                        if (pageNum < 1 || pageNum > totalPages) {
                          return null;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              if (pageNum >= 1 && pageNum <= totalPages) {
                                setCurrentPage(pageNum);
                              }
                            }}
                            disabled={isLoading}
                            className="min-w-[40px]"
                          >
                            {pageNum}
                          </Button>
                        );
                      } catch (paginationError) {
                        console.error('Error rendering pagination button:', paginationError);
                        return null;
                      }
                    }).filter(Boolean)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || isLoading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Admin Form Dialog */}
      <Dialog 
        open={isFormOpen} 
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setFormError(null);
            setSelectedAdmin(null);
            setFormData({ user_id: '', role: 'admin' });
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedAdmin ? 'Edit Admin' : 'Add Admin'}</DialogTitle>
            <DialogDescription>
              {selectedAdmin ? 'Update admin role' : 'Assign admin role to a user'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="user_id">User ID</Label>
              <Input
                id="user_id"
                type="text"
                value={formData.user_id || ''}
                onChange={(e) => {
                  const value = e.target.value || '';
                  setFormData({ ...formData, user_id: value });
                }}
                placeholder="Enter user UUID"
                disabled={!!selectedAdmin}
                required
              />
              <p className="text-xs text-muted-foreground">
                {selectedAdmin ? 'User ID cannot be changed' : 'The UUID of the user to make admin'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role || 'admin'}
                onValueChange={(value: 'admin' | 'super_admin') => {
                  if (value === 'admin' || value === 'super_admin') {
                    setFormData({ ...formData, role: value });
                  }
                }}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Admin
                    </div>
                  </SelectItem>
                  <SelectItem value="super_admin">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4" />
                      Super Admin
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : selectedAdmin ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) {
          // Clear error when dialog closes
          setError(null);
          setAdminToDelete(null);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Admin Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove admin privileges from{' '}
              <strong>{adminToDelete?.user_full_name || adminToDelete?.user_email || 'this user'}</strong>? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && (
            <Alert variant="destructive" className="my-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                  await confirmDelete();
                } catch (error) {
                  console.error('Unhandled error in confirmDelete onClick:', error);
                  if (isMountedRef.current) {
                    setError('An unexpected error occurred while deleting the admin role.');
                    setIsDeleting(false);
                  }
                }
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

