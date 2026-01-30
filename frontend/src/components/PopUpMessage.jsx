import { useState, useEffect } from 'react';

export default function PopUpMessage({
  title,
  content,
  delay = 0,
  duration = 0,
  dismissKey,
  onDismiss,
  className = '',
}) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    if (dismissKey && typeof sessionStorage !== 'undefined' && sessionStorage.getItem(`dismissed-${dismissKey}`)) {
      setMounted(false);
      return;
    }
    const t = setTimeout(() => setVisible(true), delay);
    let t2;
    if (duration > 0) {
      t2 = setTimeout(() => {
        setVisible(false);
        if (dismissKey) sessionStorage.setItem(`dismissed-${dismissKey}`, 'true');
        onDismiss?.();
        setTimeout(() => setMounted(false), 300);
      }, delay + duration);
    }
    return () => {
      clearTimeout(t);
      if (t2) clearTimeout(t2);
    };
  }, [delay, duration, dismissKey, onDismiss]);

  const handleClose = () => {
    setVisible(false);
    if (dismissKey) sessionStorage.setItem(`dismissed-${dismissKey}`, 'true');
    onDismiss?.();
    setTimeout(() => setMounted(false), 300);
  };

  if (!mounted) return null;

  return (
    <div
      className={`popup-message ${className}`}
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }}
    >
      <div className="popup-message-header">
        <span className="popup-message-title">{title}</span>
        <button type="button" className="popup-message-close" onClick={handleClose} aria-label="Close">
          ×
        </button>
      </div>
      <div className="popup-message-content">{content}</div>
    </div>
  );
}
