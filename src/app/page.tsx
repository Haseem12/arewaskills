
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { ParticleBackground } from '@/components/particle-background';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-gray-200 font-body overflow-hidden">
      <ParticleBackground />
      <div className="relative flex min-h-screen">
        {/* Content Section */}
        <div className="w-full lg:w-3/5 flex flex-col justify-center p-8 md:p-16 relative z-10">
            <div className="max-w-xl">
                <Logo className="h-24 w-24 mb-6" />
                <h1 className="text-4xl md:text-6xl font-headline font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                    Arewa Tech Connect
                </h1>
                <p className="mt-4 max-w-2xl text-lg md:text-xl text-gray-400">
                    Empowering Northern Nigeria with transformative skills in Technology, Development, and Artificial Intelligence. We are building the future, one skill at a time.
                </p>
            </div>
            
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl">
                 <Button asChild size="lg" className="bg-primary/90 hover:bg-primary text-white text-lg py-7 px-8 transition-transform transform hover:scale-105">
                    <Link href="/event">Arewa Tech Connect <ArrowRight className="ml-2" /></Link>
                 </Button>
                  <Button asChild size="lg" variant="outline" className="text-lg py-7 px-8 border-primary/50 text-gray-300 hover:bg-primary/10 hover:border-primary hover:text-white">
                    <a href="mailto:partners@skillsarewa.com">Partner with Us</a>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg py-7 px-8 border-primary/50 text-gray-300 hover:bg-primary/10 hover:border-primary hover:text-white">
                    <a href="mailto:showcase@skillsarewa.com">Showcase a Project</a>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg py-7 px-8 border-primary/50 text-gray-300 hover:bg-primary/10 hover:border-primary hover:text-white">
                    <a href="tel:+234000000000">Call Us</a>
                </Button>
            </div>

             <footer className="mt-16 max-w-xl text-gray-500">
                <p>&copy; {new Date().getFullYear()} Arewa Tech Connect. All Rights Reserved.</p>
             </footer>
        </div>

        {/* Image Section */}
        <div className="hidden lg:block w-2/5 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-transparent to-transparent z-10"></div>
            <Image 
                src="/arewadev.png" 
                alt="Arewa Devs Community" 
                fill
                className="object-cover opacity-40"
            />
        </div>
      </div>
    </main>
  );
}

    
