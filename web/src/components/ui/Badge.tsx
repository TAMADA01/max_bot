import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils.ts';

const badgeVariants = cva(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    {
        variants: {
            variant: {
                default:
                    'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200',
                primary:
                    'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200',
                secondary:
                    'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200',
                success:
                    'border-transparent bg-green-100 text-green-800 hover:bg-green-200',
                warning:
                    'border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
                error:
                    'border-transparent bg-red-100 text-red-800 hover:bg-red-200',
                purple:
                    'border-transparent bg-purple-100 text-purple-800 hover:bg-purple-200',
                pink:
                    'border-transparent bg-pink-100 text-pink-800 hover:bg-pink-200',
                indigo:
                    'border-transparent bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
            },
            size: {
                sm: 'px-2 py-0.5 text-xs',
                default: 'px-2.5 py-0.5 text-xs',
                lg: 'px-3 py-1 text-sm',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {
    icon?: React.ReactNode;
}

function Badge({ className, variant, size, icon, children, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
            {icon && <span className="mr-1.5">{icon}</span>}
            {children}
        </div>
    );
}

export { Badge, badgeVariants };
