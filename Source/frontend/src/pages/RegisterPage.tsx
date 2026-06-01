import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../core/store/store';
import { registerThunk, clearError } from '../core/store/reducers/auth';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuth, isLoading, error } = useAppSelector((s) => s.auth);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'supplier',
    organization: '',
  });

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuth) navigate('/tenders');
  }, [isAuth, navigate]);

  const change = (k: string, v: string) => setForm({ ...form, [k]: v });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(registerThunk(form));
  };

  return (
    <div style={wrap}>
      <div style={panel}>
        <div style={brand}>
          <span style={brandMark}>ГЗ</span>
          <div>
            <h1 style={{ fontSize: 22 }}>Регистрация</h1>
            <p className="text-soft text-sm">Создание учётной записи участника</p>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label>ФИО / Контактное лицо</label>
            <input className="input" value={form.name}
              onChange={(e) => change('name', e.target.value)} required />
          </div>
          <div className="field">
            <label>Электронная почта</label>
            <input className="input" type="email" value={form.email}
              onChange={(e) => change('email', e.target.value)} required />
          </div>
          <div className="field">
            <label>Пароль (минимум 6 символов)</label>
            <input className="input" type="password" value={form.password}
              onChange={(e) => change('password', e.target.value)} required />
          </div>
          <div className="field">
            <label>Роль участника</label>
            <select className="select" value={form.role}
              onChange={(e) => change('role', e.target.value)}>
              <option value="supplier">Поставщик</option>
              <option value="customer">Заказчик</option>
            </select>
          </div>
          <div className="field">
            <label>Организация</label>
            <input className="input" value={form.organization}
              onChange={(e) => change('organization', e.target.value)}
              placeholder="Название организации" />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={isLoading}>
            {isLoading ? 'Регистрация…' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="center text-sm mt-16 text-soft">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
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
  background: 'linear-gradient(135deg, #1e3a5f 0%, #16304f 100%)',
};
const panel: React.CSSProperties = {
  width: '100%',
  maxWidth: 440,
  background: '#fff',
  borderRadius: 14,
  padding: 36,
  boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
};
const brand: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 };
const brandMark: React.CSSProperties = {
  width: 48, height: 48, borderRadius: 10, background: 'var(--color-primary)', color: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20,
};
