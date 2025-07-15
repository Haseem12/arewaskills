
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { findSubmissionById } from '@/app/actions/registration-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Printer, TicketIcon, AlertTriangle, Loader2 } from 'lucide-react';

type Submission = {
  id: string;
  type: 'registration' | 'showcase';
  status?: string;
  [key: string]: any;
};

function TicketContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('No submission ID provided.');
      setLoading(false);
      return;
    }

    async function fetchSubmission() {
      try {
        const result = await findSubmissionById(id as string);
        if (result.success && result.data) {
          if (result.data.status === 'paid') {
            setSubmission(result.data);
          } else {
            setError('This ticket has not been paid for.');
          }
        } else {
          setError(result.error || 'Could not find submission.');
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    }

    fetchSubmission();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };
  
  if (loading) {
    return (
        <div className="w-full max-w-lg mx-auto p-4">
            <Card>
                <CardHeader><Skeleton className="h-8 w-2/3" /></CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-32 w-32 mx-auto" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-24" />
                </CardFooter>
            </Card>
        </div>
    );
  }

  if (error) {
    return (
        <div className="w-full max-w-lg mx-auto p-4">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        </div>
    );
  }

  if (!submission) {
    return null; // Keep this to handle the case where submission is null after loading and no error
  }
  
  const attendeeName = submission.type === 'registration' ? submission.full_name : submission.presenterName;
  const attendeeEmail = submission.type === 'registration' ? submission.email : submission.presenterEmail;

  return (
    <div className="w-full max-w-lg mx-auto p-4 print:p-0">
        <style jsx global>{`
            @media print {
                body {
                    background-color: #fff;
                }
                .no-print {
                    display: none;
                }
                .ticket-card {
                    box-shadow: none !important;
                    border: 2px solid #000 !important;
                }
            }
        `}</style>
        <Card className="ticket-card bg-card text-card-foreground shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-primary text-primary-foreground p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-3xl font-bold">Arewa Tech Connect</CardTitle>
                        <CardDescription className="text-primary-foreground/80">Dev & AI Hangout</CardDescription>
                    </div>
                    <Logo className="h-16 w-16 bg-white/20 rounded-full p-1" />
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-muted-foreground">ATTENDEE</p>
                            <p className="text-2xl font-bold text-primary">{attendeeName}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-muted-foreground">EMAIL</p>
                            <p className="text-md text-foreground">{attendeeEmail}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-muted-foreground">STATUS</p>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                <p className="font-semibold text-green-600">Paid & Confirmed</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="bg-white p-2 rounded-lg border">
                           <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5h14v14H5zM9 9h6v6H9zM9 9l-2-2m8 8l2 2m-8-4l-2 2m8-8l2-2m-4 8l-2 2"/></svg>
                        </div>
                        <p className="text-xs text-muted-foreground">Scan at entry</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-muted/50 p-6 flex flex-col items-center gap-2 text-center">
                 <TicketIcon className="h-6 w-6 text-primary" />
                 <p className="text-sm text-muted-foreground">This ticket grants entry for one person. We look forward to seeing you!</p>
            </CardFooter>
        </Card>
        <div className="mt-8 text-center no-print">
            <Button size="lg" onClick={handlePrint}>
                <Printer className="mr-2" />
                Print Ticket
            </Button>
        </div>
    </div>
  );
}


export default function TicketPage() {
    return (
        <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
           <Suspense fallback={<div className="flex items-center gap-2"><Loader2 className="animate-spin" />Loading ticket...</div>}>
                <TicketContent />
           </Suspense>
        </main>
    )
}
