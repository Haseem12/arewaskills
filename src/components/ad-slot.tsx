
'use client';

import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface AdSlotProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AdSlot({ className, ...props }: AdSlotProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <div
      className={cn('flex w-full items-center justify-center', className)}
      {...props}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-7851979888109765"
        data-ad-slot="YOUR_AD_SLOT_ID" // Remember to replace this with your actual ad slot ID
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
