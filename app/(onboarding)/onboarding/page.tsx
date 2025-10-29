// 'use client';

// import { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Button } from '@/components/ui/button';
// import { Progress } from '@/components/ui/progress';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Save } from 'lucide-react';
// import { OnboardingData } from '@/types/onboarding';

// // ✅ Import step components without @ts-ignore
// import { OnboardingStep1 } from '@/components/onboarding/Step1';
// import { OnboardingStep2 } from '@/components/onboarding/Step2';
// import { OnboardingStep3 } from '@/components/onboarding/Step3';
// import { OnboardingStep4 } from '@/components/onboarding/Step4';
// import { OnboardingStep5 } from '@/components/onboarding/Step5';
// import { OnboardingStep6 } from '@/components/onboarding/Step6';
// import { OnboardingStep7 } from '@/components/onboarding/Step7';
// import { OnboardingStep8 } from '@/components/onboarding/Step8';

// const STEPS = [
//   { id: 1, title: 'Basic Info', description: 'Tell us about yourself', required: true },
//   { id: 2, title: 'Medical Background', description: 'Your medical specialty and career stage', required: true },
//   { id: 3, title: 'Sports & Activities', description: 'Your physical activity preferences', required: false },
//   { id: 4, title: 'Entertainment & Culture', description: 'Your interests and hobbies', required: false },
//   { id: 5, title: 'Social Preferences', description: 'How you like to socialize', required: true },
//   { id: 6, title: 'Availability', description: "When you're available to meet", required: true },
//   { id: 7, title: 'Lifestyle & Values', description: "Your lifestyle and what you're looking for", required: true },
//   { id: 8, title: 'Personality', description: 'Describe your ideal weekend', required: false },
// ];

// export default function OnboardingPage() {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({});
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
//   const [canProceed, setCanProceed] = useState(false);

//   const progress = (currentStep / STEPS.length) * 100;

