export const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const URLS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    check: '/auth/check',
  },
  users: {
    all: '/users',
    byId: (id: number) => `/users/${id}`,
  },
  tenders: {
    all: '/tenders',
    my: '/tenders/my',
    byId: (id: number) => `/tenders/${id}`,
    history: (id: number) => `/tenders/${id}/history`,
    stats: (id: number) => `/tenders/${id}/stats`,
    award: (id: number) => `/tenders/${id}/award`,
    cancel: (id: number) => `/tenders/${id}/cancel`,
  },
  bids: {
    base: '/bids',
    my: '/bids/my',
    byTender: (tenderId: number) => `/bids/tender/${tenderId}`,
    byId: (id: number) => `/bids/${id}`,
  },
  contracts: {
    all: '/contracts',
    rating: '/contracts/rating',
    my: '/contracts/my',
    byId: (id: number) => `/contracts/${id}`,
    status: (id: number) => `/contracts/${id}/status`,
  },
};
