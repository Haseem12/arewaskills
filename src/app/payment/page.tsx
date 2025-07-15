'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, CalendarIcon, Lock, User } from 'lucide-react';
import { findSubmissionByEmail, updateSubmissionStatus } from '@/app/actions/registration-actions';
import { Separator } from '@/components/ui/separator';

type Submission = {
  id: string;
  status?: 'payment_pending' | 'paid';
  type: 'registration' | 'showcase';
  [key: string]: any;
};

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});
type EmailFormValues = z.infer<typeof emailSchema>;

const paymentSchema = z.object({
  cardName: z.string().min(2, 'Name on card is required.'),
  cardNumber: z.string().regex(/^\d{16}$/, 'Card number must be 16 digits.'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry must be in MM/YY format.'),
  cvv: z.string().regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits.'),
});
type PaymentFormValues = z.infer<typeof paymentSchema>;


export default function PaymentPage() {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { toast } = useToast();

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
  });

  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
  });

  const handleEmailSubmit: SubmitHandler<EmailFormValues> = async ({ email }) => {
    setIsLoading(true);
    setSubmission(null);
    const result = await findSubmissionByEmail(email);

    if (result.success && result.data) {
        if (result.data.status === 'payment_pending') {
            setSubmission(result.data);
        } else if (result.data.status === 'paid') {
            toast({ title: 'Already Paid', description: 'Your payment has already been confirmed.' });
        } else {
            toast({ title: 'Not Selected', description: 'You have not been selected for payment at this time. Please wait for an invitation.' });
        }
    } else {
      toast({ title: 'Not Found', description: result.error, variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handlePaymentSubmit: SubmitHandler<PaymentFormValues> = async (data) => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (submission) {
        const result = await updateSubmissionStatus([submission.id], 'paid');
        if (result.success) {
            setPaymentSuccess(true);
            toast({ title: 'Payment Successful!', description: 'Thank you! Your spot is confirmed.' });
        } else {
            toast({ title: 'Payment Failed', description: result.error, variant: 'destructive' });
        }
    }
    setIsProcessing(false);
  };

  const renderEmailForm = () => (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Confirm Your Spot</CardTitle>
        <CardDescription>Enter your registration email to proceed to payment.</CardDescription>
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
              Find My Registration
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
  
  const renderPaymentForm = () => {
    if (paymentSuccess) {
      return (
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
            </CardContent>
        </Card>
      )
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Secure Payment</CardTitle>
                <CardDescription>This is a simulated payment gateway. Do not enter real credit card details.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="bg-muted/50 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold">Order Summary</h4>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-sm">
                        <span>Arewa Tech Connect Ticket</span>
                        <span className="font-bold">N5,000.00</span>
                    </div>
                </div>

                <Form {...paymentForm}>
                    <form onSubmit={paymentForm.handleSubmit(handlePaymentSubmit)} className="space-y-4">
                        <FormField name="cardName" control={paymentForm.control} render={({ field }) => (
                            <FormItem><FormLabel>Name on Card</FormLabel><FormControl><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Full Name" {...field} className="pl-10" /></div></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField name="cardNumber" control={paymentForm.control} render={({ field }) => (
                            <FormItem><FormLabel>Card Number</FormLabel><FormControl><div className="relative"><CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input placeholder="0000 0000 0000 0000" {...field} className="pl-10" /></div></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField name="expiryDate" control={paymentForm.control} render={({ field }) => (
                                <FormItem><FormLabel>Expiry</FormLabel><FormControl><div className="relative"><CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input placeholder="MM/YY" {...field} className="pl-10" /></div></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField name="cvv" control={paymentForm.control} render={({ field }) => (
                                <FormItem><FormLabel>CVV</FormLabel><FormControl><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input placeholder="123" {...field} className="pl-10" /></div></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <Button type="submit" className="w-full" disabled={isProcessing}>
                            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Pay N5,000.00
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        {submission ? renderPaymentForm() : renderEmailForm()}
      </main>
      <Toaster />
    </>
  );
}
