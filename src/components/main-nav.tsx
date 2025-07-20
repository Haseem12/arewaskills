
'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Logo } from './logo';
import { Button } from './ui/button';

const portfolioItems: { title: string; href: string; description: string }[] = [
  {
    title: 'UI/UX Design',
    href: '#',
    description: 'Crafting intuitive and beautiful user interfaces.',
  },
  {
    title: 'Website Design',
    href: '#',
    description: 'Building modern and responsive websites.',
  },
  {
    title: 'Brand Identity Design',
    href: '#',
    description: 'Creating memorable brand identities that stand out.',
  },
];

const servicesItems: { title: string; href: string }[] = [
  { title: 'UI/UX Design Services', href: '#' },
  { title: 'Brand Identity Design Services', href: '#' },
  { title: 'Web Design & Development Services', href: '#' },
  { title: 'Fractional UI/UX Design Services', href: '#' },
  { title: 'Generative AI Artwork Services', href: '#' },
  { title: 'Design Systems', href: '#' },
  { title: 'Search Engine Optimization (SEO) Services', href: '#' },
];

const legacyItems: { title: string; href: string }[] = [
  { title: 'Windows Media Player Skins Design', href: '#' },
  { title: 'Widget + Gadget Design', href: '#' },
  { title: 'Icon Design & Development', href: '#' },
  { title: 'Desktop Customization Design', href: '#' },
];

const blogItems: { title: string; href: string }[] = [
  { title: 'UI/UX Design Blog', href: '/blog' },
  { title: 'Generative AI Artwork Blog', href: '/blog' },
  { title: 'Brand Identity & Logo Design Blog', href: '/blog' },
  { title: 'Desktop & Mobile Wallpaper Blog', href: '/blog' },
];


export function MainNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Logo className="h-8 w-8" />
          <span className="font-bold sm:inline-block">Skill Arewa</span>
        </Link>
        <div className="flex-1">
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
               <NavigationMenuItem>
                <Link href="/" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Home
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Portfolios</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                    {portfolioItems.map((component) => (
                      <ListItem
                        key={component.title}
                        title={component.title}
                        href={component.href}
                      >
                        {component.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Services</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px]">
                     {servicesItems.map((item) => (
                      <ListItem key={item.title} title={item.title} href={item.href} />
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
               <NavigationMenuItem>
                <NavigationMenuTrigger>Legacy</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px]">
                     {legacyItems.map((item) => (
                      <ListItem key={item.title} title={item.title} href={item.href} />
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Blogs</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px]">
                     {blogItems.map((item) => (
                      <ListItem key={item.title} title={item.title} href={item.href} />
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                 <Link href="#" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Clients
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="#" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Contact
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="hidden md:flex items-center justify-end space-x-4">
             <Button asChild>
                <a href="mailto:contact@skillarewa.com">Get a Quote</a>
            </Button>
        </div>
        {/* Mobile menu could be added here */}
      </div>
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';
