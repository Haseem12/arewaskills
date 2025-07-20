
import { cn } from '@/lib/utils';
import { Megaphone } from 'lucide-react';

interface AdSlotProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AdSlot({ className, ...props }: AdSlotProps) {
  return (
    <div
      className={cn(
        'flex h-60 w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 text-muted-foreground',
        className
      )}
      {...props}
    >
      <div className="text-center">
        <Megaphone className="mx-auto h-8 w-8" />
        <p className="mt-2 text-sm font-semibold">Advertisement</p>
        <p className="text-xs">Your ad could be here!</p>
      </div>
    </div>
  );
}
