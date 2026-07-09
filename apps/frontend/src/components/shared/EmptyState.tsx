import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center gap-3 py-16 px-8 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-muted/60 border border-border flex items-center justify-center">
        <Icon className="w-6 h-6 text-muted-foreground/60" strokeWidth={1.5} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground max-w-xs">{description}</p>
        )}
      </div>
      {action && (
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="mt-1 h-8 text-xs gap-1.5"
        >
          {action.icon && <action.icon className="w-3.5 h-3.5" />}
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}
