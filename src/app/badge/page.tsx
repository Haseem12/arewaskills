'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { findSubmissionById } from '@/app/actions/registration-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Upload, Download, RotateCcw } from 'lucide-react';
import { Logo } from '@/components/logo';

type Submission = {
    id: string;
    [key: string]: any;
};

function BadgeGenerator() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);

  const drawBadge = (name: string, image: HTMLImageElement | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    // Create a teal gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "hsl(180, 100%, 25.1%)");
    gradient.addColorStop(1, "hsl(180, 47.1%, 64.3%)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add a subtle pattern from the logo
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(width/2, height/2, 250, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Draw white container
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.roundRect(50, 50, width - 100, height - 100, 30);
    ctx.fill();

    // Draw user image placeholder or image
    ctx.save();
    const imageSize = 400;
    const imageX = (width - imageSize) / 2;
    const imageY = 150;

    ctx.beginPath();
    ctx.arc(imageX + imageSize/2, imageY + imageSize/2, imageSize/2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    
    if (image) {
      // draw the image centered and covering the circle
      const hRatio = imageSize / image.width;
      const vRatio = imageSize / image.height;
      const ratio  = Math.max(hRatio, vRatio);
      const centerShift_x = (imageSize - image.width*ratio)/2;
      const centerShift_y = (imageSize - image.height*ratio)/2; 
      ctx.drawImage(image, 0, 0, image.width, image.height,
                            centerShift_x + imageX,centerShift_y + imageY, image.width*ratio, image.height*ratio);
    } else {
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(imageX, imageY, imageSize, imageSize);
      ctx.fillStyle = '#a0a0a0';
      ctx.font = '30px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Upload Your Photo', width / 2, height / 2 - 50);
    }
    ctx.restore();

    // Draw text
    ctx.fillStyle = 'hsl(180, 100%, 20%)';
    ctx.textAlign = 'center';
    
    ctx.font = 'bold 80px Inter, sans-serif';
    ctx.fillText(name, width / 2, 680, width - 200);

    ctx.font = '40px Inter, sans-serif';
    ctx.fillText("is joining", width / 2, 750);
    
    ctx.font = 'bold 50px Inter, sans-serif';
    ctx.fillStyle = 'hsl(180, 100%, 25.1%)';
    ctx.fillText("Arewa Tech Connect", width / 2, 850);
    
    ctx.font = '30px Inter, sans-serif';
    ctx.fillStyle = '#333';
    ctx.fillText("Dev & AI Hangout", width / 2, 900);
  };

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
          const name = result.data.type === 'registration' ? result.data.full_name : result.data.presenterName;
          drawBadge(name, userImage);
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

  useEffect(() => {
    if (submission) {
        const name = submission.type === 'registration' ? submission.full_name : submission.presenterName;
        drawBadge(name, userImage);
    }
  }, [userImage, submission]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => setUserImage(img);
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'arewa-tech-connect-badge.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const handleReset = () => {
    setUserImage(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  }

  if (loading) {
    return <Card className="w-full max-w-xl"><CardContent className="p-6"><Skeleton className="h-96 w-full" /></CardContent></Card>;
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

  return (
    <Card className="w-full max-w-xl">
        <CardHeader>
            <CardTitle>Create Your Social Badge</CardTitle>
            <CardDescription>Share your excitement! Upload your photo and download your personalized badge.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="aspect-square w-full rounded-lg border bg-muted/30">
                <canvas ref={canvasRef} className="w-full h-full object-contain"></canvas>
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
