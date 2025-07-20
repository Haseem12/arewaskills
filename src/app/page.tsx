
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { ParticleBackground } from '@/components/particle-background';
import { BlogSection } from '@/components/blog-section';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-gray-200 font-body overflow-x-hidden">
      <ParticleBackground />
      <div className="relative z-10">
        <div className="relative flex min-h-screen">
          {/* Content Section */}
          <div className="w-full lg:w-3/5 flex flex-col justify-center p-8 md:p-16">
              <div className="max-w-xl">
                  <Logo className="h-24 w-24 mb-6" />
                  <h1 className="text-4xl md:text-6xl font-headline font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                      Skill Arewa
                  </h1>
                  <p className="mt-4 max-w-2xl text-lg md:text-xl text-gray-400">
                      Empowering Northern Nigeria with transformative skills in Technology, Development, and Artificial Intelligence. We are building the future, one skill at a time.
                  </p>
              </div>
              
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl">
                   <Button asChild size="lg" className="bg-primary/90 hover:bg-primary text-white text-lg py-7 px-8 transition-transform transform hover:scale-105">
                      <Link href="/event">Northern Tech Exchange <ArrowRight className="ml-2" /></Link>
                   </Button>
                    <Button asChild size="lg" variant="outline" className="text-lg py-7 px-8 border-primary/50 text-gray-300 hover:bg-primary/10 hover:border-primary hover:text-white">
                      <a href="mailto:partners@arewaskills.com.ng">Partner with Us</a>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="text-lg py-7 px-8 border-primary/50 text-gray-300 hover:bg-primary/10 hover:border-primary hover:text-white">
                      <a href="mailto:showcase@arewaskills.com.ng">Showcase a Project</a>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="text-lg py-7 px-8 border-primary/50 text-gray-300 hover:bg-primary/10 hover:border-primary hover:text-white">
                      <a href="tel:+2348063386516">Call Us</a>
                  </Button>
              </div>
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

        <BlogSection />

        <footer className="text-center p-8 md:p-16 text-gray-500">
          <p>&copy; {new Date().getFullYear()} Skill Arewa. All Rights Reserved.</p>
        </footer>
      </div>
    </main>
  );
}
