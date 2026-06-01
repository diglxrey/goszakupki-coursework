import { useEffect, useState } from 'react';
import { useAppDispatch } from '../core/store/store';
import { showNotification } from '../core/store/reducers/app';
import { ContractsAPI } from '../core/api/tenders';
import { extractError } from '../core/api/interceptor';
import Loader from '../components/Loader';
import { formatPrice, formatDate } from '../components/Badges';
import { CONTRACT_STATUS_LABELS } from '../core/constants/types';

export default function AdminContractsPage() {
  const dispatch = useAppDispatch();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ContractsAPI.getAll()
      .then(setList)
      .catch((e) => dispatch(showNotification({ text: extractError(e), type: 'error' })))
      .finally(() => setLoading(false));
  }, [dispatch]);

  const totalEconomy = list.reduce((s, c) => s + parseFloat(c.economy_abs || 0), 0);

  return (
    <div className="container">
      <div className="mb-24">
        <h1 style={{ fontSize: 28 }}>Все контракты</h1>
        <p className="text-soft">Сводка по всем заключённым контрактам с расчётом экономии</p>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="grid mb-24" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="card">
              <div className="text-sm text-soft mb-8">Всего контрактов</div>
              <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 700 }}>{list.length}</div>
            </div>
            <div className="card">
              <div className="text-sm text-soft mb-8">Суммарная экономия</div>
              <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-success)' }}>
                {formatPrice(totalEconomy)}
              </div>
            </div>
            <div className="card">
              <div className="text-sm text-soft mb-8">Общая сумма</div>
              <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                {formatPrice(list.reduce((s, c) => s + parseFloat(c.final_price || 0), 0))}
              </div>
            </div>
          </div>

          {list.length === 0 ? (
            <div className="empty card">Контрактов пока нет</div>
          ) : (
            <div className="card" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Тендер</th>
                    <th>Поставщик</th>
                    <th>Заказчик</th>
                    <th>Начальная</th>
                    <th>Финальная</th>
                    <th>Экономия</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((c) => (
                    <tr key={c.contract_id}>
                      <td style={{ fontWeight: 600 }}>{c.tender_title}</td>
                      <td className="text-sm">{c.supplier_org || c.supplier_name}</td>
                      <td className="text-sm">{c.customer_org || c.customer_name}</td>
                      <td className="price text-sm">{formatPrice(c.start_price)}</td>
                      <td className="price text-sm">{formatPrice(c.final_price)}</td>
                      <td style={{ fontWeight: 600, color: 'var(--color-success)' }}>
                        {c.economy_percent}%
                      </td>
                      <td className="text-sm">{CONTRACT_STATUS_LABELS[c.contract_status] || c.contract_status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
