import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

export function AICommandPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
          <Brain className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">AI Command Center</h2>
          <p className="text-sm text-muted-foreground">Coming in Phase 7</p>
        </div>
      </div>
    </motion.div>
  );
}
