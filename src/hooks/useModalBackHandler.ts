import { useEffect, useRef } from 'react';

/**
 * Custom hook to intercept browser/mobile back button (popstate)
 * and close the modal/view instead of navigating away or leaving the app.
 */
export function useModalBackHandler(isOpen: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    // Generate unique ID for this modal state
    const stateId = `modal_state_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    // Push dummy history entry
    window.history.pushState({ modalId: stateId }, '');

    let poppedByBackButton = false;

    const handlePopState = () => {
      poppedByBackButton = true;
      onCloseRef.current();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // If closed by UI click instead of back button, revert the pushed history entry
      if (!poppedByBackButton && window.history.state && window.history.state.modalId === stateId) {
        window.history.back();
      }
    };
  }, [isOpen]);
}
