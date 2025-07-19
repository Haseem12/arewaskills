
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { saveRegistration } from '@/app/actions/registration-actions';
import Link from 'next/link';
import { ToastAction } from '@/components/ui/toast';

interface RegistrationFormProps {
  onRegistrationSuccess?: () => void;
}

const registrationSchema = z.object({
  full_name: z.string().min(1, { message: 'Full name is required.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  phone_number: z.string().optional(),
  company_organization: z.string().min(1, { message: 'Company or organization is required.' }),
  job_title: z.string().min(1, { message: 'Job title is required.' }),
  years_of_experience: z.coerce.number().min(0, { message: 'Years of experience must be a positive number.' }),
  what_do_you_hope_to_learn_: z.string().min(1, { message: 'This field is required.' }),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export function RegistrationForm({ onRegistrationSuccess }: RegistrationFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone_number: '',
      company_organization: '',
      job_title: '',
      years_of_experience: undefined,
      what_do_you_hope_to_learn_: '',
    },
  });

  function onSubmit(values: RegistrationFormValues) {
    startTransition(async () => {
      const result = await saveRegistration(values);

      if (result.success && result.data) {
        form.reset();
        
        toast({
          title: "Registration Successful!",
          description: "Your information has been received. Please proceed to payment.",
          variant: "default",
          duration: 10000, // Keep toast open longer
          action: (
             <ToastAction altText="Pay Now" asChild>
                <Link href={`/payment?id=${result.data.id}`}>Pay Now</Link>
             </ToastAction>
          )
        });
        
        if(onRegistrationSuccess) {
          onRegistrationSuccess();
        }
      } else {
        toast({
          title: "Registration Failed",
          description: result.error,
          variant: "destructive",
          duration: 5000,
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name<span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="e.g., Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email<span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="Your phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="company_organization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company/Organization<span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Your company name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="job_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title<span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="e.g., Software Engineer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="years_of_experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Years of Experience<span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 5" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="what_do_you_hope_to_learn_"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What do you hope to learn?<span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Textarea placeholder="I'm excited to learn about..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full text-lg py-6 transition-all duration-300 transform hover:scale-105" 
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            'Register Now'
          )}
        </Button>
      </form>
    </Form>
  );
}
