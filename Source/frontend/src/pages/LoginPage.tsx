import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../core/store/store';
import { loginThunk, clearError } from '../core/store/reducers/auth';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuth, isLoading, error } = useAppSelector((s) => s.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuth) navigate('/tenders');
  }, [isAuth, navigate]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(loginThunk({ email, password }));
  };

  return (
    <div style={wrap}>
      <div style={panel}>
        <div style={brand}>
          <span style={brandMark}>ГЗ</span>
          <div>
            <h1 style={{ fontSize: 22 }}>Вход в систему</h1>
            <p className="text-soft text-sm">Единая система государственных закупок</p>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label>Электронная почта</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gov.ru"
              required
            />
          </div>
          <div className="field">
            <label>Пароль</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              required
            />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={isLoading}>
            {isLoading ? 'Вход…' : 'Войти'}
          </button>
        </form>

        <p className="center text-sm mt-16 text-soft">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}

const wrap: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
  background:
    'linear-gradient(135deg, #1e3a5f 0%, #16304f 100%)',
};
const panel: React.CSSProperties = {
  width: '100%',
  maxWidth: 420,
  background: '#fff',
  borderRadius: 14,
  padding: 36,
  boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
};
const brand: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 };
const brandMark: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 10,
  background: 'var(--color-primary)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: 20,
};
