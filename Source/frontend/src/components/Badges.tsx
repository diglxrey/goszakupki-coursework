import {
  TenderStatus,
  BidStatus,
  ContractStatus,
  TENDER_STATUS_LABELS,
  BID_STATUS_LABELS,
  CONTRACT_STATUS_LABELS,
} from '../core/constants/types';

export function formatPrice(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toLocaleString('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  });
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TenderBadge({ status }: { status: TenderStatus }) {
  return <span className={`badge badge-${status}`}>{TENDER_STATUS_LABELS[status]}</span>;
}

export function BidBadge({ status }: { status: BidStatus }) {
  return <span className={`badge badge-${status}`}>{BID_STATUS_LABELS[status]}</span>;
}

export function ContractBadge({ status }: { status: ContractStatus }) {
  return <span className={`badge badge-${status}`}>{CONTRACT_STATUS_LABELS[status]}</span>;
}
