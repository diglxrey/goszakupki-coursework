export type UserRole = 'customer' | 'supplier' | 'admin';

export type TenderStatus = 'published' | 'closed' | 'awarded' | 'cancelled';

export type BidStatus = 'submitted' | 'won' | 'rejected';

export type ContractStatus = 'active' | 'completed' | 'terminated';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  organization?: string;
  createdAt?: string;
}

export interface Tender {
  id: number;
  title: string;
  description?: string;
  startPrice: number;
  status: TenderStatus;
  deadline: string;
  customerId: number;
  winnerBidId?: number;
  createdAt?: string;
  customer?: User;
  bids?: Bid[];
}

export interface TenderCard {
  id: number;
  title: string;
  description?: string;
  start_price: string;
  status: TenderStatus;
  deadline: string;
  created_at: string;
  customer_id: number;
  customer_name: string;
  customer_organization: string;
  bids_count: string;
  min_bid_price: string | null;
  winner_bid_id: number | null;
}

export interface Bid {
  id: number;
  tenderId: number;
  supplierId: number;
  price: number;
  comment?: string;
  status: BidStatus;
  createdAt?: string;
  supplier?: User;
  tender?: Tender;
}

export interface Contract {
  id: number;
  tenderId: number;
  bidId: number;
  supplierId: number;
  customerId: number;
  finalPrice: number;
  status: ContractStatus;
  signedAt: string;
  tender?: Tender;
  supplier?: User;
  customer?: User;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const TENDER_STATUS_LABELS: Record<TenderStatus, string> = {
  published: 'Приём заявок',
  closed: 'Приём закрыт',
  awarded: 'Победитель выбран',
  cancelled: 'Отменён',
};

export const BID_STATUS_LABELS: Record<BidStatus, string> = {
  submitted: 'На рассмотрении',
  won: 'Победила',
  rejected: 'Отклонена',
};

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  active: 'Действует',
  completed: 'Исполнен',
  terminated: 'Расторгнут',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  customer: 'Заказчик',
  supplier: 'Поставщик',
  admin: 'Администратор',
};
