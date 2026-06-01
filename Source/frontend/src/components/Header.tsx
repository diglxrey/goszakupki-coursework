import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../core/store/store';
import { logout } from '../core/store/reducers/auth';
import { ROLE_LABELS } from '../core/constants/types';

export default function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuth } = useAppSelector((s) => s.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!isAuth || !user) return null;

  const links: { to: string; label: string }[] = [
    { to: '/tenders', label: 'Тендеры' },
  ];
  if (user.role === 'customer') {
    links.push({ to: '/my-tenders', label: 'Мои тендеры' });
    links.push({ to: '/contracts', label: 'Контракты' });
  }
  if (user.role === 'supplier') {
    links.push({ to: '/my-bids', label: 'Мои заявки' });
    links.push({ to: '/contracts', label: 'Контракты' });
  }
  links.push({ to: '/rating', label: 'Рейтинг' });
  if (user.role === 'admin') {
    links.push({ to: '/admin/users', label: 'Пользователи' });
    links.push({ to: '/admin/contracts', label: 'Все контракты' });
  }

  const isActive = (to: string) => location.pathname === to;

  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        <Link to="/tenders" style={styles.logo}>
          <span style={styles.logoMark}>ГЗ</span>
          <span style={styles.logoText}>Единая система госзакупок</span>
        </Link>

        <nav style={styles.nav}>
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              style={{ ...styles.navLink, ...(isActive(l.to) ? styles.navLinkActive : {}) }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="row">
          <div style={styles.userBox}>
            <span style={styles.userName}>{user.name}</span>
            <span className="badge badge-role">{ROLE_LABELS[user.role]}</span>
          </div>
          <button className="btn btn-outline btn-sm" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </div>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    background: 'var(--color-surface)',
    borderBottom: '1px solid var(--color-line)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  inner: {
    maxWidth: 1120,
    margin: '0 auto',
    padding: '0 24px',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 24,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' },
  logoMark: {
    width: 34,
    height: 34,
    borderRadius: 8,
    background: 'var(--color-primary)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 15,
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 16,
    color: 'var(--color-ink)',
    whiteSpace: 'nowrap',
  },
  nav: { display: 'flex', gap: 4, flex: 1, marginLeft: 16 },
  navLink: {
    padding: '8px 12px',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--color-ink-soft)',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  navLinkActive: { color: 'var(--color-primary)', background: 'var(--color-info-bg)', fontWeight: 600 },
  userBox: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 },
  userName: { fontSize: 13, fontWeight: 600 },
};
