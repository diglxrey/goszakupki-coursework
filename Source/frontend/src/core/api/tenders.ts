import http from './interceptor';
import { URLS } from '../constants/urls';
import { Tender, TenderCard, Bid, Contract } from '../constants/types';

export const TendersAPI = {
  async getAll(): Promise<TenderCard[]> {
    const res = await http.get(URLS.tenders.all);
    return res.data;
  },

  async getMy(): Promise<Tender[]> {
    const res = await http.get(URLS.tenders.my);
    return res.data;
  },

  async getOne(id: number): Promise<Tender> {
    const res = await http.get(URLS.tenders.byId(id));
    return res.data;
  },

  async getHistory(id: number): Promise<any[]> {
    const res = await http.get(URLS.tenders.history(id));
    return res.data;
  },

  async getStats(id: number): Promise<any> {
    const res = await http.get(URLS.tenders.stats(id));
    return res.data;
  },

  async create(data: {
    title: string;
    description?: string;
    startPrice: number;
    deadline: string;
  }): Promise<Tender> {
    const res = await http.post(URLS.tenders.all, data);
    return res.data;
  },

  async update(id: number, data: any): Promise<Tender> {
    const res = await http.put(URLS.tenders.byId(id), data);
    return res.data;
  },

  async award(id: number, bidId: number): Promise<{ message: string }> {
    const res = await http.patch(URLS.tenders.award(id), { bidId });
    return res.data;
  },

  async cancel(id: number): Promise<{ message: string }> {
    const res = await http.patch(URLS.tenders.cancel(id), {});
    return res.data;
  },

  async remove(id: number): Promise<{ message: string }> {
    const res = await http.delete(URLS.tenders.byId(id));
    return res.data;
  },
};

export const BidsAPI = {
  async create(data: {
    tenderId: number;
    price: number;
    comment?: string;
  }): Promise<Bid> {
    const res = await http.post(URLS.bids.base, data);
    return res.data;
  },

  async getMy(): Promise<Bid[]> {
    const res = await http.get(URLS.bids.my);
    return res.data;
  },

  async getByTender(tenderId: number): Promise<Bid[]> {
    const res = await http.get(URLS.bids.byTender(tenderId));
    return res.data;
  },

  async update(id: number, data: { price?: number; comment?: string }): Promise<Bid> {
    const res = await http.put(URLS.bids.byId(id), data);
    return res.data;
  },

  async remove(id: number): Promise<{ message: string }> {
    const res = await http.delete(URLS.bids.byId(id));
    return res.data;
  },
};

export const ContractsAPI = {
  async getAll(): Promise<any[]> {
    const res = await http.get(URLS.contracts.all);
    return res.data;
  },

  async getRating(): Promise<any[]> {
    const res = await http.get(URLS.contracts.rating);
    return res.data;
  },

  async getMy(): Promise<Contract[]> {
    const res = await http.get(URLS.contracts.my);
    return res.data;
  },

  async getOne(id: number): Promise<Contract> {
    const res = await http.get(URLS.contracts.byId(id));
    return res.data;
  },

  async updateStatus(id: number, status: string): Promise<Contract> {
    const res = await http.patch(URLS.contracts.status(id), { status });
    return res.data;
  },
};
