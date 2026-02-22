import React from 'react';
import { cn } from '@/lib/utils';

export function PatternText({
    text = 'Text',
    className,
    ...props
}: Omit<React.ComponentProps<'p'>, 'children'> & { text: string }) {
    return (
        <p
            data-shadow={text}
            className={cn(
                'relative inline-block text-[2rem] md:text-[4.5rem] lg:text-[6rem] font-bold leading-[1.05] tracking-tight',
                'text-foreground',
                '[text-shadow:0.03em_0.03em_0_hsl(var(--background))]',
                'after:absolute after:top-[0.03em] after:left-[0.03em] after:-z-1 after:content-[attr(data-shadow)]',
                'after:bg-[length:0.06em_0.06em] after:bg-clip-text after:text-transparent after:text-shadow-none',
                'after:bg-[linear-gradient(45deg,transparent:45%,hsl(var(--primary))_45%,hsl(var(--primary))_55%,transparent_0)]',
                'after:animate-shadanim',
                className,
            )}
            {...props}
        >
            {text}
        </p>
    );
}
