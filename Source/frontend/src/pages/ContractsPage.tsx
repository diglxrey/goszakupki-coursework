import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../core/store/store';
import { showNotification } from '../core/store/reducers/app';
import { ContractsAPI } from '../core/api/tenders';
import { extractError } from '../core/api/interceptor';
import { Contract } from '../core/constants/types';
import Loader from '../components/Loader';
import { ContractBadge, formatPrice, formatDate } from '../components/Badges';

export default function ContractsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const [list, setList] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    ContractsAPI.getMy()
      .then(setList)
      .catch((e) => dispatch(showNotification({ text: extractError(e), type: 'error' })))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const changeStatus = async (c: Contract, status: string) => {
    try {
      await ContractsAPI.updateStatus(c.id, status);
      dispatch(showNotification({ text: 'Статус контракта обновлён', type: 'success' }));
      load();
    } catch (e) {
      dispatch(showNotification({ text: extractError(e), type: 'error' }));
    }
  };

  const isCustomer = user?.role === 'customer' || user?.role === 'admin';

  return (
    <div className="container">
      <div className="mb-24">
        <h1 style={{ fontSize: 28 }}>Контракты</h1>
        <p className="text-soft">Заключённые контракты по итогам тендеров</p>
      </div>

      {loading ? (
        <Loader />
      ) : list.length === 0 ? (
        <div className="empty card">Контрактов пока нет</div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Тендер</th>
                <th>{isCustomer ? 'Поставщик' : 'Заказчик'}</th>
                <th>Сумма</th>
                <th>Подписан</th>
                <th>Статус</th>
                {isCustomer && <th></th>}
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link to={`/tenders/${c.tenderId}`} style={{ fontWeight: 600 }}>
                      {c.tender?.title || `Тендер #${c.tenderId}`}
                    </Link>
                  </td>
                  <td>
                    {isCustomer
                      ? c.supplier?.organization || c.supplier?.name || '—'
                      : c.customer?.organization || c.customer?.name || '—'}
                  </td>
                  <td className="price">{formatPrice(c.finalPrice)}</td>
                  <td className="text-sm">{formatDate(c.signedAt)}</td>
                  <td><ContractBadge status={c.status} /></td>
                  {isCustomer && (
                    <td>
                      {c.status === 'active' && (
                        <div className="row">
                          <button className="btn btn-success btn-sm"
                            onClick={() => changeStatus(c, 'completed')}>Исполнен</button>
                          <button className="btn btn-danger btn-sm"
                            onClick={() => changeStatus(c, 'terminated')}>Расторгнуть</button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
