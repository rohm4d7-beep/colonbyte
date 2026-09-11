import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ConfirmContext = createContext(null);

// Replaces window.confirm() app-wide. Native confirm() dialogs share a per-page suppression
// switch - Chrome (and other browsers) show a "Prevent this page from creating additional
// dialogs" checkbox after a couple of them, and once ticked it silently auto-cancels every
// future window.confirm() call on the page with no visible sign anything happened. A
// destructive action (delete lead) and an unrelated one (send email) sharing that switch meant
// ticking it while deleting a lead silently broke the Send Email button too. This dialog is
// plain React state, so it can't be suppressed that way.
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider');
  return ctx;
}

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const resolverRef = useRef(null);

  const confirm = useCallback((message, opts = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setState({ message, confirmLabel: opts.confirmLabel || 'Confirm', danger: opts.danger !== false });
    });
  }, []);

  const settle = (result) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {state && (
          <>
            <motion.div
              key="confirm-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[60]"
              style={{ background: 'rgba(0,0,0,0.4)' }}
              onClick={() => settle(false)}
            />
            <motion.div
              key="confirm-dialog"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              className="fixed z-[70] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[360px] rounded-[24px] border p-6"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', boxShadow: '0 12px 32px rgba(0,0,0,0.18)' }}
              role="alertdialog"
              aria-modal="true"
            >
              <p className="text-[14px] leading-relaxed text-text mb-6">{state.message}</p>
              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => settle(false)}
                  className="h-9 px-4 rounded-full text-[13px] font-medium text-text-2 hover:text-text transition-colors duration-150"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  autoFocus
                  onClick={() => settle(true)}
                  className="h-9 px-4 rounded-full text-[13px] font-semibold transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
                  style={{ background: state.danger ? 'var(--color-danger)' : 'var(--color-black)', color: '#ffffff' }}
                >
                  {state.confirmLabel}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}
