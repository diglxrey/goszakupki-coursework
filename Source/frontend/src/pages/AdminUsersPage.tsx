import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../core/store/store';
import { showNotification } from '../core/store/reducers/app';
import { UsersAPI } from '../core/api/auth';
import { extractError } from '../core/api/interceptor';
import { User, ROLE_LABELS } from '../core/constants/types';
import Loader from '../components/Loader';

const emptyForm = { name: '', email: '', password: '', role: 'supplier', organization: '' };

export default function AdminUsersPage() {
  const dispatch = useAppDispatch();
  const { user: current } = useAppSelector((s) => s.auth);
  const [list, setList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    UsersAPI.getAll()
      .then(setList)
      .catch((e) => dispatch(showNotification({ text: extractError(e), type: 'error' })))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const change = (k: string, v: string) => setForm({ ...form, [k]: v });

  const create = async () => {
    setBusy(true);
    try {
      await UsersAPI.create(form);
      dispatch(showNotification({ text: 'Пользователь создан', type: 'success' }));
      setShowForm(false);
      setForm(emptyForm);
      load();
    } catch (e) {
      dispatch(showNotification({ text: extractError(e), type: 'error' }));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (u: User) => {
    if (!confirm(`Удалить пользователя ${u.name}?`)) return;
    try {
      await UsersAPI.remove(u.id);
      dispatch(showNotification({ text: 'Пользователь удалён', type: 'success' }));
      load();
    } catch (e) {
      dispatch(showNotification({ text: extractError(e), type: 'error' }));
    }
  };

  return (
    <div className="container">
      <div className="row-between mb-24">
        <div>
          <h1 style={{ fontSize: 28 }}>Пользователи</h1>
          <p className="text-soft">Управление участниками системы</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          + Добавить
        </button>
      </div>

      {showForm && (
        <div className="card mb-24">
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Новый пользователь</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="field">
              <label>ФИО</label>
              <input className="input" value={form.name} onChange={(e) => change('name', e.target.value)} />
            </div>
            <div className="field">
              <label>Email</label>
              <input className="input" type="email" value={form.email} onChange={(e) => change('email', e.target.value)} />
            </div>
            <div className="field">
              <label>Пароль</label>
              <input className="input" type="password" value={form.password} onChange={(e) => change('password', e.target.value)} />
            </div>
            <div className="field">
              <label>Роль</label>
              <select className="select" value={form.role} onChange={(e) => change('role', e.target.value)}>
                <option value="supplier">Поставщик</option>
                <option value="customer">Заказчик</option>
                <option value="admin">Администратор</option>
              </select>
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label>Организация</label>
              <input className="input" value={form.organization} onChange={(e) => change('organization', e.target.value)} />
            </div>
          </div>
          <div className="row">
            <button className="btn btn-primary" onClick={create}
              disabled={busy || !form.name || !form.email || !form.password}>Создать</button>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>Отмена</button>
          </div>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>ФИО</th>
                <th>Email</th>
                <th>Организация</th>
                <th>Роль</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td className="text-sm">{u.email}</td>
                  <td className="text-sm">{u.organization || '—'}</td>
                  <td><span className="badge badge-role">{ROLE_LABELS[u.role]}</span></td>
                  <td>
                    {u.id !== current?.id && (
                      <button className="btn btn-danger btn-sm" onClick={() => remove(u)}>Удалить</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
