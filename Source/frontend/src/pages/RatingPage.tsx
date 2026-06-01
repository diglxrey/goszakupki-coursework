import { useEffect, useState } from 'react';
import { useAppDispatch } from '../core/store/store';
import { showNotification } from '../core/store/reducers/app';
import { ContractsAPI } from '../core/api/tenders';
import { extractError } from '../core/api/interceptor';
import Loader from '../components/Loader';
import { formatPrice } from '../components/Badges';

export default function RatingPage() {
  const dispatch = useAppDispatch();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ContractsAPI.getRating()
      .then(setList)
      .catch((e) => dispatch(showNotification({ text: extractError(e), type: 'error' })))
      .finally(() => setLoading(false));
  }, [dispatch]);

  return (
    <div className="container">
      <div className="mb-24">
        <h1 style={{ fontSize: 28 }}>Рейтинг поставщиков</h1>
        <p className="text-soft">По количеству заявок, побед и сумме контрактов</p>
      </div>

      {loading ? (
        <Loader />
      ) : list.length === 0 ? (
        <div className="empty card">Нет данных</div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Поставщик</th>
                <th>Заявок</th>
                <th>Побед</th>
                <th>Контрактов</th>
                <th>Сумма контрактов</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s, i) => (
                <tr key={s.supplier_id}>
                  <td style={{ fontWeight: 700, color: 'var(--color-accent)' }}>{i + 1}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.organization || s.supplier_name}</div>
                    <div className="text-sm text-soft">{s.supplier_name}</div>
                  </td>
                  <td>{s.total_bids}</td>
                  <td>{s.won_bids}</td>
                  <td>{s.contracts_count}</td>
                  <td className="price">{formatPrice(s.contracts_total_sum)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
