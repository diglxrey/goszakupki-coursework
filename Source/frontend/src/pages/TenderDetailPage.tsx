import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../core/store/store';
import { fetchTenderThunk } from '../core/store/reducers/tenders';
import { showNotification } from '../core/store/reducers/app';
import { TendersAPI, BidsAPI } from '../core/api/tenders';
import { extractError } from '../core/api/interceptor';
import { Bid } from '../core/constants/types';
import Loader from '../components/Loader';
import {
  TenderBadge,
  BidBadge,
  formatPrice,
  formatDate,
} from '../components/Badges';

export default function TenderDetailPage() {
  const { id } = useParams();
  const tenderId = Number(id);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { current, isLoading } = useAppSelector((s) => s.tenders);
  const { user } = useAppSelector((s) => s.auth);

  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [bidPrice, setBidPrice] = useState('');
  const [bidComment, setBidComment] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    dispatch(fetchTenderThunk(tenderId));
    TendersAPI.getHistory(tenderId).then(setHistory).catch(() => {});
    TendersAPI.getStats(tenderId).then(setStats).catch(() => {});
  };

  useEffect(() => {
    load();

  }, [tenderId]);

  if (isLoading || !current) return <div className="container"><Loader /></div>;

  const isOwner = user?.id === current.customerId;
  const isSupplier = user?.role === 'supplier';
  const canBid = isSupplier && current.status === 'published';
  const canAward = isOwner && (current.status === 'published' || current.status === 'closed');
  const myBid = current.bids?.find((b) => b.supplierId === user?.id);

  const submitBid = async () => {
    setBusy(true);
    try {
      await BidsAPI.create({
        tenderId,
        price: parseFloat(bidPrice),
        comment: bidComment || undefined,
      });
      dispatch(showNotification({ text: 'Заявка подана', type: 'success' }));
      setBidPrice('');
      setBidComment('');
      load();
    } catch (e) {
      dispatch(showNotification({ text: extractError(e), type: 'error' }));
    } finally {
      setBusy(false);
    }
  };

  const award = async (bid: Bid) => {
    if (!confirm(`Выбрать победителем ${bid.supplier?.organization || bid.supplier?.name} за ${formatPrice(bid.price)}?`)) return;
    setBusy(true);
    try {
      await TendersAPI.award(tenderId, bid.id);
      dispatch(showNotification({ text: 'Победитель выбран, контракт заключён', type: 'success' }));
      load();
    } catch (e) {
      dispatch(showNotification({ text: extractError(e), type: 'error' }));
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    if (!confirm('Отменить тендер? Все заявки будут отклонены.')) return;
    setBusy(true);
    try {
      await TendersAPI.cancel(tenderId);
      dispatch(showNotification({ text: 'Тендер отменён', type: 'success' }));
      load();
    } catch (e) {
      dispatch(showNotification({ text: extractError(e), type: 'error' }));
    } finally {
      setBusy(false);
    }
  };

  const sortedBids = [...(current.bids || [])].sort((a, b) => a.price - b.price);

  return (
    <div className="container">
      <button className="btn btn-outline btn-sm mb-16" onClick={() => navigate('/tenders')}>
        ← К списку тендеров
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, alignItems: 'start' }}>
        {}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {}
          <div className="card">
            <div className="row-between mb-16">
              <TenderBadge status={current.status} />
              <span className="text-sm text-soft">Тендер № {current.id}</span>
            </div>
            <h1 style={{ fontSize: 24, marginBottom: 12 }}>{current.title}</h1>
            <p className="text-soft mb-24" style={{ whiteSpace: 'pre-wrap' }}>
              {current.description || 'Описание не указано'}
            </p>
            <div style={infoGrid}>
              <Info label="Начальная цена" value={formatPrice(current.startPrice)} />
              <Info label="Приём заявок до" value={formatDate(current.deadline)} />
              <Info label="Заказчик" value={current.customer?.organization || current.customer?.name || '—'} />
              <Info label="Опубликован" value={formatDate(current.createdAt)} />
            </div>

            {isOwner && current.status !== 'awarded' && current.status !== 'cancelled' && (
              <div className="row mt-16">
                <button className="btn btn-danger btn-sm" onClick={cancel} disabled={busy}>
                  Отменить тендер
                </button>
              </div>
            )}
          </div>

          {}
          <div className="card">
            <h2 style={{ fontSize: 18, marginBottom: 16 }}>
              Заявки участников ({sortedBids.length})
            </h2>
            {sortedBids.length === 0 ? (
              <p className="text-soft text-sm">Заявок пока нет</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Поставщик</th>
                    <th>Цена</th>
                    <th>Статус</th>
                    {canAward && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {sortedBids.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {b.supplier?.organization || b.supplier?.name || `Поставщик #${b.supplierId}`}
                        </div>
                        {b.comment && <div className="text-sm text-soft">{b.comment}</div>}
                      </td>
                      <td className="price">{formatPrice(b.price)}</td>
                      <td><BidBadge status={b.status} /></td>
                      {canAward && (
                        <td>
                          <button className="btn btn-success btn-sm" onClick={() => award(b)} disabled={busy}>
                            Выбрать
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {}
          {stats && (
            <div className="card">
              <h3 style={{ fontSize: 16, marginBottom: 12 }}>Статистика</h3>
              <div className="row-between mb-8">
                <span className="text-sm text-soft">Всего заявок</span>
                <span style={{ fontWeight: 600 }}>{stats.bids_count ?? 0}</span>
              </div>
              <div className="row-between mb-8">
                <span className="text-sm text-soft">Минимальная цена</span>
                <span className="price text-sm">{formatPrice(stats.min_bid_price)}</span>
              </div>
              {stats.economy_percent !== null && stats.economy_percent !== undefined && (
                <div className="row-between">
                  <span className="text-sm text-soft">Экономия</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>
                    {stats.economy_percent}%
                  </span>
                </div>
              )}
            </div>
          )}

          {}
          {canBid && !myBid && (
            <div className="card">
              <h3 style={{ fontSize: 16, marginBottom: 12 }}>Подать заявку</h3>
              <div className="field">
                <label>Ваша цена, ₽</label>
                <input className="input" type="number" value={bidPrice}
                  onChange={(e) => setBidPrice(e.target.value)} placeholder="0" />
              </div>
              <div className="field">
                <label>Комментарий</label>
                <textarea className="textarea" value={bidComment}
                  onChange={(e) => setBidComment(e.target.value)}
                  placeholder="Условия, сроки поставки…" />
              </div>
              <button className="btn btn-primary btn-block" onClick={submitBid}
                disabled={busy || !bidPrice}>
                Отправить заявку
              </button>
            </div>
          )}

          {isSupplier && myBid && (
            <div className="card">
              <h3 style={{ fontSize: 16, marginBottom: 12 }}>Ваша заявка</h3>
              <div className="row-between mb-8">
                <span className="text-sm text-soft">Цена</span>
                <span className="price">{formatPrice(myBid.price)}</span>
              </div>
              <div className="row-between">
                <span className="text-sm text-soft">Статус</span>
                <BidBadge status={myBid.status} />
              </div>
            </div>
          )}

          {}
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 12 }}>История статусов</h3>
            {history.length === 0 ? (
              <p className="text-sm text-soft">Нет записей</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {history.map((h) => (
                  <div key={h.id} style={{ borderLeft: '2px solid var(--color-line)', paddingLeft: 12 }}>
                    <div className="text-sm" style={{ fontWeight: 600 }}>
                      {h.oldStatus ? `${h.oldStatus} → ${h.newStatus}` : `Создан (${h.newStatus})`}
                    </div>
                    <div className="text-sm text-soft">{formatDate(h.changedAt)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm text-soft mb-8">{label}</div>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </div>
  );
}

const infoGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 16,
};
