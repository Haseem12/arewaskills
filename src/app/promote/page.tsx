
'use client';

import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Download, RotateCcw } from 'lucide-react';
import { Logo } from '@/components/logo';

type BannerType = 'participant' | 'partner' | 'showcaser';

export default function PromotePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [bannerType, setBannerType] = useState<BannerType>('participant');
  const [name, setName] = useState('Your Name / Company');
  const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);

  const drawBanner = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = 1200;
    const height = 675; // 16:9 aspect ratio
    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = "#0A0A0A";
    ctx.fillRect(0, 0, width, height);

    // Silk lines for innovation
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = "hsl(180, 100%, 25.1%)"; // primary
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-100, 100);
    ctx.bezierCurveTo(width * 0.25, 200, width * 0.75, 0, width + 100, 150);
    ctx.stroke();

    ctx.strokeStyle = "hsl(180, 47.1%, 64.3%)"; // accent
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-100, height - 100);
    ctx.bezierCurveTo(width * 0.25, height - 200, width * 0.75, height, width + 100, height - 150);
    ctx.stroke();
    ctx.restore();

    // Header with Logo
    if (logoImage) {
      ctx.drawImage(logoImage, 50, 40, 80, 80);
    }
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.font = 'bold 40px Inter, sans-serif';
    ctx.fillText("Arewa Tech Connect", 150, 80);
    ctx.font = '24px Inter, sans-serif';
    ctx.fillStyle = 'hsl(180, 15%, 94%)';
    ctx.fillText("Dev & AI Hangout", 150, 110);
    
    // Main Content
    const imageSize = 300;
    const imageX = width - imageSize - 80;
    const imageY = (height - imageSize) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(imageX + imageSize / 2, imageY + imageSize / 2, imageSize / 2 + 8, 0, Math.PI * 2, true);
    ctx.fillStyle = 'hsl(180, 100%, 25.1%)';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(imageX + imageSize / 2, imageY + imageSize / 2, imageSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    
    if (userImage) {
      const hRatio = imageSize / userImage.width;
      const vRatio = imageSize / userImage.height;
      const ratio  = Math.max(hRatio, vRatio);
      const centerShift_x = (imageSize - userImage.width*ratio)/2;
      const centerShift_y = (imageSize - userImage.height*ratio)/2; 
      ctx.drawImage(userImage, 0, 0, userImage.width, userImage.height,
                            centerShift_x + imageX,centerShift_y + imageY, userImage.width*ratio, userImage.height*ratio);
    } else {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(imageX, imageY, imageSize, imageSize);
      ctx.fillStyle = '#a0a0a0';
      ctx.font = '24px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Upload Photo / Logo', imageX + imageSize/2, imageY + imageSize/2);
    }
    ctx.restore();

    // Text Content
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    let headline = "I'm Attending!";
    if (bannerType === 'partner') headline = 'We are Proud Partners!';
    if (bannerType === 'showcaser') headline = "I'm Showcasing at";

    ctx.font = 'bold 72px Inter, sans-serif';
    ctx.fillText(headline, 80, height/2 - 100);
    
    const fitText = (text: string, maxWidth: number, fontSize: number = 60) => {
        if (!text) return text;
        ctx.font = `bold ${fontSize}px Inter, sans-serif`;
        while (ctx.measureText(text).width > maxWidth) {
            fontSize--;
            ctx.font = `bold ${fontSize}px Inter, sans-serif`;
        }
        return text;
    }
    
    ctx.fillStyle = 'hsl(180, 47.1%, 64.3%)'; // accent
    const fittedName = fitText(name, width - imageSize - 200);
    ctx.fillText(fittedName, 80, height/2);

    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.fillStyle = 'white';
    ctx.fillText('Arewa Tech Connect', 80, height/2 + 60);

    // Footer
    ctx.font = '20px Inter, sans-serif';
    ctx.fillStyle = 'hsl(180, 15%, 80%)';
    ctx.textAlign = 'center';
    ctx.fillText('Join us for a day of learning, networking, and innovation. | #ArewaTechConnect', width / 2, height - 50);
  };

  useEffect(() => {
    const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:hsl(180, 100%, 25.1%)" /><stop offset="100%" style="stop-color:hsl(180, 47.1%, 64.3%)" /></linearGradient></defs><circle cx="50" cy="50" r="48" fill="hsl(var(--card))" stroke="url(#tealGradient)" stroke-width="1.5" /><g stroke="url(#tealGradient)" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M50 20 V 35" /><path d="M50 80 V 65" /><path d="M20 50 H 35" /><path d="M80 50 H 65" /><circle cx="50" cy="50" r="15" /><path d="M35 35 A 21.21 21.21 0 0 1 65 65" /><path d="M65 35 A 21.21 21.21 0 0 1 35 65" /></g><circle cx="50" cy="50" r="3" fill="hsl(var(--primary))" /></svg>`;
    const img = new Image();
    img.onload = () => setLogoImage(img);
    img.src = 'data:image/svg+xml;base64,' + btoa(logoSvg);
  }, []);

  useEffect(() => {
    drawBanner();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, bannerType, userImage, logoImage]);


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
      link.download = `arewa-tech-connect-promo-${bannerType}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const handleReset = () => {
    setUserImage(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  }
  
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
            <CardHeader>
                <CardTitle className="text-3xl">Promotional Banner Generator</CardTitle>
                <CardDescription>Create a custom banner to share on your social media and invite others.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                    <div>
                        <Label htmlFor="banner-type">I am a...</Label>
                        <Select onValueChange={(value: BannerType) => setBannerType(value)} defaultValue={bannerType}>
                            <SelectTrigger id="banner-type">
                                <SelectValue placeholder="Select banner type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="participant">Participant</SelectItem>
                                <SelectItem value="partner">Partner</SelectItem>
                                <SelectItem value="showcaser">Project Showcaser</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="name">Name / Company Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    <div className="hidden">
                        <Input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                    </div>
                    <div className="flex flex-wrap gap-4 justify-start">
                        <Button onClick={() => fileInputRef.current?.click()}>
                            <Upload className="mr-2"/> Upload Photo/Logo
                        </Button>
                        {userImage && (
                            <Button onClick={handleReset} variant="outline">
                                <RotateCcw className="mr-2"/> Reset Image
                            </Button>
                        )}
                        <Button onClick={handleDownload}>
                            <Download className="mr-2"/> Download Banner
                        </Button>
                    </div>
                </div>
                 <div className="aspect-video w-full rounded-lg border bg-muted/30 overflow-hidden">
                    <canvas ref={canvasRef} className="w-full h-full object-contain"></canvas>
                </div>
            </CardContent>
        </Card>
    </main>
  );
}
