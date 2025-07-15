'use client';

import { useState, useTransition } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { Loader2, University, Printer, ArrowLeft } from 'lucide-react';
import { findSubmissionByEmail, updateSubmissionStatus } from '@/app/actions/registration-actions';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Logo } from '@/components/logo';

type Submission = {
  id: string;
  status?: 'payment_pending' | 'awaiting_confirmation' | 'paid';
  type: 'registration' | 'showcase';
  paymentMethod?: 'bank_transfer' | 'bank_branch';
  receiptNumber?: string;
  [key: string]: any;
};

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});
type EmailFormValues = z.infer<typeof emailSchema>;

const paymentMethodSchema = z.object({
  method: z.enum(['bank_transfer', 'bank_branch'], {
    required_error: 'You need to select a payment method.',
  }),
});
type PaymentMethodValues = z.infer<typeof paymentMethodSchema>;

const receiptSchema = z.object({
  receiptNumber: z.string().min(4, 'Please enter a valid receipt or transaction ID.'),
});
type ReceiptFormValues = z.infer<typeof receiptSchema>;


export default function PaymentPage() {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  // Overall flow state
  const [step, setStep] = useState<'email' | 'method' | 'details' | 'confirm' | 'success'>('email');

  const emailForm = useForm<EmailFormValues>({ resolver: zodResolver(emailSchema) });
  const methodForm = useForm<PaymentMethodValues>({ resolver: zodResolver(paymentMethodSchema) });
  const receiptForm = useForm<ReceiptFormValues>({ resolver: zodResolver(receiptSchema) });

  const resetState = () => {
    setSubmission(null);
    setStep('email');
    emailForm.reset();
    methodForm.reset();
    receiptForm.reset();
  }

  const handleEmailSubmit: SubmitHandler<EmailFormValues> = async ({ email }) => {
    setIsLoading(true);
    setSubmission(null);
    const result = await findSubmissionByEmail(email);

    if (result.success && result.data) {
        setSubmission(result.data);
        if (result.data.status === 'paid') {
          setStep('success');
        } else if (result.data.status === 'awaiting_confirmation') {
          setStep('confirm');
        } else if (result.data.status === 'payment_pending') {
          if (result.data.paymentMethod) {
            setStep('details');
          } else {
            setStep('method');
          }
        } else {
            toast({ title: 'Not Selected', description: 'You have not been selected for payment at this time. Please wait for an invitation.' });
            resetState();
        }
    } else {
      toast({ title: 'Not Found', description: result.error, variant: 'destructive' });
      resetState();
    }
    setIsLoading(false);
  };

  const handleMethodSubmit: SubmitHandler<PaymentMethodValues> = async ({ method }) => {
    if (!submission) return;
    startTransition(async () => {
      const result = await updateSubmissionStatus(submission.id, 'payment_pending', { paymentMethod: method });
      if (result.success) {
        setSubmission(prev => prev ? { ...prev, paymentMethod: method } : null);
        setStep('details');
      } else {
        toast({ title: "Error", description: result.error, variant: 'destructive' });
      }
    });
  };
  
  const handleReceiptSubmit: SubmitHandler<ReceiptFormValues> = async ({ receiptNumber }) => {
    if (!submission) return;
    startTransition(async () => {
      const result = await updateSubmissionStatus(submission.id, 'awaiting_confirmation', { receiptNumber });
      if (result.success) {
        setSubmission(prev => prev ? { ...prev, receiptNumber, status: 'awaiting_confirmation' } : null);
        setStep('confirm');
      } else {
        toast({ title: "Error", description: result.error, variant: 'destructive' });
      }
    });
  };
  
  const handlePrint = () => {
    window.print();
  }

  const renderEmailForm = () => (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Confirm Your Spot</CardTitle>
        <CardDescription>Enter your submission email to proceed with payment.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Find My Submission
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  const renderMethodSelection = () => (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Choose Payment Method</CardTitle>
        <CardDescription>Select how you'd like to pay the N5,000.00 registration fee.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...methodForm}>
          <form onSubmit={methodForm.handleSubmit(handleMethodSubmit)} className="space-y-6">
            <FormField
              control={methodForm.control}
              name="method"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent/50 has-[[data-state=checked]]:bg-accent/50">
                        <FormControl>
                          <RadioGroupItem value="bank_transfer" />
                        </FormControl>
                        <FormLabel className="font-normal w-full cursor-pointer">
                          Bank Transfer / USSD
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent/50 has-[[data-state=checked]]:bg-accent/50">
                        <FormControl>
                          <RadioGroupItem value="bank_branch" />
                        </FormControl>
                        <FormLabel className="font-normal w-full cursor-pointer">
                          Pay at Bank Branch
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
  
  const renderPaymentDetails = () => {
    if (!submission) return null;
    const isBankTransfer = submission.paymentMethod === 'bank_transfer';
    const isBankBranch = submission.paymentMethod === 'bank_branch';
    const name = submission.type === 'registration' ? submission.full_name : submission.presenterName;

    return (
        <Card className="w-full max-w-md print:shadow-none print:border-none">
            <CardHeader>
              <CardTitle>{isBankTransfer ? 'Bank Transfer Details' : 'Bank Payment Slip'}</CardTitle>
              <CardDescription>{isBankTransfer ? 'Use the details below to make payment.' : 'Print this slip and take it to any bank branch.'}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                    <div className="flex justify-between items-center print:block">
                        <h3 className="text-lg font-semibold text-primary">Arewa Tech Connect</h3>
                        <div className="print:hidden"><Logo className="h-12 w-12"/></div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">Account Name:</span> <span>Arewa Tech Connect</span>
                        <span className="text-muted-foreground">Account Number:</span> <span>1234567890</span>
                        <span className="text-muted-foreground">Bank:</span> <span>Tech Bank Plc</span>
                        <span className="text-muted-foreground">Amount:</span> <span className="font-bold">N5,000.00</span>
                        <span className="text-muted-foreground">Reference:</span> <span>{name}</span>
                    </div>
                </div>
                
                {isBankBranch && (
                    <div className="mt-6 text-center print:hidden">
                        <Button onClick={handlePrint}>
                            <Printer className="mr-2"/>
                            Print Payment Slip
                        </Button>
                    </div>
                )}

                <Separator className="my-6 print:hidden" />
                
                <div className="print:hidden">
                    <h4 className="font-semibold mb-2">After payment, what's next?</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                        Once you have completed the payment, enter the receipt number or transaction ID from your bank app or teller slip into the field below to confirm your payment.
                    </p>
                    <Form {...receiptForm}>
                        <form onSubmit={receiptForm.handleSubmit(handleReceiptSubmit)} className="space-y-4">
                            <FormField
                                control={receiptForm.control}
                                name="receiptNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Receipt / Transaction ID</FormLabel>
                                        <FormControl><Input placeholder="Enter your payment reference" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirm Payment
                            </Button>
                        </form>
                    </Form>
                </div>
            </CardContent>
             <CardFooter className="print:hidden">
                <Button variant="link" onClick={() => setStep('method')} className="text-muted-foreground">
                    <ArrowLeft className="mr-2" /> Back to payment methods
                </Button>
             </CardFooter>
        </Card>
    );
  }

  const renderConfirmation = () => (
    <Card className="w-full max-w-md text-center">
        <CardHeader>
            <CardTitle>Payment Submitted!</CardTitle>
            <CardDescription>Your payment is being processed.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="p-6 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">Awaiting Confirmation</h3>
                <p className="text-sm text-muted-foreground mt-2">
                    Thank you for submitting your payment details. Our team will verify it shortly. Please check back later or wait for a confirmation email.
                </p>
            </div>
            <Button variant="outline" className="mt-6" onClick={resetState}>Start Over</Button>
        </CardContent>
    </Card>
  )

  const renderSuccess = () => (
    <Card className="w-full max-w-md text-center">
        <CardHeader>
            <CardTitle>Payment Confirmed!</CardTitle>
            <CardDescription>Your spot at Arewa Tech Connect is secure. We look forward to seeing you!</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="p-6 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">Thank you for your payment!</h3>
                <p className="text-sm text-muted-foreground mt-2">A confirmation has been sent to your email.</p>
            </div>
             <Button variant="outline" className="mt-6" onClick={resetState}>Start Over</Button>
        </CardContent>
    </Card>
  )

  const renderStep = () => {
    switch(step) {
        case 'email': return renderEmailForm();
        case 'method': return renderMethodSelection();
        case 'details': return renderPaymentDetails();
        case 'confirm': return renderConfirmation();
        case 'success': return renderSuccess();
        default: return renderEmailForm();
    }
  }

  return (
    <>
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 print:bg-white print:text-black">
        {renderStep()}
      </main>
      <Toaster />
    </>
  );
}
