'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { onboardingStep9Schema } from '@/lib/utils/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, CheckCircle, Upload, X, FileText, User } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

type FormData = z.infer<typeof onboardingStep9Schema>;

interface OnboardingStep9Props {
  data?: FormData;
  onComplete: (data: FormData) => void;
  onPrevious: () => void;
  onUpdate: (data: FormData) => void;
  isLoading?: boolean;
}

export function OnboardingStep9({ data, onComplete, onPrevious, onUpdate, isLoading }: OnboardingStep9Props) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(data?.avatar_url || null);
  const [licensePreview, setLicensePreview] = useState<string | null>(
    data?.verification_documents?.medical_license ? 'uploaded' : null
  );
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingLicense, setUploadingLicense] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const form = useForm<FormData>({
    resolver: zodResolver(onboardingStep9Schema),
    defaultValues: data || {
      avatar_url: '',
      verification_documents: null,
    },
  });

  const avatar_url = form.watch('avatar_url');
  const verification_documents = form.watch('verification_documents');
  const formState = form.formState;

  useEffect(() => {
    if (formState.isValid) {
      const formValues = {
        avatar_url: avatar_url || '',
        verification_documents: verification_documents || null,
      };
      onUpdate(formValues);
    }
  }, [avatar_url, verification_documents, formState.isValid]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      form.setError('avatar_url', { message: 'Please upload an image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      form.setError('avatar_url', { message: 'Image size must be less than 5MB' });
      return;
    }

    setUploadingAvatar(true);
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error(userError?.message || 'User not authenticated');
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        
        // Check for bucket not found error (statusCode 404 or error/message contains "Bucket not found")
        const errorStr = JSON.stringify(uploadError).toLowerCase();
        const errorObj = uploadError as { statusCode?: string | number; error?: string; message?: string };
        const isBucketNotFound = 
          errorObj.statusCode === '404' ||
          errorObj.statusCode === 404 ||
          errorObj.error?.toLowerCase().includes('bucket not found') ||
          errorObj.message?.toLowerCase().includes('bucket not found') ||
          errorStr.includes('bucket not found');
        
        if (isBucketNotFound) {
          throw new Error(
            'Storage bucket "avatars" not found. Please create it in Supabase Dashboard -> Storage -> New Bucket (Name: "avatars", Public: Yes).'
          );
        }
        
        throw new Error(uploadError.message || 'Failed to upload avatar');
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        form.setValue('avatar_url', urlData.publicUrl, { shouldValidate: true });
        form.clearErrors('avatar_url');
      } else {
        throw new Error('Failed to get public URL');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'object' && error !== null
        ? JSON.stringify(error)
        : 'Failed to upload avatar. Please check your storage configuration.';
      
      form.setError('avatar_url', { message: errorMessage });
      setAvatarPreview(null); // Clear preview on error
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLicenseUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type (PDF or image)
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      form.setError('verification_documents', { 
        message: 'Please upload a PDF or image file (JPEG, PNG)' 
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      form.setError('verification_documents', { message: 'File size must be less than 10MB' });
      return;
    }

    setUploadingLicense(true);
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error(userError?.message || 'User not authenticated');
      }

      // Create preview for images only
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLicensePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // For PDFs, just set a generic preview state
        setLicensePreview('uploaded');
      }

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/license-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('verifications')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        
        // Check for bucket not found error (statusCode 404 or error/message contains "Bucket not found")
        const errorStr = JSON.stringify(uploadError).toLowerCase();
        const errorObj = uploadError as { statusCode?: string | number; error?: string; message?: string };
        const isBucketNotFound = 
          errorObj.statusCode === '404' ||
          errorObj.statusCode === 404 ||
          errorObj.error?.toLowerCase().includes('bucket not found') ||
          errorObj.message?.toLowerCase().includes('bucket not found') ||
          errorStr.includes('bucket not found');
        
        if (isBucketNotFound) {
          throw new Error(
            'Storage bucket "verifications" not found. Please create it in Supabase Dashboard -> Storage -> New Bucket (Name: "verifications", Public: No - Keep Private).'
          );
        }
        
        throw new Error(uploadError.message || 'Failed to upload license document');
      }

      // Store file info in form as verification_documents JSONB structure
      form.setValue('verification_documents', {
        medical_license: {
          path: filePath,
          name: file.name,
          type: file.type,
          size: file.size,
          uploaded_at: new Date().toISOString(),
        },
      }, { shouldValidate: true });
      form.clearErrors('verification_documents');
    } catch (error) {
      console.error('Error uploading license:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'object' && error !== null
        ? JSON.stringify(error)
        : 'Failed to upload license document. Please check your storage configuration.';
      
      form.setError('verification_documents', { message: errorMessage });
      setLicensePreview(null); // Clear preview on error
    } finally {
      setUploadingLicense(false);
    }
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    form.setValue('avatar_url', '');
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };

  const removeLicense = () => {
    setLicensePreview(null);
    form.setValue('verification_documents', null);
    if (licenseInputRef.current) {
      licenseInputRef.current.value = '';
    }
  };

  const onSubmit = async (formData: FormData) => {
    // Update the step data first
    onUpdate(formData);
    
    // Wait a brief moment to ensure state update completes
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Then complete and redirect to dashboard
    onComplete(formData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Profile & Verification</CardTitle>
        <CardDescription>
          Upload your profile picture and medical license for verification
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Upload */}
            <FormField
              control={form.control}
              name="avatar_url"
              render={() => (
                <FormItem>
                  <FormLabel>
                    Profile Picture (optional)
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {avatarPreview ? (
                        <div className="relative inline-block">
                          <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-primary ring-2 ring-primary/20">
                            <img
                              src={avatarPreview}
                              alt="Avatar preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={removeAvatar}
                            disabled={uploadingAvatar}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-32 h-32 rounded-full border-2 border-dashed border-border bg-card">
                          <User className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                          id="avatar-upload"
                          disabled={uploadingAvatar}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploadingAvatar}
                          className="flex items-center gap-2"
                          onClick={() => avatarInputRef.current?.click()}
                        >
                          {uploadingAvatar ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                            </>
                          )}
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          Max 5MB (JPG, PNG)
                        </span>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Medical License Upload */}
            <FormField
              control={form.control}
              name="verification_documents"
              render={() => (
                <FormItem>
                  <FormLabel>
                    Medical License Document (optional)
                    <span className="text-xs text-muted-foreground ml-2">
                      For verification purposes
                    </span>
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {licensePreview || verification_documents?.medical_license ? (
                        <div className="relative inline-block">
                          <div className="flex items-center gap-3 p-4 border-2 border-primary rounded-lg bg-primary/10 ring-2 ring-primary/20">
                            <FileText className="h-8 w-8 text-primary" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {verification_documents?.medical_license?.name || 'License document uploaded'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Ready for verification
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={removeLicense}
                              disabled={uploadingLicense}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center p-8 border-2 border-dashed border-border rounded-lg bg-card">
                          <div className="text-center">
                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              No document uploaded
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <input
                          ref={licenseInputRef}
                          type="file"
                          accept="application/pdf,image/jpeg,image/jpg,image/png"
                          onChange={handleLicenseUpload}
                          className="hidden"
                          id="license-upload"
                          disabled={uploadingLicense}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploadingLicense}
                          className="flex items-center gap-2"
                          onClick={() => licenseInputRef.current?.click()}
                        >
                          {uploadingLicense ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              {verification_documents?.medical_license ? 'Change Document' : 'Upload Document'}
                            </>
                          )}
                          </Button>
                        <span className="text-xs text-muted-foreground">
                          Max 10MB (PDF, JPG, PNG)
                        </span>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Completion message */}
            <div className="bg-primary/10 dark:bg-primary/20 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold">
                    Almost done!
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your profile picture helps others recognize you. Medical license verification helps build trust in the community. You can skip these and add them later.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onPrevious}
                disabled={isLoading || uploadingAvatar || uploadingLicense}
                className="hover:scale-105 transition-transform duration-200"
              >
                Previous
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || uploadingAvatar || uploadingLicense}
                className="px-8"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