//   // ✅ Update step data with validation
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const updateStepData = (stepId: number, data: any) => {
//     setOnboardingData(prev => ({
//       ...prev,
//       [`step${stepId}`]: data
//     }));
//     setCompletedSteps(prev => new Set([...prev, stepId]));
//     setCanProceed(true);
//     setError(null);
//   };

//   // ✅ Handle next with validation
//   const handleNext = () => {
//     if (!canProceed) {
//       setError('Please complete this step before proceeding');
//       return;
//     }

//     if (currentStep < STEPS.length) {
//       setCurrentStep(currentStep + 1);
      
//       // Check if next step is already completed
//       const nextStepData = onboardingData[`step${currentStep + 1}` as keyof OnboardingData];
//       setCanProceed(!!nextStepData && Object.keys(nextStepData).length > 0);
      
//       setError(null);
//     }
//   };

//   // ✅ Handle previous
//   const handlePrevious = () => {
//     if (currentStep > 1) {
//       setCurrentStep(currentStep - 1);
//       setCanProceed(true); // Previous steps are always completed
//       setError(null);
//     }
//   };

//   // ✅ Auto-save to localStorage with metadata
//   useEffect(() => {
//     if (Object.keys(onboardingData).length > 0) {
//       const draftData = {
//         data: onboardingData,
//         currentStep,
//         completedSteps: Array.from(completedSteps),
//         timestamp: new Date().toISOString()
//       };
//       localStorage.setItem('onboarding-draft', JSON.stringify(draftData));
//     }
//   }, [onboardingData, currentStep, completedSteps]);

//   // ✅ Load saved data on component mount
//   useEffect(() => {
//     const savedData = localStorage.getItem('onboarding-draft');
//     if (savedData) {
//       try {
//         const parsed = JSON.parse(savedData);
//         setOnboardingData(parsed.data || {});
//         setCurrentStep(parsed.currentStep || 1);
//         setCompletedSteps(new Set(parsed.completedSteps || []));
        
//         // Check if current step has data to enable proceed
//         const currentStepData = parsed.data?.[`step${parsed.currentStep || 1}`];
//         setCanProceed(!!currentStepData && Object.keys(currentStepData).length > 0);
//       } catch (error) {
//         console.error('Error parsing saved onboarding data:', error);
//         localStorage.removeItem('onboarding-draft');
//       }
//     }
//   }, []);

//   // ✅ Handle completion with validation
//   const handleComplete = async () => {
//     // Check if all required steps are completed
//     const requiredSteps = STEPS.filter(s => s.required).map(s => s.id);
//     const missingSteps = requiredSteps.filter(step => !completedSteps.has(step));
    
//     if (missingSteps.length > 0) {
//       const missingTitles = missingSteps.map(s => STEPS[s - 1].title).join(', ');
//       setError(`Please complete all required steps: ${missingTitles}`);
//       return;
//     }

//     setIsLoading(true);
//     setError(null);
    
//     try {
//       const response = await fetch('/api/onboarding', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(onboardingData),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error ? `${errorData.error}: ${JSON.stringify(errorData.details)}` : 'Failed to save onboarding data');
//       }

//       // Clear localStorage after successful save
//       localStorage.removeItem('onboarding-draft');
      
//       // Show brief success state before redirecting
//       setTimeout(() => {
//         window.location.href = '/dashboard';
//       }, 1000);
//     } catch (error) {
//       console.error('Error saving onboarding data:', error);
//       setError(error instanceof Error ? error.message : 'An unexpected error occurred');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ✅ Render current step
//   const renderStep = () => {
//     const stepData = onboardingData[`step${currentStep}` as keyof OnboardingData];
    
//     const commonProps = {
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       data: stepData as any,
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       onUpdate: (data: any) => updateStepData(currentStep, data),
//       onPrevious: handlePrevious,
//     };
    
//     switch (currentStep) {
//       case 1:
//         return <OnboardingStep1 {...commonProps} onNext={handleNext} />;
//       case 2:
//         return <OnboardingStep2 {...commonProps} onNext={handleNext} />;
//       case 3:
//         return <OnboardingStep3 {...commonProps} onNext={handleNext} />;
//       case 4:
//         return <OnboardingStep4 {...commonProps} onNext={handleNext} />;
//       case 5:
//         return <OnboardingStep5 {...commonProps} onNext={handleNext} />;
//       case 6:
//         return <OnboardingStep6 {...commonProps} onNext={handleNext} />;
//       case 7:
//         return <OnboardingStep7 {...commonProps} onNext={handleNext} />;
//       case 8:
//         return <OnboardingStep8 
//           // eslint-disable-next-line @typescript-eslint/no-explicit-any
//           data={stepData as any}
//           // eslint-disable-next-line @typescript-eslint/no-explicit-any
//           onUpdate={(data: any) => updateStepData(8, data)}
//           onComplete={handleComplete}
//           onPrevious={handlePrevious}
//           isLoading={isLoading}
//         />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
//       <div className="max-w-2xl mx-auto">
//         {/* Progress Header */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-4">
//             <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
//               Complete Your Profile
//             </h1>
//             <div className="flex items-center space-x-2">
//               <span className="text-sm text-gray-600 dark:text-gray-400">
//                 Step {currentStep} of {STEPS.length}
//               </span>
//               {completedSteps.has(currentStep) && (
//                 <CheckCircle className="h-4 w-4 text-green-500" />
//               )}
//               {Object.keys(onboardingData).length > 0 && (
//                 <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
//                   <Save className="h-3 w-3" />
//                   <span>Saved</span>
//                 </div>
//               )}
//             </div>
//           </div>
//           <Progress value={progress} className="h-2" />
//           <div className="mt-4">
//             <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
//               {STEPS[currentStep - 1].title}
//               {STEPS[currentStep - 1].required && (
//                 <span className="text-red-500 ml-1">*</span>
//               )}
//             </h2>
//             <p className="text-sm text-gray-600 dark:text-gray-400">
//               {STEPS[currentStep - 1].description}
//             </p>
//           </div>
//         </div>

//         {/* Error Alert */}
//         {error && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="mb-6"
//           >
//             <Alert variant="destructive">
//               <AlertCircle className="h-4 w-4" />
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           </motion.div>
//         )}

//         {/* Step Content */}
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={currentStep}
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -20 }}
//             transition={{ duration: 0.3 }}
//           >
//             {renderStep()}
//           </motion.div>
//         </AnimatePresence>

//         {/* Navigation Footer */}
//         <div className="mt-8 flex justify-between items-center">
//           <Button
//             variant="outline"
//             onClick={handlePrevious}
//             disabled={currentStep === 1 || isLoading}
//             className="flex items-center space-x-2"
//           >
//             <ArrowLeft className="h-4 w-4" />
//             <span>Previous</span>
//           </Button>
          
//           {/* Step Indicators */}
//           <div className="flex space-x-2">
//             {STEPS.map((step) => (
//               <button
//                 key={step.id}
//                 onClick={() => {
//                   // Allow navigation to completed steps or previous steps
//                   if (completedSteps.has(step.id) || step.id < currentStep) {
//                     setCurrentStep(step.id);
//                     const stepData = onboardingData[`step${step.id}` as keyof OnboardingData];
//                     setCanProceed(!!stepData && Object.keys(stepData).length > 0);
//                     setError(null);
//                   }
//                 }}
//                 disabled={!completedSteps.has(step.id) && step.id > currentStep}
//                 className={`w-2 h-2 rounded-full transition-all duration-200 ${
//                   step.id === currentStep
//                     ? 'bg-blue-500 scale-125'
//                     : completedSteps.has(step.id)
//                     ? 'bg-green-500 cursor-pointer hover:scale-110'
//                     : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
//                 }`}
//                 title={`${step.title}${step.required ? ' (Required)' : ''}`}
//               />
//             ))}
//           </div>

