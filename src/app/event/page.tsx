
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RegistrationForm } from '@/components/registration-form';
import { ShowcaseForm } from '@/components/showcase-form';
import { Toaster } from '@/components/ui/toaster';
import Link from 'next/link';

export default function EventPage() {
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [isShowcaseDialogOpen, setIsShowcaseDialogOpen] = useState(false);
  
  const handleRegistrationSuccess = () => {
    setIsRegisterDialogOpen(false);
  };

  const handleShowcaseSuccess = () => {
    setIsShowcaseDialogOpen(false);
  }

  return (
    <>
      <main className="min-h-screen bg-background text-foreground font-body">
        <div className="relative h-screen w-full">
          <Image
            src="/arewadev.png"
            alt="Arewa Devs Community"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-background via-background/80 to-transparent p-4">
            <div className="flex items-center gap-4 text-center md:text-left">
              <Logo className="h-20 w-20 md:h-24 md:w-24 flex-shrink-0" />
              <div>
                <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary">Arewa Tech Connect</h1>
                <p className="text-lg md:text-xl text-muted-foreground mt-1">Dev & AI Hangout</p>
              </div>
            </div>
            <p className="mt-8 max-w-2xl text-center text-lg text-muted-foreground">
              An exclusive gathering of tech enthusiasts and professionals in Northern Nigeria. Join us to connect, learn, and showcase your work.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="text-lg py-7 px-8 transform hover:scale-105 transition-transform duration-300">
                    Join Us
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-primary">Register for Arewa Tech Connect</DialogTitle>
                    <DialogDescription>
                      Fill out the form below to secure your spot at the event.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <RegistrationForm onRegistrationSuccess={handleRegistrationSuccess} />
                  </div>
                </DialogContent>
              </Dialog>
              <Button asChild size="lg" variant="outline" className="text-lg py-7 px-8">
                <a href="mailto:partners@arewatechconnect.com">Partner with Us</a>
              </Button>
              <Dialog open={isShowcaseDialogOpen} onOpenChange={setIsShowcaseDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" variant="outline" className="text-lg py-7 px-8">
                    Showcase a Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                   <DialogHeader>
                    <DialogTitle className="text-2xl text-primary">Showcase Your Project</DialogTitle>
                    <DialogDescription>
                      Submit your project to be featured at the event.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <ShowcaseForm onShowcaseSuccess={handleShowcaseSuccess}/>
                  </div>
                </DialogContent>
              </Dialog>
              <Button asChild size="lg" variant="secondary" className="text-lg py-7 px-8">
                <Link href="/promote">Create Promo Banner</Link>
              </Button>
            </div>
             <div className="mt-8">
                 <Button asChild variant="link">
                    <Link href="/payment">Already Registered? Make Payment</Link>
                 </Button>
            </div>
          </div>
        </div>
      </main>
      <Toaster />
    </>
  );
}
