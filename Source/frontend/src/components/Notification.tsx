import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../core/store/store';
import { clearNotification } from '../core/store/reducers/app';

export default function Notification() {
  const dispatch = useAppDispatch();
  const { notification, notificationType } = useAppSelector((s) => s.app);

  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => dispatch(clearNotification()), 3500);
      return () => clearTimeout(t);
    }
  }, [notification, dispatch]);

  if (!notification) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
        padding: '14px 20px',
        borderRadius: 8,
        boxShadow: 'var(--shadow-lg)',
        fontSize: 14,
        fontWeight: 600,
        maxWidth: 360,
        background: notificationType === 'error' ? 'var(--color-danger)' : 'var(--color-success)',
        color: '#fff',
      }}
    >
      {notification}
    </div>
  );
}