//           <Button
//             onClick={currentStep === STEPS.length ? handleComplete : handleNext}
//             disabled={!canProceed || isLoading}
//             className="flex items-center space-x-2"
//           >
//             <span>
//               {isLoading 
//                 ? 'Saving...' 
//                 : currentStep === STEPS.length 
//                 ? 'Complete Profile' 
//                 : 'Next'}
//             </span>
//             {currentStep !== STEPS.length && !isLoading && <ArrowRight className="h-4 w-4" />}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }


// app/(onboarding)/onboarding/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react'; // ✅ أضف useRef
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { OnboardingData } from '@/types/onboarding';

// Import step components
import { OnboardingStep1 } from '@/components/onboarding/Step1';
import { OnboardingStep2 } from '@/components/onboarding/Step2';
import { OnboardingStep3 } from '@/components/onboarding/Step3';
import { OnboardingStep4 } from '@/components/onboarding/Step4';
import { OnboardingStep5 } from '@/components/onboarding/Step5';
import { OnboardingStep6 } from '@/components/onboarding/Step6';
import { OnboardingStep7 } from '@/components/onboarding/Step7';
import { OnboardingStep8 } from '@/components/onboarding/Step8';

const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Tell us about yourself', required: true },
  { id: 2, title: 'Medical Background', description: 'Your medical specialty and career stage', required: true },
  { id: 3, title: 'Sports & Activities', description: 'Your physical activity preferences', required: false },
  { id: 4, title: 'Entertainment & Culture', description: 'Your interests and hobbies', required: false },
  { id: 5, title: 'Social Preferences', description: 'How you like to socialize', required: true },
  { id: 6, title: 'Availability', description: "When you're available to meet", required: true },
  { id: 7, title: 'Lifestyle & Values', description: "Your lifestyle and what you're looking for", required: true },
  { id: 8, title: 'Personality', description: 'Describe your ideal weekend', required: false },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [canProceed, setCanProceed] = useState(false);
  const isInitialLoad = useRef(true);

  const progress = (currentStep / STEPS.length) * 100;

  // ✅ Wrap updateStepData with useCallback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateStepData = useCallback((stepId: number, data: any) => {
    setOnboardingData(prev => ({
      ...prev,
      [`step${stepId}`]: data
    }));
    setCompletedSteps(prev => new Set([...prev, stepId]));
    setCanProceed(true);
    setError(null);
  }, []); // ✅ Empty dependencies

  // ✅ Memoize onUpdate function to prevent infinite loops
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onUpdate = useCallback((data: any) => {
    updateStepData(currentStep, data);
  }, [currentStep, updateStepData]);

  const handleNext = () => {
    if (!canProceed) {
      setError('Please complete this step before proceeding');
      return;
    }

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      
      const nextStepData = onboardingData[`step${currentStep + 1}` as keyof OnboardingData];
      setCanProceed(!!nextStepData && Object.keys(nextStepData).length > 0);
      
      setError(null);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setCanProceed(true);
      setError(null);
    }
  };

  // Auto-save onboarding data (skip initial load)
  useEffect(() => {
    if (!isInitialLoad.current && Object.keys(onboardingData).length > 0) {
      const draftData = {
        data: onboardingData,
        currentStep,
        completedSteps: Array.from(completedSteps),
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('onboarding-draft', JSON.stringify(draftData));
    }
  }, [onboardingData, currentStep, completedSteps]);

  useEffect(() => {
    const savedData = localStorage.getItem('onboarding-draft');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setOnboardingData(parsed.data || {});
        setCurrentStep(parsed.currentStep || 1);
        setCompletedSteps(new Set(parsed.completedSteps || []));
        
        const currentStepData = parsed.data?.[`step${parsed.currentStep || 1}`];
        setCanProceed(!!currentStepData && Object.keys(currentStepData).length > 0);
      } catch (error) {
        console.error('Error parsing saved onboarding data:', error);
        localStorage.removeItem('onboarding-draft');
      }
    }
    
    // Mark initial load as complete
    isInitialLoad.current = false;
  }, []);

  const handleComplete = async () => {
    const requiredSteps = STEPS.filter(s => s.required).map(s => s.id);
    const missingSteps = requiredSteps.filter(step => !completedSteps.has(step));
    
    if (missingSteps.length > 0) {
      const missingTitles = missingSteps.map(s => STEPS[s - 1].title).join(', ');
      setError(`Please complete all required steps: ${missingTitles}`);
      return;
    }

    // ✅ Additional validation for required array fields
    const validationErrors = [];
    
    if (!onboardingData.step2?.medicalSpecialties?.length) {
      validationErrors.push('Please select at least one medical specialty');
    }
    
    if (!onboardingData.step5?.meetingActivities?.length) {
      validationErrors.push('Please select at least one meeting activity');
    }
    
    if (!onboardingData.step6?.meetingTimes?.length) {
      validationErrors.push('Please select at least one preferred meeting time');
    }
    
    if (!onboardingData.step7?.lookingFor?.length) {
      validationErrors.push('Please select what you are looking for');
    }
    
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }
  
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('📤 Sending onboarding data:', onboardingData); // ✅ للتشخيص
      
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(onboardingData),
      });
  
      console.log('📡 Response status:', response.status); // ✅ للتشخيص
      
      const responseData = await response.json(); // ✅ احصل على الـ response data
      console.log('📥 Response data:', responseData); // ✅ للتشخيص
  
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to save onboarding data');
      }
  
      // ✅ تأكد من نجاح الحفظ
      if (responseData.success) {
        console.log('✅ Onboarding saved successfully');
        
        // ✅ امسح الـ localStorage
        localStorage.removeItem('onboarding-draft');
        
        // ✅ انتظر قليلاً قبل التوجيه
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // ✅ استخدم window.location.replace بدلاً من href لتجنب history
        window.location.replace('/dashboard');
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('❌ Error saving onboarding data:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    const stepData = onboardingData[`step${currentStep}` as keyof OnboardingData];
    
    const commonProps = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: stepData as any,
      onUpdate: onUpdate,
      onPrevious: handlePrevious,
    };
    
    switch (currentStep) {
      case 1:
        return <OnboardingStep1 {...commonProps} onNext={handleNext} />;
      case 2:
        return <OnboardingStep2 {...commonProps} onNext={handleNext} />;
      case 3:
        return <OnboardingStep3 {...commonProps} onNext={handleNext} />;
      case 4:
        return <OnboardingStep4 {...commonProps} onNext={handleNext} />;
      case 5:
        return <OnboardingStep5 {...commonProps} onNext={handleNext} />;
      case 6:
        return <OnboardingStep6 {...commonProps} onNext={handleNext} />;
      case 7:
        return <OnboardingStep7 {...commonProps} onNext={handleNext} />;
      case 8:
        return <OnboardingStep8 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data={stepData as any}
          onUpdate={onUpdate}
          onComplete={handleComplete}
          onPrevious={handlePrevious}
          isLoading={isLoading}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Complete Your Profile
            </h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Step {currentStep} of {STEPS.length}
              </span>
              {completedSteps.has(currentStep) && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {Object.keys(onboardingData).length > 0 && (
                <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
                  <Save className="h-3 w-3" />
                  <span>Saved</span>
                </div>
              )}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {STEPS[currentStep - 1].title}
              {STEPS[currentStep - 1].required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {STEPS[currentStep - 1].description}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Footer */}
        <div className="mt-8 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1 || isLoading}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>
          
          <div className="flex space-x-2">
            {STEPS.map((step) => (
              <button
                key={step.id}
                onClick={() => {
                  if (completedSteps.has(step.id) || step.id < currentStep) {
                    setCurrentStep(step.id);
                    const stepData = onboardingData[`step${step.id}` as keyof OnboardingData];
                    setCanProceed(!!stepData && Object.keys(stepData).length > 0);
                    setError(null);
                  }
                }}
                disabled={!completedSteps.has(step.id) && step.id > currentStep}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  step.id === currentStep
                    ? 'bg-blue-500 scale-125'
                    : completedSteps.has(step.id)
                    ? 'bg-green-500 cursor-pointer hover:scale-110'
                    : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                }`}
                title={`${step.title}${step.required ? ' (Required)' : ''}`}
              />
            ))}
          </div>

          <Button
            onClick={currentStep === STEPS.length ? handleComplete : handleNext}
            disabled={!canProceed || isLoading}
            className="flex items-center space-x-2"
          >
            <span>
              {isLoading 
                ? 'Saving...' 
                : currentStep === STEPS.length 
                ? 'Complete Profile' 
                : 'Next'}
            </span>
            {currentStep !== STEPS.length && !isLoading && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}