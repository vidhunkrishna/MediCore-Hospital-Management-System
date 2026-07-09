import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '@/components/shared/ToastContainer';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { useUIStore } from '@/store/ui.store';
import { AIChat } from '@/pages/ai-command/AIChat';

export function AppLayout() {
  const location = useLocation();
  const { sidebarOpen } = useUIStore();
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background relative">
      <Sidebar />
      <Header />
      <motion.main
        animate={{ paddingLeft: sidebarOpen ? '260px' : '72px' }}
        transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="pt-16 min-h-screen"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="p-6"
          >
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </motion.main>
      <ToastContainer />

      {/* Floating AI Copilot Widget */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-[340px] sm:w-[380px] h-[500px] shadow-2xl rounded-2xl border border-border bg-card overflow-hidden"
            >
              <AIChat onClose={() => setChatOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setChatOpen(!chatOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
            chatOpen
              ? 'bg-muted hover:bg-muted/80 text-foreground border border-border'
              : 'bg-primary hover:bg-primary/95 text-primary-foreground'
          }`}
          aria-label="Toggle AI Operations Copilot"
        >
          <Brain className="w-5.5 h-5.5" />
        </motion.button>
      </div>
    </div>
  );
}
