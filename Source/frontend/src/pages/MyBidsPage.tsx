import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../core/store/store';
import { showNotification } from '../core/store/reducers/app';
import { BidsAPI } from '../core/api/tenders';
import { extractError } from '../core/api/interceptor';
import { Bid } from '../core/constants/types';
import Loader from '../components/Loader';
import { BidBadge, formatPrice, formatDate } from '../components/Badges';

export default function MyBidsPage() {
  const dispatch = useAppDispatch();
  const [list, setList] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [price, setPrice] = useState('');
  const [comment, setComment] = useState('');

  const load = () => {
    setLoading(true);
    BidsAPI.getMy()
      .then(setList)
      .catch((e) => dispatch(showNotification({ text: extractError(e), type: 'error' })))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const startEdit = (b: Bid) => {
    setEditId(b.id);
    setPrice(String(b.price));
    setComment(b.comment || '');
  };

  const saveEdit = async () => {
    if (editId === null) return;
    try {
      await BidsAPI.update(editId, { price: parseFloat(price), comment });
      dispatch(showNotification({ text: 'Заявка обновлена', type: 'success' }));
      setEditId(null);
      load();
    } catch (e) {
      dispatch(showNotification({ text: extractError(e), type: 'error' }));
    }
  };

  const remove = async (b: Bid) => {
    if (!confirm('Отозвать заявку?')) return;
    try {
      await BidsAPI.remove(b.id);
      dispatch(showNotification({ text: 'Заявка отозвана', type: 'success' }));
      load();
    } catch (e) {
      dispatch(showNotification({ text: extractError(e), type: 'error' }));
    }
  };

  return (
    <div className="container">
      <div className="mb-24">
        <h1 style={{ fontSize: 28 }}>Мои заявки</h1>
        <p className="text-soft">Заявки, поданные на тендеры</p>
      </div>

      {loading ? (
        <Loader />
      ) : list.length === 0 ? (
        <div className="empty card">Вы ещё не подавали заявок</div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Тендер</th>
                <th>Цена</th>
                <th>Подана</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((b) => (
                <tr key={b.id}>
                  <td>
                    <Link to={`/tenders/${b.tenderId}`} style={{ fontWeight: 600 }}>
                      {b.tender?.title || `Тендер #${b.tenderId}`}
                    </Link>
                  </td>
                  <td>
                    {editId === b.id ? (
                      <input className="input" type="number" value={price}
                        onChange={(e) => setPrice(e.target.value)} style={{ width: 140 }} />
                    ) : (
                      <span className="price">{formatPrice(b.price)}</span>
                    )}
                  </td>
                  <td className="text-sm">{formatDate(b.createdAt)}</td>
                  <td><BidBadge status={b.status} /></td>
                  <td>
                    {editId === b.id ? (
                      <div className="row">
                        <button className="btn btn-primary btn-sm" onClick={saveEdit}>Сохранить</button>
                        <button className="btn btn-outline btn-sm" onClick={() => setEditId(null)}>Отмена</button>
                      </div>
                    ) : (
                      b.status === 'submitted' && (
                        <div className="row">
                          <button className="btn btn-outline btn-sm" onClick={() => startEdit(b)}>Изменить</button>
                          <button className="btn btn-danger btn-sm" onClick={() => remove(b)}>Отозвать</button>
                        </div>
                      )
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
