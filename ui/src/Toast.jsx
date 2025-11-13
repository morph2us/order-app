import { useEffect } from 'react';
import './Toast.css';

function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-message" style={{ whiteSpace: 'pre-line' }}>{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="닫기">
        ×
      </button>
    </div>
  );
}

export default Toast;

