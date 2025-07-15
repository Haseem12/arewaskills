
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BrainCircuit, Code, Rocket } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground font-body">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[70vh] text-center p-4 bg-gradient-to-b from-primary/5 to-transparent">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--primary-rgb),0.1),rgba(255,255,255,0))] -z-10"></div>
        <Logo className="h-24 w-24 mb-6" />
        <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary">
          Skills Arewa
        </h1>
        <p className="mt-4 max-w-3xl text-lg md:text-xl text-muted-foreground">
          Empowering Northern Nigeria with transformative skills in Technology, Development, and Artificial Intelligence.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="text-lg py-7 px-8">
            <Link href="#initiatives">Explore Initiatives</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-lg py-7 px-8">
            <a href="mailto:contact@skillsarewa.com">Get in Touch</a>
          </Button>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-24 px-4 container mx-auto">
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-primary">Our Vision</h2>
            <p className="mt-4 text-lg text-muted-foreground">
                At Skills Arewa, our mission is to bridge the knowledge gap and foster a vibrant ecosystem of tech innovators, developers, and leaders across Northern Nigeria. We believe in the power of education and community to unlock the immense potential of the Arewa region and drive its digital transformation.
            </p>
        </div>
      </section>

      {/* Focus Areas Section */}
       <section id="focus" className="py-16 md:py-24 px-4 bg-muted/40">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-primary text-center mb-12">What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4">
                        <Code className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle>Software Development</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Hands-on training, workshops, and mentorship programs for aspiring and professional developers.</p>
                </CardContent>
            </Card>
            <Card className="text-center hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4">
                        <BrainCircuit className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle>Artificial Intelligence</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Demystifying AI through practical learning, from foundational concepts to advanced applications.</p>
                </CardContent>
            </Card>
            <Card className="text-center hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                     <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4">
                        <Rocket className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle>Tech Community</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Building a strong, collaborative community through meetups, hackathons, and conferences.</p>
                </CardContent>
            </Card>
          </div>
        </div>
       </section>
      
       {/* Initiatives Section */}
       <section id="initiatives" className="py-16 md:py-24 px-4">
            <div className="container mx-auto">
                 <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-primary">Our Flagship Initiative</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                       Arewa Tech Connect is our premier event, bringing together the brightest minds in tech for a day of learning, networking, and innovation.
                    </p>
                </div>
                <div className="mt-12 max-w-2xl mx-auto">
                    <Card className="bg-gradient-to-br from-primary/10 to-primary/20 overflow-hidden">
                       <CardHeader>
                         <CardTitle className="text-center text-primary text-2xl">Arewa Tech Connect</CardTitle>
                       </CardHeader>
                       <CardContent className="text-center">
                            <p className="text-muted-foreground mb-6">The Dev & AI Hangout for Northern Nigeria's tech community.</p>
                            <Button asChild>
                                <Link href="/event">
                                    Visit Event Page <ArrowRight className="ml-2" />
                                </Link>
                            </Button>
                       </CardContent>
                    </Card>
                </div>
            </div>
       </section>

       {/* Footer */}
       <footer className="py-8 bg-card border-t">
            <div className="container mx-auto text-center text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} Skills Arewa. All Rights Reserved.</p>
                <p>Driving the future of tech in Northern Nigeria.</p>
            </div>
       </footer>

    </main>
  );
}
