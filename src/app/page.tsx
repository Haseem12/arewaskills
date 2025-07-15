import { generateFormFields, type FormConfig } from '@/ai/flows/dynamic-form-generation';
import { RegistrationForm } from '@/components/registration-form';
import { PartnershipSection } from '@/components/partnership-section';
import { Logo } from '@/components/logo';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function FormLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
       <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

async function GeneratedForm() {
  const formDescription = "A registration form for the Dev & AI Hangout. The form should include fields for: Full Name, Email, Phone Number, Institution/Organization, Area of Interest (e.g., Web Dev, AI, Data Science), and a short note on why they want to attend.";
  let formConfig: FormConfig;
  try {
    formConfig = await generateFormFields({ formDescription });
  } catch (error) {
    console.error("Failed to generate form:", error);
    // Fallback form configuration
    formConfig = {
      fields: [
        { label: 'Full Name', type: 'text', required: true, placeholder: 'Enter your full name' },
        { label: 'Email', type: 'email', required: true, placeholder: 'Enter your email address', validationRegex: '^\\S+@\\S+\\.\\S+$' },
        { label: 'Phone Number', type: 'tel', required: false, placeholder: 'Enter your phone number' },
        { label: 'Institution/Organization', type: 'text', required: false, placeholder: 'Your company or school' },
        { label: 'Area of Interest', type: 'text', required: true, placeholder: 'e.g. Web Dev, AI, Data Science' },
        { label: 'Why you want to attend', type: 'textarea', required: true, placeholder: 'Tell us a bit about your motivation' }
      ]
    };
  }

  return <RegistrationForm formConfig={formConfig} />;
}


export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground font-body">
      <div className="relative h-64 md:h-80 w-full">
        <Image
          src="https://placehold.co/1600x600.png"
          alt="Abstract representation of technology and connectivity"
          fill
          className="object-cover opacity-20"
          data-ai-hint="technology conference"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-background via-background/80 to-transparent">
          <div className="flex items-center gap-4 text-center md:text-left">
            <Logo className="h-20 w-20 md:h-24 md:w-24 flex-shrink-0" />
            <div>
              <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary">Arewa Tech Connect</h1>
              <p className="text-lg md:text-xl text-muted-foreground mt-1">Dev & AI Hangout Registration</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <Card className="overflow-hidden shadow-lg border-2 border-primary/10 bg-card">
          <CardHeader>
            <h2 className="text-3xl font-bold text-center text-primary">Join Us!</h2>
            <p className="text-muted-foreground text-center mt-2">
              Fill out the form below to register for an exclusive gathering of tech enthusiasts and professionals.
            </p>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <Suspense fallback={<FormLoadingSkeleton />}>
              <GeneratedForm />
            </Suspense>
          </CardContent>
        </Card>

        <PartnershipSection />
      </div>
    </main>
  );
}
