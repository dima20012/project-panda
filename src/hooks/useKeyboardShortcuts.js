import { useEffect } from 'react';

export const useKeyboardShortcuts = ({
  onToggleSearch,
  onPrevChannel,
  onNextChannel,
  onToggleVoiceMute,
  onCloseModals
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + K -> Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onToggleSearch && onToggleSearch();
      }

      // Esc -> Close modals
      if (e.key === 'Escape') {
        onCloseModals && onCloseModals();
      }

      // Alt + Up / Alt + Down -> Channel switching
      if (e.altKey && e.key === 'ArrowUp') {
        e.preventDefault();
        onPrevChannel && onPrevChannel();
      }
      if (e.altKey && e.key === 'ArrowDown') {
        e.preventDefault();
        onNextChannel && onNextChannel();
      }

      // Ctrl + Shift + M -> Global Voice Mute Toggle
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        onToggleVoiceMute && onToggleVoiceMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleSearch, onPrevChannel, onNextChannel, onToggleVoiceMute, onCloseModals]);
};
