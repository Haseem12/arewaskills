
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
import { Printer, TicketIcon, AlertTriangle, Loader2, MapPin, CalendarDays, Clock, UserCheck } from 'lucide-react';

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
                        <CardTitle className="text-3xl font-bold">Northern Tech Exchange</CardTitle>
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
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" className="h-[120px] w-[120px]"><path d="M0 0h7v7H0zM1 1h5v5H1zM2 2h3v3H2zM4 4h1v1H4zM18 0h7v7h-7zM19 1h5v5h-5zM20 2h3v3h-3zM22 4h1v1h-1zM0 18h7v7H0zM1 19h5v5H1zM2 20h3v3H2zM4 22h1v1H4zM9 1h1v1H9zM11 1h1v1h-1zM13 1h1v1h-1zM15 1h1v1h-1zM10 2h1v1h-1zM12 2h1v1h-1zM14 2h1v1h-1zM8 3h1v1H8zM10 3h1v1h-1zM15 3h1v1h-1zM10 4h1v1h-1zM12 4h1v1h-1zM14 4h1v1h-1zM16 4h1v1h-1zM8 5h1v1H8zM10 5h1v1h-1zM12 5h1v1h-1zM15 5h1v1h-1zM9 6h1v1H9zM11 6h1v1h-1zM13 6h1v1h-1zM15 6h1v1h-1zM10 8h1v1h-1zM14 8h1v1h-1zM8 9h1v1H8zM10 9h1v1h-1zM12 9h1v1h-1zM14 9h1v1h-1zM16 9h1v1h-1zM18 9h1v1h-1zM20 9h1v1h-1zM22 9h1v1h-1zM24 9h1v1h-1zM10 10h1v1h-1zM12 10h1v1h-1zM14 10h1v1h-1zM16 10h1v1h-1zM18 10h1v1h-1zM20 10h1v1h-1zM22 10h1v1h-1zM8 11h1v1H8zM10 11h1v1h-1zM12 11h1v1h-1zM14 11h1v1h-1zM18 11h1v1h-1zM22 11h1v1h-1zM24 11h1v1h-1zM10 12h1v1h-1zM14 12h1v1h-1zM16 12h1v1h-1zM20 12h1v1h-1zM22 12h1v1h-1zM8 13h1v1H8zM10 13h1v1h-1zM12 13h1v1h-1zM18 13h1v1h-1zM20 13h1v1h-1zM10 14h1v1h-1zM12 14h1v1h-1zM14 14h1v1h-1zM16 14h1v1h-1zM18 14h1v1h-1zM20 14h1v1h-1zM22 14h1v1h-1zM8 15h1v1H8zM12 15h1v1h-1zM14 15h1v1h-1zM18 15h1v1h-1zM24 15h1v1h-1zM8 16h1v1H8zM10 16h1v1h-1zM12 16h1v1h-1zM16 16h1v1h-1zM20 16h1v1h-1zM24 16h1v1h-1zM18 18h1v1h-1zM20 18h1v1h-1zM22 18h1v1h-1zM10 19h1v1h-1zM12 19h1v1h-1zM14 19h1v1h-1zM16 19h1v1h-1zM18 19h1v1h-1zM20 19h1v1h-1zM24 19h1v1h-1zM8 20h1v1H8zM10 20h1v1h-1zM14 20h1v1h-1zM16 20h1v1h-1zM18 20h1v1h-1zM20 20h1v1h-1zM22 20h1v1h-1zM8 21h1v1H8zM10 21h1v1h-1zM12 21h1v1h-1zM14 21h1v1h-1zM16 21h1v1h-1zM20 21h1v1h-1zM24 21h1v1h-1zM10 22h1v1h-1zM14 22h1v1h-1zM18 22h1v1h-1zM22 22h1v1h-1zM24 22h1v1h-1zM8 23h1v1H8zM12 23h1v1h-1zM16 23h1v1h-1zM20 23h1v1h-1zM22 23h1v1h-1zM8 24h1v1H8zM10 24h1v1h-1zM14 24h1v1h-1zM18 24h1v1h-1zM22 24h1v1h-1z"/></svg>
                        </div>
                        <p className="text-xs text-muted-foreground">Scan at entry</p>
                    </div>
                </div>
                <Separator className="my-6"/>
                <div className="space-y-4 text-sm">
                    <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                        <div>
                            <p className="font-semibold">Venue</p>
                            <p className="text-muted-foreground">CBN-Centre for Economics and Finance (cenef), ABU Zaria</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                        <CalendarDays className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                        <div>
                            <p className="font-semibold">Date</p>
                            <p className="text-muted-foreground">Saturday, October 4, 2025</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                        <div>
                            <p className="font-semibold">Time</p>
                            <p className="text-muted-foreground">Afternoon 1:00 PM – 2:00 PM</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <UserCheck className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                        <div>
                            <p className="font-semibold">Special Guests</p>
                            <p className="text-muted-foreground">Prof. Isah Ali Ibrahim Pantami</p>
                            <p className="text-muted-foreground">Mal. Uba Sani (Kaduna State Governor)</p>
                            <p className="text-muted-foreground">HRH Alh. Ahmed Nuhu Bamalli</p>
                        </div>
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
