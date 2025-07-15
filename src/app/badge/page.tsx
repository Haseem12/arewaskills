
'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { findSubmissionById } from '@/app/actions/registration-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Upload, Download, RotateCcw, LinkIcon, Phone, Handshake, Megaphone } from 'lucide-react';
import { Logo } from '@/components/logo';

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

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);

  const drawBadge = (submissionData: Submission, image: HTMLImageElement | null, logo: HTMLImageElement | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    const name = submissionData.type === 'registration' ? submissionData.full_name : submissionData.presenterName;
    const organization = submissionData.type === 'registration' ? submissionData.company_organization : 'Project Showcase';

    // Background
    ctx.fillStyle = "#0A0A0A"; // Dark background
    ctx.fillRect(0, 0, width, height);
    
    // Silk lines for innovation
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = "hsl(180, 100%, 25.1%)"; // primary
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-100, 200);
    ctx.bezierCurveTo(width * 0.25, 400, width * 0.75, 0, width + 100, 300);
    ctx.stroke();

    ctx.strokeStyle = "hsl(180, 47.1%, 64.3%)"; // accent
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-100, 800);
    ctx.bezierCurveTo(width * 0.25, 600, width * 0.75, 1000, width + 100, 700);
    ctx.stroke();
    ctx.restore();

    // Header with Logo
    if (logo) {
      ctx.drawImage(logo, 80, 80, 120, 120);
    }
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.font = 'bold 50px Inter, sans-serif';
    ctx.fillText("Arewa Tech Connect", 220, 140);
    ctx.font = '30px Inter, sans-serif';
    ctx.fillStyle = 'hsl(180, 15%, 94%)'; // secondary-foreground
    ctx.fillText("Dev & AI Hangout", 220, 185);

    // Draw user image placeholder or image
    ctx.save();
    const imageSize = 400;
    const imageY = (height - imageSize) / 2 - 100;
    const imageX = (width - imageSize) / 2;

    ctx.beginPath();
    ctx.arc(imageX + imageSize / 2, imageY + imageSize / 2, imageSize / 2 + 10, 0, Math.PI * 2, true);
    ctx.fillStyle = 'hsl(180, 100%, 25.1%)'; // primary
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(imageX + imageSize / 2, imageY + imageSize / 2, imageSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    
    if (image) {
      const hRatio = imageSize / image.width;
      const vRatio = imageSize / image.height;
      const ratio  = Math.max(hRatio, vRatio);
      const centerShift_x = (imageSize - image.width*ratio)/2;
      const centerShift_y = (imageSize - image.height*ratio)/2; 
      ctx.drawImage(image, 0, 0, image.width, image.height,
                            centerShift_x + imageX,centerShift_y + imageY, image.width*ratio, image.height*ratio);
    } else {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(imageX, imageY, imageSize, imageSize);
      ctx.fillStyle = '#a0a0a0';
      ctx.font = '30px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Upload Your Photo', width / 2, imageY + imageSize/2);
    }
    ctx.restore();

    // Draw text
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const fitText = (text: string, maxWidth: number, fontSize: number = 90) => {
        if (!text) return text;
        ctx.font = `bold ${fontSize}px Inter, sans-serif`;
        while (ctx.measureText(text).width > maxWidth) {
            fontSize--;
            ctx.font = `bold ${fontSize}px Inter, sans-serif`;
        }
        return text;
    }

    const nameY = imageY + imageSize + 100;
    const fittedName = fitText(name, width - 160);
    ctx.fillText(fittedName, width / 2, nameY);
    
    if (organization) {
      const orgY = nameY + 70;
      ctx.font = '50px Inter, sans-serif';
      ctx.fillStyle = 'hsl(180, 20%, 85%)';
      ctx.fillText(organization, width / 2, orgY);
    }
    
    // Footer CTA
    const footerY = height - 200;
    ctx.font = 'bold 70px Inter, sans-serif';
    ctx.fillStyle = 'hsl(180, 47.1%, 64.3%)'; // accent
    ctx.fillText("I'll be there!", width / 2, footerY);

    // Footer contact info
    const contactStartY = height - 100;
    ctx.fillStyle = 'hsl(180, 15%, 94%)';
    ctx.font = '24px Inter, sans-serif';
    ctx.textAlign = 'center';
    const contactItems = [
        "arewaskills.com.ng/event",
        "Partner with Us",
        "Showcase a Project",
        "Call Us: 08063386516"
    ];
    const itemWidth = width / contactItems.length;
    contactItems.forEach((item, index) => {
        ctx.fillText(item, (itemWidth * index) + (itemWidth / 2), contactStartY);
    });
  };

  useEffect(() => {
    const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:hsl(180, 100%, 25.1%)" /><stop offset="100%" style="stop-color:hsl(180, 47.1%, 64.3%)" /></linearGradient></defs><circle cx="50" cy="50" r="48" fill="hsl(var(--card))" stroke="url(#tealGradient)" stroke-width="1.5" /><g stroke="url(#tealGradient)" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M50 20 V 35" /><path d="M50 80 V 65" /><path d="M20 50 H 35" /><path d="M80 50 H 65" /><circle cx="50" cy="50" r="15" /><path d="M35 35 A 21.21 21.21 0 0 1 65 65" /><path d="M65 35 A 21.21 21.21 0 0 1 35 65" /></g><circle cx="50" cy="50" r="3" fill="hsl(var(--primary))" /></svg>`;
    const img = new Image();
    img.onload = () => setLogoImage(img);
    img.src = 'data:image/svg+xml;base64,' + btoa(logoSvg);
  }, []);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (submission) {
        drawBadge(submission, userImage, logoImage);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userImage, submission, logoImage]);


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

  return (
    <Card className="w-full max-w-xl">
        <CardHeader>
            <CardTitle>Create Your Social Badge</CardTitle>
            <CardDescription>Share your excitement! Upload your photo and download your personalized badge for {name}.</CardDescription>
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

    