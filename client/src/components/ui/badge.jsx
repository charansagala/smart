import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
    {
        variants: {
            variant: {
                default: 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]',
                secondary: 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]',
                destructive: 'bg-[hsl(var(--destructive))] text-white',
                outline: 'border border-[hsl(var(--border))] text-[hsl(var(--foreground))]',
                success: 'bg-green-500/20 text-green-400 border border-green-500/30',
                warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
                info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
            },
        },
        defaultVariants: { variant: 'default' },
    }
);

function Badge({ className, variant, ...props }) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
