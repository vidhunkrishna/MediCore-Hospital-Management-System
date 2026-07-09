import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, required, error, hint, children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className={cn('text-xs font-semibold', error ? 'text-destructive' : 'text-foreground')}>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error && (
        <div className="flex items-center gap-1 text-[11px] text-destructive">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {hint && !error && (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

/** Textarea styled to match Input */
export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground',
      'placeholder:text-muted-foreground resize-none',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-primary/50',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'transition-colors duration-150',
      className
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';
