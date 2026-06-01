import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../core/store/store';
import { showNotification } from '../core/store/reducers/app';
import { TendersAPI } from '../core/api/tenders';
import { extractError } from '../core/api/interceptor';
import { Tender } from '../core/constants/types';
import Loader from '../components/Loader';
import { TenderBadge, formatPrice, formatDate } from '../components/Badges';

const emptyForm = { title: '', description: '', startPrice: '', deadline: '' };

export default function MyTendersPage() {
  const dispatch = useAppDispatch();
  const [list, setList] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    TendersAPI.getMy()
      .then(setList)
      .catch((e) => dispatch(showNotification({ text: extractError(e), type: 'error' })))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const change = (k: string, v: string) => setForm({ ...form, [k]: v });

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (t: Tender) => {
    setEditId(t.id);
    setForm({
      title: t.title,
      description: t.description || '',
      startPrice: String(t.startPrice),
      deadline: t.deadline ? t.deadline.slice(0, 16) : '',
    });
    setShowForm(true);
  };

  const save = async () => {
    setBusy(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        startPrice: parseFloat(form.startPrice),
        deadline: new Date(form.deadline).toISOString(),
      };
      if (editId) {
        await TendersAPI.update(editId, payload);
        dispatch(showNotification({ text: 'Тендер обновлён', type: 'success' }));
      } else {
        await TendersAPI.create(payload);
        dispatch(showNotification({ text: 'Тендер создан', type: 'success' }));
      }
      setShowForm(false);
      load();
    } catch (e) {
      dispatch(showNotification({ text: extractError(e), type: 'error' }));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (t: Tender) => {
    if (!confirm(`Удалить тендер «${t.title}»?`)) return;
    try {
      await TendersAPI.remove(t.id);
      dispatch(showNotification({ text: 'Тендер удалён', type: 'success' }));
      load();
    } catch (e) {
      dispatch(showNotification({ text: extractError(e), type: 'error' }));
    }
  };

  return (
    <div className="container">
      <div className="row-between mb-24">
        <div>
          <h1 style={{ fontSize: 28 }}>Мои тендеры</h1>
          <p className="text-soft">Управление вашими закупками</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Создать тендер</button>
      </div>

      {showForm && (
        <div className="card mb-24">
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>
            {editId ? 'Редактирование тендера' : 'Новый тендер'}
          </h2>
          <div className="field">
            <label>Название</label>
            <input className="input" value={form.title}
              onChange={(e) => change('title', e.target.value)} />
          </div>
          <div className="field">
            <label>Описание</label>
            <textarea className="textarea" value={form.description}
              onChange={(e) => change('description', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="field">
              <label>Начальная цена, ₽</label>
              <input className="input" type="number" value={form.startPrice}
                onChange={(e) => change('startPrice', e.target.value)} />
            </div>
            <div className="field">
              <label>Дедлайн приёма заявок</label>
              <input className="input" type="datetime-local" value={form.deadline}
                onChange={(e) => change('deadline', e.target.value)} />
            </div>
          </div>
          <div className="row">
            <button className="btn btn-primary" onClick={save}
              disabled={busy || !form.title || !form.startPrice || !form.deadline}>
              {editId ? 'Сохранить' : 'Создать'}
            </button>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>Отмена</button>
          </div>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : list.length === 0 ? (
        <div className="empty card">У вас пока нет тендеров</div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Начальная цена</th>
                <th>Дедлайн</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((t) => (
                <tr key={t.id}>
                  <td>
                    <Link to={`/tenders/${t.id}`} style={{ fontWeight: 600 }}>{t.title}</Link>
                  </td>
                  <td className="price">{formatPrice(t.startPrice)}</td>
                  <td className="text-sm">{formatDate(t.deadline)}</td>
                  <td><TenderBadge status={t.status} /></td>
                  <td>
                    <div className="row">
                      {t.status !== 'awarded' && (
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(t)}>
                          Изменить
                        </button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => remove(t)}>
                        Удалить
                      </button>
                    </div>
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
