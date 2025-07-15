import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import Image from 'next/image';

export default function Home() {
  return (
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
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="text-lg py-7 px-8 transform hover:scale-105 transition-transform duration-300">
              Join Us
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg py-7 px-8">
              <a href="mailto:partners@arewatechconnect.com">Partner with Us</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg py-7 px-8">
              <a href="mailto:showcase@arewatechconnect.com">Showcase a Project</a>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
