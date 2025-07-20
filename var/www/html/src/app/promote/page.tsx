
'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Download, RotateCcw } from 'lucide-react';
import { Logo } from '@/components/logo';
import { toPng } from 'html-to-image';

type BannerType = 'participant' | 'partner' | 'showcaser';

export default function PromotePage() {
  const bannerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [bannerType, setBannerType] = useState<BannerType>('participant');
  const [name, setName] = useState('Your Name / Company');
  const [userImage, setUserImage] = useState<string | null>(null);

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
    if (bannerRef.current === null) {
      return;
    }
    toPng(bannerRef.current, { cacheBust: true, pixelRatio: 2 }) // Higher quality
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `nte-promo-${bannerType}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('oops, something went wrong!', err);
      });
  }, [bannerType]);

  const handleReset = () => {
    setUserImage(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  }
  
  let headline = "I'm Attending!";
  if (bannerType === 'partner') headline = 'We are Proud Partners!';
  if (bannerType === 'showcaser') headline = "I'm Showcasing at";
  
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
                <div ref={bannerRef} className="aspect-video w-full rounded-lg bg-[#0A0A0A] text-white p-8 flex flex-col justify-between overflow-hidden relative">
                    <div className="absolute inset-0 z-0 opacity-20">
                         <div className="absolute -top-20 -left-40 w-80 h-80 border-4 border-primary/50 rounded-full"></div>
                         <div className="absolute -bottom-20 -right-40 w-80 h-80 border-4 border-accent/50 rounded-full"></div>
                    </div>
                    
                    <header className="flex items-center gap-4 z-10">
                        <Logo className="h-12 w-12"/>
                        <div>
                            <h2 className="font-bold text-xl text-primary">Northern Tech Exchange</h2>
                            <p className="text-white/80 text-sm">Dev & AI Hangout</p>
                        </div>
                    </header>
                    
                    <div className="flex items-center justify-between gap-8 z-10">
                        <div className="w-2/3">
                            <p className="text-4xl font-bold">{headline}</p>
                            <p className="text-3xl font-bold text-accent truncate">{name}</p>
                        </div>
                        <div className="w-1/3 flex-shrink-0">
                            <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center">
                                <div className="w-[120px] h-[120px] rounded-full bg-gray-800 overflow-hidden">
                                     {userImage ? (
                                        <img src={userImage} alt="User or Company Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs p-2 text-center">
                                            <Upload size={24}/>
                                            <span>Upload Logo</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <footer className="text-center z-10">
                        <p className="text-xs text-white/70">#NorthernTechExchange</p>
                    </footer>
                </div>
            </CardContent>
        </Card>
    </main>
  );
}
