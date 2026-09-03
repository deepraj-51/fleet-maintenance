// src/components/Modal.jsx
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ title, onClose, children }) {
  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement;

    const firstFocusable = dialogRef.current?.querySelector(
      'input, select, textarea, button:not([data-close])'
    );
    (firstFocusable || dialogRef.current)?.focus();

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll(
          'input, select, textarea, button, a[href]'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded bg-surface p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        ref={dialogRef}
        tabIndex={-1}
      >
        <div className="mb-4 flex items-start justify-between">
          <h2 id="modal-title" className="text-lg font-semibold">
            {title}
          </h2>
          <button
            type="button"
            data-close
            onClick={onClose}
            className="min-h-9 min-w-9 rounded p-1 text-muted hover:bg-bg hover:text-ink"
          >
            <span aria-hidden="true">✕</span>
            <span className="sr-only">Close dialog</span>
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}