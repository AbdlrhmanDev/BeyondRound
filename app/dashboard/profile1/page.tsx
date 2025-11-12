'use client';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { WelcomeSection } from '@/components/dashboard/welcome-section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { OnboardingData } from '@/types/onboarding';
import { 
  User as UserIcon, 
  Activity, 
  Music, 
  Users, 
  Clock, 
  Heart, 
  Smile,
  MapPin,
  Stethoscope,
  GraduationCap,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Star,
  CheckCircle,
  FileText,
  Shield,
  Download,
  Upload,
  Loader2
} from 'lucide-react';

// Default data structure for when no profile data exists
const defaultData: OnboardingData = {
  step1: {
    gender: 'Prefer not to say',
    genderPreference: 'No preference',
    city: '',
    nationality: '',
  },
  step2: {
    medicalSpecialties: [],
    specialtyPreference: 'No preference',
    careerStage: 'Medical Student',
  },
  step3: {
    sports: [],
    activityLevel: 'Moderately active (1-2 times/week)',
  },
  step4: {
    musicPreferences: [],
    moviePreferences: [],
    otherInterests: [],
  },
  step5: {
    meetingActivities: [],
    socialEnergyLevel: 'Moderate energy, prefer small groups',
    conversationStyle: 'Mix of everything',
  },
  step6: {
    meetingTimes: [],
    meetingFrequency: 'Monthly',
  },
  step7: {
    dietaryPreferences: 'No restrictions',
    lifeStage: 'Single, no kids',
    lookingFor: [],
  },
  step8: {
    idealWeekend: 'Mix of active and relaxing',
  },
};

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Verification {
  user_id: string;
  medical_license_verified: boolean;
  photo_verified: boolean;
  email_verified: boolean;
  verification_documents: {
    medical_license?: {
      path: string;
      name: string;
      type: string;
      size: number;
      uploaded_at?: string;
    };
  } | null;
  verified_at: string | null;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [verification, setVerification] = useState<Verification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState<OnboardingData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingLicense, setUploadingLicense] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function getUserAndData() {
      try {
        const supabase = createClient();
        
        // Get user session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          
          // Fetch profile data with avatar
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
          } else {
            setUserProfile(profileData as Profile);
          }

          // Fetch verification data
          const { data: verificationData, error: verificationError } = await supabase
            .from('verifications')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (verificationError) {
            // It's okay if verification doesn't exist yet
            if (verificationError.code !== 'PGRST116') {
              console.error('Error fetching verification:', verificationError);
            }
          } else {
            setVerification(verificationData as Verification);
          }
          
          // Fetch onboarding profile data
          const response = await fetch('/api/v1/profile');
          if (response.ok) {
            const data = await response.json();
            setOnboardingData(data.data);
            setEditingData(data.data);
          } else {
            console.error('❌ Profile API Error:', response.status, response.statusText);
            setError('Failed to load profile data');
          }
        }
      } catch (err) {
        setError('An error occurred while loading data');
        console.error('Error loading dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    getUserAndData();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditingData(onboardingData || defaultData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingData(onboardingData || defaultData);
    setError(null);
  };

  const handleSave = async () => {
    if (!editingData) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Ensure all required steps are present with default values
      const completeData = {
        step1: {
          gender: editingData.step1?.gender || 'Prefer not to say',
          genderPreference: editingData.step1?.genderPreference || 'No preference',
          city: editingData.step1?.city || '',
          nationality: editingData.step1?.nationality || '',
        },
        step2: {
          medicalSpecialties: editingData.step2?.medicalSpecialties || [],
          specialtyPreference: editingData.step2?.specialtyPreference || 'No preference',
          careerStage: editingData.step2?.careerStage || 'Medical Student',
        },
        step3: {
          sports: editingData.step3?.sports || [],
          activityLevel: editingData.step3?.activityLevel || 'Moderately active (1-2 times/week)',
        },
        step4: {
          musicPreferences: editingData.step4?.musicPreferences || [],
          moviePreferences: editingData.step4?.moviePreferences || [],
          otherInterests: editingData.step4?.otherInterests || [],
        },
        step5: {
          meetingActivities: editingData.step5?.meetingActivities || [],
          socialEnergyLevel: editingData.step5?.socialEnergyLevel || 'Moderate energy, prefer small groups',
          conversationStyle: editingData.step5?.conversationStyle || 'Mix of everything',
        },
        step6: {
          meetingTimes: editingData.step6?.meetingTimes || [],
          meetingFrequency: editingData.step6?.meetingFrequency || 'Monthly',
        },
        step7: {
          dietaryPreferences: editingData.step7?.dietaryPreferences || 'No restrictions',
          lifeStage: editingData.step7?.lifeStage || 'Single, no kids',
          lookingFor: editingData.step7?.lookingFor || [],
        },
        step8: {
          idealWeekend: editingData.step8?.idealWeekend || 'Mix of active and relaxing',
        },
      };

      console.log('Sending profile data:', completeData);
      
      const response = await fetch('/api/v1/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.details 
          ? `${errorData.error}: ${Array.isArray(errorData.details) ? errorData.details.join(', ') : errorData.details}`
          : errorData.error || 'Failed to save profile data';
        throw new Error(errorMessage);
      }

      setOnboardingData(completeData);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile data:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (step: keyof OnboardingData, field: string, value: string | string[] | number) => {
    if (!editingData) return;
    
    setEditingData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [step]: {
          ...prev[step],
          [field]: value
        }
      };
    });
  };

  const addArrayItem = (step: keyof OnboardingData, field: string, value: string) => {
    if (!editingData || !value.trim()) return;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentArray = (editingData[step] as any)?.[field] || [];
    if (Array.isArray(currentArray) && !currentArray.includes(value)) {
      updateField(step, field, [...currentArray, value]);
    }
  };

  const removeArrayItem = (step: keyof OnboardingData, field: string, value: string) => {
    if (!editingData) return;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentArray = (editingData[step] as any)?.[field] || [];
    if (Array.isArray(currentArray)) {
      updateField(step, field, currentArray.filter(item => item !== value));
    }
  };

  // Avatar CRUD handlers
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    setError(null);
    try {
      const supabase = createClient();
      
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
        throw new Error(uploadError.message || 'Failed to upload avatar');
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        // Update profile with new avatar URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: urlData.publicUrl })
          .eq('id', user.id);

        if (updateError) {
          throw new Error(updateError.message || 'Failed to update profile');
        }

        // Update local state
        setUserProfile(prev => prev ? { ...prev, avatar_url: urlData.publicUrl } : null);
      } else {
        throw new Error('Failed to get public URL');
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user?.id || !userProfile?.avatar_url) return;

    if (!confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }

    setUploadingAvatar(true);
    setError(null);
    try {
      const supabase = createClient();
      
      // Extract file path from URL
      const urlParts = userProfile.avatar_url.split('/');
      const filePath = urlParts.slice(urlParts.indexOf('avatars') + 1).join('/');

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (deleteError) {
        console.error('Error deleting avatar from storage:', deleteError);
        // Continue to update profile even if storage delete fails
      }

      // Update profile to remove avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (updateError) {
        throw new Error(updateError.message || 'Failed to update profile');
      }

      // Update local state
      setUserProfile(prev => prev ? { ...prev, avatar_url: null } : null);
    } catch (err) {
      console.error('Error deleting avatar:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Medical License CRUD handlers
  const handleLicenseUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file type (PDF or image)
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or image file (JPEG, PNG)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploadingLicense(true);
    setError(null);
    try {
      const supabase = createClient();
      
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
        throw new Error(uploadError.message || 'Failed to upload license document');
      }

      // Update verification document in database
      const verificationDoc = {
        medical_license: {
          path: filePath,
          name: file.name,
          type: file.type,
          size: file.size,
          uploaded_at: new Date().toISOString(),
        },
      };

      // Check if verification record exists
      const { data: existingVerification } = await supabase
        .from('verifications')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existingVerification) {
        // Update existing verification
        const { error: updateError } = await supabase
          .from('verifications')
          .update({
            verification_documents: verificationDoc,
            medical_license_verified: false, // Reset verification status when new document is uploaded
          })
          .eq('user_id', user.id);

        if (updateError) {
          throw new Error(updateError.message || 'Failed to update verification');
        }
      } else {
        // Create new verification record
        const { error: insertError } = await supabase
          .from('verifications')
          .insert({
            user_id: user.id,
            verification_documents: verificationDoc,
            medical_license_verified: false,
          });

        if (insertError) {
          throw new Error(insertError.message || 'Failed to create verification');
        }
      }

      // Refresh verification data
      const { data: verificationData } = await supabase
        .from('verifications')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (verificationData) {
        setVerification(verificationData as Verification);
      }
    } catch (err) {
      console.error('Error uploading license:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload license document');
    } finally {
      setUploadingLicense(false);
      if (licenseInputRef.current) {
        licenseInputRef.current.value = '';
      }
    }
  };

  const handleDeleteLicense = async () => {
    if (!user?.id || !verification?.verification_documents?.medical_license) return;

    if (!confirm('Are you sure you want to delete your medical license document?')) {
      return;
    }

    setUploadingLicense(true);
    setError(null);
    try {
      const supabase = createClient();
      
      const filePath = verification.verification_documents.medical_license.path;

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('verifications')
        .remove([filePath]);

      if (deleteError) {
        console.error('Error deleting license from storage:', deleteError);
        // Continue to update verification even if storage delete fails
      }

      // Update verification to remove document
      const { error: updateError } = await supabase
        .from('verifications')
        .update({
          verification_documents: null,
          medical_license_verified: false,
        })
        .eq('user_id', user.id);

      if (updateError) {
        throw new Error(updateError.message || 'Failed to update verification');
      }

      // Update local state
      setVerification(prev => prev ? {
        ...prev,
        verification_documents: null,
        medical_license_verified: false,
      } : null);
    } catch (err) {
      console.error('Error deleting license:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete license document');
    } finally {
      setUploadingLicense(false);
    }
  };

  const updateSportInterest = (index: number, field: 'sport' | 'interest', value: string | number) => {
    if (!editingData?.step3?.sports) return;
    
    const updatedSports = [...editingData.step3.sports];
    updatedSports[index] = { ...updatedSports[index], [field]: value };
    
    setEditingData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        step3: {
          ...prev.step3,
          sports: updatedSports
        }
      };
    });
  };

  const addSport = () => {
    if (!editingData?.step3?.sports) return;
    
    setEditingData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        step3: {
          ...prev.step3,
          sports: [...(prev.step3?.sports || []), { sport: '', interest: 1 }]
        }
      };
    });
  };

  const removeSport = (index: number) => {
    if (!editingData?.step3?.sports) return;
    
    const updatedSports = editingData.step3.sports.filter((_, i) => i !== index);
    setEditingData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        step3: {
          ...prev.step3,
          sports: updatedSports
        }
      };
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !isEditing) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const data = isEditing ? editingData : (onboardingData || defaultData);

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="flex justify-between items-start mb-6">
        <WelcomeSection
          userName={data?.step1?.city ? `${data.step1.city} Resident` : 'User'}
          userEmail={user?.email || 'user@example.com'}
          avatarUrl={userProfile?.avatar_url || null}
        />
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button onClick={handleEdit} className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleCancel} variant="outline" className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && isEditing && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Profile & Verification Card */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Profile & Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Avatar Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Profile Picture</h3>
                {userProfile?.avatar_url ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <img
                        src={userProfile.avatar_url}
                        alt="Profile avatar"
                        className="w-24 h-24 rounded-full border-2 border-primary/20 object-cover"
                      />
                      <div>
                        <Badge variant="outline" className="mb-2">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Uploaded
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          Your profile picture is visible to other users
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
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
                        variant="outline"
                        size="sm"
                        disabled={uploadingAvatar}
                        onClick={() => avatarInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        {uploadingAvatar ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-3 w-3" />
                            Change
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={uploadingAvatar}
                        onClick={handleDeleteAvatar}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 rounded-full border-2 border-dashed border-border bg-card flex items-center justify-center">
                        <span className="text-3xl font-semibold text-muted-foreground">
                          {userProfile?.full_name?.charAt(0).toUpperCase() || data?.step1?.city?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <Badge variant="secondary" className="mb-2">
                          <X className="h-3 w-3 mr-1" />
                          Not Uploaded
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          Add a profile picture to help others recognize you
                        </p>
                      </div>
                    </div>
                    <div>
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
                        variant="default"
                        size="sm"
                        disabled={uploadingAvatar}
                        onClick={() => avatarInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        {uploadingAvatar ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-3 w-3" />
                            Upload Avatar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Medical License Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Medical License</h3>
                {verification?.verification_documents?.medical_license ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                      <FileText className="h-8 w-8 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {verification.verification_documents.medical_license.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded {verification.verification_documents.medical_license.uploaded_at 
                            ? new Date(verification.verification_documents.medical_license.uploaded_at).toLocaleDateString()
                            : 'recently'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {verification.medical_license_verified ? (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <X className="h-3 w-3 mr-1" />
                          Pending Review
                        </Badge>
                      )}
                      {verification.verification_documents.medical_license.path && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              const supabase = createClient();
                              const { data: urlData, error: urlError } = await supabase.storage
                                .from('verifications')
                                .createSignedUrl(verification.verification_documents!.medical_license!.path, 3600);
                              if (urlError) {
                                console.error('Error creating signed URL:', urlError);
                                return;
                              }
                              if (urlData?.signedUrl) {
                                window.open(urlData.signedUrl, '_blank');
                              }
                            }}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            View
                          </Button>
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
                            variant="outline"
                            size="sm"
                            disabled={uploadingLicense}
                            onClick={() => licenseInputRef.current?.click()}
                            className="flex items-center gap-2"
                          >
                            {uploadingLicense ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-3 w-3" />
                                Change
                              </>
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={uploadingLicense}
                            onClick={handleDeleteLicense}
                            className="flex items-center gap-2"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 border-2 border-dashed border-border rounded-lg bg-card">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <Badge variant="secondary" className="mb-2">
                          <X className="h-3 w-3 mr-1" />
                          Not Uploaded
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          Upload your medical license for verification
                        </p>
                      </div>
                    </div>
                    <div>
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
                        variant="default"
                        size="sm"
                        disabled={uploadingLicense}
                        onClick={() => licenseInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        {uploadingLicense ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-3 w-3" />
                            Upload License
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Status</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Complete</div>
            <p className="text-xs text-muted-foreground">
              All onboarding steps finished
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Location</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.step1?.city || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              {data?.step1?.nationality || 'No nationality set'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Career Stage</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.step2?.careerStage?.split(' ')[0] || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Medical professional
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity Level</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.step3?.activityLevel?.split(' ')[0] || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Physical activity preference
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Profile Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Gender</Label>
                {isEditing ? (
                  <select
                    value={data?.step1?.gender || ''}
                    onChange={(e) => updateField('step1', 'gender', e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                ) : (
                  <p className="text-sm mt-1">{data?.step1?.gender || 'Not specified'}</p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Gender Preference</Label>
                {isEditing ? (
                  <select
                    value={data?.step1?.genderPreference || ''}
                    onChange={(e) => updateField('step1', 'genderPreference', e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="No preference">No preference</option>
                    <option value="Mixed groups preferred">Mixed groups preferred</option>
                    <option value="Same gender only">Same gender only</option>
                    <option value="Same gender preferred but mixed okay">Same gender preferred but mixed okay</option>
                  </select>
                ) : (
                  <p className="text-sm mt-1">{data?.step1?.genderPreference || 'Not specified'}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">City</Label>
                {isEditing ? (
                  <Input
                    value={data?.step1?.city || ''}
                    onChange={(e) => updateField('step1', 'city', e.target.value)}
                    placeholder="Enter your city"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">{data?.step1?.city || 'Not specified'}</p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Nationality</Label>
                {isEditing ? (
                  <Input
                    value={data?.step1?.nationality || ''}
                    onChange={(e) => updateField('step1', 'nationality', e.target.value)}
                    placeholder="Enter your nationality"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">{data?.step1?.nationality || 'Not specified'}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Background */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Medical Background
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Specialties</Label>
              {isEditing ? (
                <div className="space-y-2 mt-1">
                  <div className="flex flex-wrap gap-2">
                    {data?.step2?.medicalSpecialties?.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {specialty}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeArrayItem('step2', 'medicalSpecialties', specialty)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add specialty"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addArrayItem('step2', 'medicalSpecialties', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button size="sm" onClick={() => {
                      const input = document.querySelector('input[placeholder="Add specialty"]') as HTMLInputElement;
                      if (input?.value) {
                        addArrayItem('step2', 'medicalSpecialties', input.value);
                        input.value = '';
                      }
                    }}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-1">
                  {data?.step2?.medicalSpecialties?.length && data.step2.medicalSpecialties.length > 0 ? (
                    data.step2.medicalSpecialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary">
                        {specialty}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No specialties added</span>
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Specialty Preference</Label>
                {isEditing ? (
                  <select
                    value={data?.step2?.specialtyPreference || ''}
                    onChange={(e) => updateField('step2', 'specialtyPreference', e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="Same specialty preferred">Same specialty preferred</option>
                    <option value="Different specialties preferred">Different specialties preferred</option>
                    <option value="No preference">No preference</option>
                  </select>
                ) : (
                  <p className="text-sm mt-1">{data?.step2?.specialtyPreference || 'Not specified'}</p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Career Stage</Label>
                {isEditing ? (
                  <select
                    value={data?.step2?.careerStage || ''}
                    onChange={(e) => updateField('step2', 'careerStage', e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="Medical Student">Medical Student</option>
                    <option value="Resident (1st-2nd year)">Resident (1st-2nd year)</option>
                    <option value="Resident (3rd+ year)">Resident (3rd+ year)</option>
                    <option value="Fellow">Fellow</option>
                    <option value="Attending/Consultant (0-5 years)">Attending/Consultant (0-5 years)</option>
                    <option value="Attending/Consultant (5+ years)">Attending/Consultant (5+ years)</option>
                    <option value="Private Practice">Private Practice</option>
                    <option value="Academic Medicine">Academic Medicine</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-sm mt-1">{data?.step2?.careerStage || 'Not specified'}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sports & Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Sports & Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Activity Level</Label>
              {isEditing ? (
                <select
                  value={data?.step3?.activityLevel || ''}
                  onChange={(e) => updateField('step3', 'activityLevel', e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="Very active (5+ times/week)">Very active (5+ times/week)</option>
                  <option value="Active (3-4 times/week)">Active (3-4 times/week)</option>
                  <option value="Moderately active (1-2 times/week)">Moderately active (1-2 times/week)</option>
                  <option value="Occasionally active">Occasionally active</option>
                  <option value="Prefer non-physical activities">Prefer non-physical activities</option>
                </select>
              ) : (
                <p className="text-sm mt-1">{data?.step3?.activityLevel || 'Not specified'}</p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Sports Interests</Label>
              {isEditing ? (
                <div className="space-y-2 mt-1">
                  {data?.step3?.sports?.map((sport, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={sport.sport}
                        onChange={(e) => updateSportInterest(index, 'sport', e.target.value)}
                        placeholder="Sport name"
                        className="flex-1"
                      />
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 cursor-pointer ${
                              star <= sport.interest ? 'text-yellow-500 fill-current' : 'text-gray-300'
                            }`}
                            onClick={() => updateSportInterest(index, 'interest', star)}
                          />
                        ))}
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeSport(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button onClick={addSport} variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Sport
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 mt-1">
                  {data?.step3?.sports?.length && data.step3.sports.length > 0 ? (
                    data.step3.sports.map((sport, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{sport.sport}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-xs ${
                                star <= sport.interest ? 'text-yellow-500' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No sports added</span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Entertainment & Culture */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Entertainment & Culture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Music Preferences</Label>
              {isEditing ? (
                <div className="space-y-2 mt-1">
                  <div className="flex flex-wrap gap-2">
                    {data?.step4?.musicPreferences?.map((music, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {music}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeArrayItem('step4', 'musicPreferences', music)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add music preference"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addArrayItem('step4', 'musicPreferences', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button size="sm" onClick={() => {
                      const input = document.querySelector('input[placeholder="Add music preference"]') as HTMLInputElement;
                      if (input?.value) {
                        addArrayItem('step4', 'musicPreferences', input.value);
                        input.value = '';
                      }
                    }}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-1">
                  {data?.step4?.musicPreferences?.length && data.step4.musicPreferences.length > 0 ? (
                    data.step4.musicPreferences.map((music, index) => (
                      <Badge key={index} variant="outline">
                        {music}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No music preferences added</span>
                  )}
                </div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Movie Preferences</Label>
              {isEditing ? (
                <div className="space-y-2 mt-1">
                  <div className="flex flex-wrap gap-2">
                    {data?.step4?.moviePreferences?.map((movie, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {movie}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeArrayItem('step4', 'moviePreferences', movie)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add movie preference"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addArrayItem('step4', 'moviePreferences', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button size="sm" onClick={() => {
                      const input = document.querySelector('input[placeholder="Add movie preference"]') as HTMLInputElement;
                      if (input?.value) {
                        addArrayItem('step4', 'moviePreferences', input.value);
                        input.value = '';
                      }
                    }}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-1">
                  {data?.step4?.moviePreferences?.length && data.step4.moviePreferences.length > 0 ? (
                    data.step4.moviePreferences.map((movie, index) => (
                      <Badge key={index} variant="outline">
                        {movie}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No movie preferences added</span>
                  )}
                </div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Other Interests</Label>
              {isEditing ? (
                <div className="space-y-2 mt-1">
                  <div className="flex flex-wrap gap-2">
                    {data?.step4?.otherInterests?.map((interest, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {interest}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeArrayItem('step4', 'otherInterests', interest)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add interest"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addArrayItem('step4', 'otherInterests', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button size="sm" onClick={() => {
                      const input = document.querySelector('input[placeholder="Add interest"]') as HTMLInputElement;
                      if (input?.value) {
                        addArrayItem('step4', 'otherInterests', input.value);
                        input.value = '';
                      }
                    }}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-1">
                  {data?.step4?.otherInterests?.length && data.step4.otherInterests.length > 0 ? (
                    data.step4.otherInterests.map((interest, index) => (
                      <Badge key={index} variant="outline">
                        {interest}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No other interests added</span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Social Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Social Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Meeting Activities</Label>
              {isEditing ? (
                <div className="space-y-2 mt-1">
                  <div className="flex flex-wrap gap-2">
                    {data?.step5?.meetingActivities?.map((activity, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {activity}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeArrayItem('step5', 'meetingActivities', activity)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add meeting activity"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addArrayItem('step5', 'meetingActivities', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button size="sm" onClick={() => {
                      const input = document.querySelector('input[placeholder="Add meeting activity"]') as HTMLInputElement;
                      if (input?.value) {
                        addArrayItem('step5', 'meetingActivities', input.value);
                        input.value = '';
                      }
                    }}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-1">
                  {data?.step5?.meetingActivities?.length && data.step5.meetingActivities.length > 0 ? (
                    data.step5.meetingActivities.map((activity, index) => (
                      <Badge key={index} variant="secondary">
                        {activity}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No meeting activities added</span>
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Social Energy</Label>
                {isEditing ? (
                  <select
                    value={data?.step5?.socialEnergyLevel || ''}
                    onChange={(e) => updateField('step5', 'socialEnergyLevel', e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="High energy, love big groups">High energy, love big groups</option>
                    <option value="Moderate energy, prefer small groups">Moderate energy, prefer small groups</option>
                    <option value="Low key, intimate settings preferred">Low key, intimate settings preferred</option>
                    <option value="Varies by mood">Varies by mood</option>
                  </select>
                ) : (
                  <p className="text-sm mt-1">{data?.step5?.socialEnergyLevel || 'Not specified'}</p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Conversation Style</Label>
                {isEditing ? (
                  <select
                    value={data?.step5?.conversationStyle || ''}
                    onChange={(e) => updateField('step5', 'conversationStyle', e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="Deep, meaningful conversations">Deep, meaningful conversations</option>
                    <option value="Light, fun, casual chat">Light, fun, casual chat</option>
                    <option value="Hobby-focused discussions">Hobby-focused discussions</option>
                    <option value="Professional/career topics">Professional/career topics</option>
                    <option value="Mix of everything">Mix of everything</option>
                  </select>
                ) : (
                  <p className="text-sm mt-1">{data?.step5?.conversationStyle || 'Not specified'}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Preferred Meeting Times</Label>
              {isEditing ? (
                <div className="space-y-2 mt-1">
                  <div className="flex flex-wrap gap-2">
                    {data?.step6?.meetingTimes?.map((time, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {time}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeArrayItem('step6', 'meetingTimes', time)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add meeting time"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addArrayItem('step6', 'meetingTimes', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button size="sm" onClick={() => {
                      const input = document.querySelector('input[placeholder="Add meeting time"]') as HTMLInputElement;
                      if (input?.value) {
                        addArrayItem('step6', 'meetingTimes', input.value);
                        input.value = '';
                      }
                    }}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-1">
                  {data?.step6?.meetingTimes?.length && data.step6.meetingTimes.length > 0 ? (
                    data.step6.meetingTimes.map((time, index) => (
                      <Badge key={index} variant="outline">
                        {time}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No preferred meeting times added</span>
                  )}
                </div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Meeting Frequency</Label>
              {isEditing ? (
                <select
                  value={data?.step6?.meetingFrequency || ''}
                  onChange={(e) => updateField('step6', 'meetingFrequency', e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Bi-weekly">Bi-weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="As schedules allow">As schedules allow</option>
                </select>
              ) : (
                <p className="text-sm mt-1">{data?.step6?.meetingFrequency || 'Not specified'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lifestyle & Values */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Lifestyle & Values
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Dietary Preferences</Label>
                {isEditing ? (
                  <select
                    value={data?.step7?.dietaryPreferences || ''}
                    onChange={(e) => updateField('step7', 'dietaryPreferences', e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="No restrictions">No restrictions</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Halal">Halal</option>
                    <option value="Kosher">Kosher</option>
                    <option value="Gluten-free">Gluten-free</option>
                    <option value="Other allergies/restrictions">Other allergies/restrictions</option>
                  </select>
                ) : (
                  <p className="text-sm mt-1">{data?.step7?.dietaryPreferences || 'Not specified'}</p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Life Stage</Label>
                {isEditing ? (
                  <select
                    value={data?.step7?.lifeStage || ''}
                    onChange={(e) => updateField('step7', 'lifeStage', e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="Prefer not to say">Prefer not to say</option>
                    <option value="Single, no kids">Single, no kids</option>
                    <option value="In a relationship, no kids">In a relationship, no kids</option>
                    <option value="Married, no kids">Married, no kids</option>
                    <option value="Have young children">Have young children</option>
                    <option value="Have older children">Have older children</option>
                    <option value="Empty nester">Empty nester</option>
                  </select>
                ) : (
                  <p className="text-sm mt-1">{data?.step7?.lifeStage || 'Not specified'}</p>
                )}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Looking For</Label>
              {isEditing ? (
                <div className="space-y-2 mt-1">
                  <div className="flex flex-wrap gap-2">
                    {data?.step7?.lookingFor?.map((item, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {item}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeArrayItem('step7', 'lookingFor', item)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add what you're looking for"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addArrayItem('step7', 'lookingFor', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button size="sm" onClick={() => {
                      const input = document.querySelector('input[placeholder="Add what you\'re looking for"]') as HTMLInputElement;
                      if (input?.value) {
                        addArrayItem('step7', 'lookingFor', input.value);
                        input.value = '';
                      }
                    }}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-1">
                  {data?.step7?.lookingFor?.length && data?.step7?.lookingFor && data.step7.lookingFor.length > 0 ? (
                    data.step7.lookingFor.map((item, index) => (
                      <Badge key={index} variant="secondary">
                        {item}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No preferences specified</span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Personality */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smile className="h-5 w-5" />
              Personality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Ideal Weekend</Label>
              {isEditing ? (
                <select
                  value={data?.step8?.idealWeekend || ''}
                  onChange={(e) => updateField('step8', 'idealWeekend', e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="Adventure and exploration">Adventure and exploration</option>
                  <option value="Relaxation and self-care">Relaxation and self-care</option>
                  <option value="Social activities with friends">Social activities with friends</option>
                  <option value="Cultural activities (museums, shows)">Cultural activities (museums, shows)</option>
                  <option value="Sports and fitness">Sports and fitness</option>
                  <option value="Home projects and hobbies">Home projects and hobbies</option>
                  <option value="Mix of active and relaxing">Mix of active and relaxing</option>
                </select>
              ) : (
                <p className="text-sm mt-1">{data?.step8?.idealWeekend || 'Not specified'}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}