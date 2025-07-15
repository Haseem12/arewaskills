'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, ArrowRight, PartyPopper } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { saveShowcase } from '@/app/actions/registration-actions';

interface ShowcaseFormProps {
    onShowcaseSuccess?: () => void;
}

const step1Schema = z.object({
  projectName: z.string().min(3, 'Project name must be at least 3 characters.'),
  tagline: z.string().min(10, 'Tagline must be at least 10 characters.').max(100, 'Tagline is too long.'),
  projectUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
});

const step2Schema = z.object({
  description: z.string().min(50, 'Description must be at least 50 characters.'),
  technologies: z.string().min(3, 'Please list at least one technology.'),
});

const step3Schema = z.object({
  presenterName: z.string().min(2, 'Please enter your name.'),
  presenterEmail: z.string().email('Please enter a valid email.'),
});

const showcaseSchema = step1Schema.merge(step2Schema).merge(step3Schema);

type ShowcaseFormValues = z.infer<typeof showcaseSchema>;

const steps = [
  { id: 1, title: 'Project Details', schema: step1Schema, fields: ['projectName', 'tagline', 'projectUrl'] },
  { id: 2, title: 'Technical Info', schema: step2Schema, fields: ['description', 'technologies'] },
  { id: 3, title: 'Presenter Info', schema: step3Schema, fields: ['presenterName', 'presenterEmail'] },
];

export function ShowcaseForm({ onShowcaseSuccess }: ShowcaseFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const currentSchema = steps[currentStep]?.schema ?? showcaseSchema;
  const form = useForm<ShowcaseFormValues>({
    resolver: zodResolver(currentSchema),
    mode: 'onChange',
  });

  const progress = ((currentStep + 1) / (steps.length + 1)) * 100;

  const handleNext = async () => {
    const fields = steps[currentStep].fields;
    const isValid = await form.trigger(fields as any);
    if (isValid) {
      if (currentStep < steps.length) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const onSubmit = (values: ShowcaseFormValues) => {
    startTransition(async () => {
      const result = await saveShowcase(values);
      
      if (result.success) {
        setCurrentStep(0);
        form.reset();
        
        toast({
          title: "Project Submitted!",
          description: "Thanks for submitting your project. We'll be in touch soon.",
          variant: 'default',
          duration: 5000,
        });

        if (onShowcaseSuccess) {
          onShowcaseSuccess();
        }
      } else {
        toast({
            title: "Submission Failed",
            description: result.error,
            variant: "destructive",
            duration: 5000,
        });
      }
    });
  };

  return (
    <div className="space-y-8">
      <Progress value={progress} className="w-full" />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {currentStep === 0 && (
            <div className="space-y-4">
              <FormField name="projectName" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Project Name</FormLabel><FormControl><Input placeholder="e.g., Arewa-AI" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="tagline" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Tagline / Short Pitch</FormLabel><FormControl><Input placeholder="A short, catchy phrase describing your project" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="projectUrl" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Project URL (Optional)</FormLabel><FormControl><Input placeholder="https://github.com/user/project" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <FormField name="description" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Project Description</FormLabel><FormControl><Textarea placeholder="Describe what your project does, the problem it solves, and who it's for." rows={5} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="technologies" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Technologies Used</FormLabel><FormControl><Input placeholder="e.g., Next.js, Genkit, Tailwind CSS" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          )}

          {currentStep === 2 && (
             <div className="space-y-4">
              <FormField name="presenterName" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Your Name</FormLabel><FormControl><Input placeholder="Enter your full name" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="presenterEmail" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Your Email</FormLabel><FormControl><Input placeholder="We'll use this to contact you" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          )}
          
          <div className="flex justify-between items-center pt-4">
            {currentStep > 0 && (
              <Button type="button" variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            )}
            <div />
            {currentStep < steps.length - 1 && (
              <Button type="button" onClick={handleNext}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            {currentStep === steps.length -1 && (
                 <Button type="submit" disabled={isPending}>
                 {isPending ? (
                   <>
                     <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                     Submitting...
                   </>
                 ) : (
                   'Submit Project'
                 )}
               </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
