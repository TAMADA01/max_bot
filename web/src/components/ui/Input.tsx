import { InputHTMLAttributes, forwardRef, useId } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils.ts';

const inputVariants = cva(
    'flex w-full rounded-lg border bg-white px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
    {
        variants: {
            variant: {
                default: 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
                error: 'border-red-500 focus:ring-red-500 focus:border-red-500',
                success: 'border-green-500 focus:ring-green-500 focus:border-green-500',
                warning: 'border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500',
            },
            size: {
                sm: 'h-8 px-3 text-xs rounded-md',
                default: 'h-10 px-3 rounded-lg',
                lg: 'h-12 px-4 text-base rounded-xl',
            },
            hasLeftIcon: {
                true: 'pl-10',
                false: '',
            },
            hasRightIcon: {
                true: 'pr-10',
                false: '',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
            hasLeftIcon: false,
            hasRightIcon: false,
        },
    }
);

export interface InputProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
        VariantProps<typeof inputVariants> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    iconClassName?: string;
    onLeftIconClick?: () => void;
    onRightIconClick?: () => void;
    leftIconButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
    rightIconButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({
         className,
         variant,
         size,
         label,
         error,
         helperText,
         leftIcon,
         rightIcon,
         iconClassName,
         onLeftIconClick,
         onRightIconClick,
         leftIconButtonProps,
         rightIconButtonProps,
         id,
         disabled,
         ...props
     }, ref) => {
        const generatedId = useId();
        const inputId = id || `input-${generatedId}`;
        const showError = variant === 'error' || error;
        const currentVariant = showError ? 'error' : variant;

        const handleLeftIconClick = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            onLeftIconClick?.();
        };

        const handleRightIconClick = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            onRightIconClick?.();
        };

        const IconWrapper = ({
            icon,
            position,
            onClick,
            buttonProps
        }: {
            icon: React.ReactNode;
            position: 'left' | 'right';
            onClick?: (e: React.MouseEvent) => void;
            buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
        }) => {
            const isClickable = !!onClick && !disabled;
            const baseClasses = cn(
                "absolute top-1/2 transform -translate-y-1/2 flex items-center justify-center h-4 w-4 transition-colors",
                position === 'left' ? "left-3" : "right-3",
                showError ? "text-red-500" : "text-gray-400",
                isClickable ? [
                    "cursor-pointer",
                    "hover:text-gray-600",
                    "active:scale-95",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm"
                ] : "pointer-events-none",
                disabled && "opacity-50 cursor-not-allowed",
                iconClassName
            );

            if (isClickable) {
                return (
                    <button
                        type="button"
                        className={baseClasses}
                        onClick={onClick}
                        disabled={disabled}
                        aria-label={position === 'left' ? 'Left icon action' : 'Right icon action'}
                        {...buttonProps}
                    >
                        {icon}
                    </button>
                );
            }

            return (
                <div className={baseClasses}>
                    {icon}
                </div>
            );
        };

        return (
            <div className="space-y-2 w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="text-sm font-medium text-gray-700"
                    >
                        {label}
                    </label>
                )}

                <div className="relative">
                    {leftIcon && (
                        <IconWrapper
                            icon={leftIcon}
                            position="left"
                            onClick={onLeftIconClick ? handleLeftIconClick : undefined}
                            buttonProps={leftIconButtonProps}
                        />
                    )}

                    <input
                        id={inputId}
                        className={cn(
                            inputVariants({
                                variant: currentVariant,
                                size,
                                hasLeftIcon: !!leftIcon,
                                hasRightIcon: !!rightIcon,
                                className
                            })
                        )}
                        ref={ref}
                        disabled={disabled}
                        {...props}
                    />

                    {rightIcon && (
                        <IconWrapper
                            icon={rightIcon}
                            position="right"
                            onClick={onRightIconClick ? handleRightIconClick : undefined}
                            buttonProps={rightIconButtonProps}
                        />
                    )}
                </div>

                {(error || helperText) && (
                    <p className={cn(
                        "text-xs transition-colors",
                        showError ? "text-red-600" : "text-gray-500"
                    )}>
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input, inputVariants };