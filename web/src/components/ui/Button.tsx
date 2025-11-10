import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils.ts';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
    {
        variants: {
            variant: {
                default:
                    'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md focus:ring-blue-500',
                secondary:
                    'bg-gray-200 text-gray-900 hover:bg-gray-300 border border-gray-300 focus:ring-gray-500',
                destructive:
                    'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md focus:ring-red-500',
                outline:
                    'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-blue-500',
                ghost:
                    'hover:bg-gray-100 text-gray-700 focus:ring-blue-500',
                link:
                    'text-blue-600 underline-offset-4 hover:underline focus:ring-blue-500',
                success:
                    'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md focus:ring-green-500',
                warning:
                    'bg-yellow-500 text-white hover:bg-yellow-600 shadow-sm hover:shadow-md focus:ring-yellow-500',
            },
            size: {
                sm: 'h-8 px-3 text-sm rounded-md',
                default: 'h-10 px-4 text-base rounded-lg',
                lg: 'h-12 px-6 text-lg rounded-xl',
                icon: 'h-10 w-10 rounded-lg',
            },
            fullWidth: {
                true: 'w-full',
                false: 'w-auto',
            },
            loading: {
                true: 'cursor-wait',
                false: '',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
            fullWidth: false,
            loading: false,
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({
         className,
         variant,
         size,
         fullWidth,
         loading,
         leftIcon,
         rightIcon,
         children,
         disabled,
         ...props
     }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, fullWidth, loading, className }))}
                ref={ref}
                disabled={disabled || loading}
                {...props}
            >
                {loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                )}
                {!loading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
                {children}
                {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
            </button>
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
