
'use client';

import { Suspense, useRef, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { findSubmissionById } from '@/app/actions/registration-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Upload, Download, RotateCcw } from 'lucide-react';
import { Logo } from '@/components/logo';
import { toPng } from 'html-to-image';

type Submission = {
    id: string;
    company_organization?: string;
    [key: string]: any;
};

function BadgeGenerator() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const badgeRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userImage, setUserImage] = useState<string | null>(null);

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
          setSubmission(result.data);
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = useCallback(() => {
    if (badgeRef.current === null) {
      return;
    }
    toPng(badgeRef.current, { cacheBust: true, pixelRatio: 2 }) // Higher quality
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `nte-badge-${submission?.id}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('oops, something went wrong!', err);
        setError('Could not generate badge image. Please try again.');
      });
  }, [submission]);

  const handleReset = () => {
    setUserImage(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  }

  if (loading) {
    return <Card className="w-full max-w-xl"><CardContent className="p-6"><Skeleton className="aspect-square w-full" /></CardContent></Card>;
  }

  if (error) {
    return (
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    );
  }
  
  const name = submission?.type === 'registration' ? submission.full_name : submission?.presenterName;
  const organization = submission?.type === 'registration' ? submission.company_organization : 'Project Showcase';

  return (
    <Card className="w-full max-w-xl">
        <CardHeader>
            <CardTitle>Create Your Social Badge</CardTitle>
            <CardDescription>Share your excitement! Upload your photo and download your personalized badge for {name}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div ref={badgeRef} className="aspect-square w-full bg-[#0A0A0A] text-white p-12 flex flex-col justify-between overflow-hidden relative">
                {/* Background decorations */}
                <div className="absolute inset-0 z-0 opacity-20">
                     <div className="absolute -top-20 -left-40 w-96 h-96 border-4 border-primary/50 rounded-full"></div>
                     <div className="absolute -bottom-20 -right-40 w-96 h-96 border-4 border-accent/50 rounded-full"></div>
                </div>
                
                <header className="flex items-center gap-4 z-10">
                    <Logo className="h-16 w-16"/>
                    <div>
                        <h2 className="font-bold text-2xl text-primary">Northern Tech Exchange</h2>
                        <p className="text-white/80">Dev & AI Hangout</p>
                    </div>
                </header>
                
                <div className="flex flex-col items-center text-center z-10">
                    <div className="relative mb-6">
                        <div className="w-48 h-48 rounded-full bg-primary flex items-center justify-center">
                            <div className="w-[180px] h-[180px] rounded-full bg-gray-800 overflow-hidden">
                                {userImage ? (
                                    <img src={userImage} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-sm p-4">
                                        <Upload size={32}/>
                                        <span>Upload Photo</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <h1 className="text-4xl font-bold leading-tight">{name}</h1>
                    {organization && <p className="text-xl text-accent">{organization}</p>}
                </div>

                <footer className="text-center z-10">
                    <p className="font-bold text-3xl">I&apos;ll be there!</p>
                    <p className="text-white/70 mt-1">#NorthernTechExchange</p>
                </footer>
            </div>
             <div className="hidden">
                 <Input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
             </div>
             <div className="flex flex-wrap gap-4 justify-center">
                 <Button onClick={() => fileInputRef.current?.click()} size="lg">
                     <Upload className="mr-2"/> Upload Photo
                 </Button>
                 {userImage && (
                     <Button onClick={handleReset} variant="outline" size="lg">
                         <RotateCcw className="mr-2"/> Reset Image
                     </Button>
                 )}
                 <Button onClick={handleDownload} size="lg">
                     <Download className="mr-2"/> Download Badge
                 </Button>
             </div>
        </CardContent>
    </Card>
  );
}


export default function BadgePage() {
    return (
        <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
             <Suspense fallback={<div className="flex items-center gap-2"><Loader2 className="animate-spin" />Loading...</div>}>
                <BadgeGenerator />
            </Suspense>
        </main>
    )
}
