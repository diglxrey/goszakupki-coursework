import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../core/store/store';
import { fetchTendersThunk } from '../core/store/reducers/tenders';
import Loader from '../components/Loader';
import { TenderBadge, formatPrice, formatDate } from '../components/Badges';

export default function TendersPage() {
  const dispatch = useAppDispatch();
  const { list, isLoading } = useAppSelector((s) => s.tenders);

  useEffect(() => {
    dispatch(fetchTendersThunk());
  }, [dispatch]);

  return (
    <div className="container">
      <div className="row-between mb-24">
        <div>
          <h1 style={{ fontSize: 28 }}>Тендеры</h1>
          <p className="text-soft">Актуальные государственные закупки</p>
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : list.length === 0 ? (
        <div className="empty card">Тендеры пока не опубликованы</div>
      ) : (
        <div className="grid">
          {list.map((t) => (
            <Link key={t.id} to={`/tenders/${t.id}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div className="row-between mb-8">
                  <TenderBadge status={t.status} />
                  <span className="text-sm text-soft">№ {t.id}</span>
                </div>
                <h3 style={{ fontSize: 17, marginBottom: 8 }}>{t.title}</h3>
                <p className="text-sm text-soft" style={ellipsis}>
                  {t.description || 'Без описания'}
                </p>
                <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                  <div className="row-between mb-8">
                    <span className="text-sm text-soft">Начальная цена</span>
                    <span className="price">{formatPrice(t.start_price)}</span>
                  </div>
                  <div className="row-between mb-8">
                    <span className="text-sm text-soft">Заявок</span>
                    <span className="text-sm" style={{ fontWeight: 600 }}>{t.bids_count}</span>
                  </div>
                  <div className="row-between">
                    <span className="text-sm text-soft">Заказчик</span>
                    <span className="text-sm" style={{ fontWeight: 600 }}>
                      {t.customer_organization || t.customer_name}
                    </span>
                  </div>
                  <div className="text-sm text-soft mt-8">
                    Приём до {formatDate(t.deadline)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const ellipsis: React.CSSProperties = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};
