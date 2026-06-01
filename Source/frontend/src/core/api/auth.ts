import http from './interceptor';
import { URLS } from '../constants/urls';
import { AuthResponse, User } from '../constants/types';

export const AuthAPI = {
  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    organization?: string;
  }): Promise<AuthResponse> {
    const res = await http.post(URLS.auth.register, data);
    return res.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await http.post(URLS.auth.login, { email, password });
    return res.data;
  },

  async check(): Promise<User> {
    const res = await http.get(URLS.auth.check);
    return res.data;
  },
};

export const UsersAPI = {
  async getAll(): Promise<User[]> {
    const res = await http.get(URLS.users.all);
    return res.data;
  },

  async getById(id: number): Promise<User> {
    const res = await http.get(URLS.users.byId(id));
    return res.data;
  },

  async create(data: {
    name: string;
    email: string;
    password: string;
    role: string;
    organization?: string;
  }): Promise<User> {
    const res = await http.post(URLS.users.all, data);
    return res.data;
  },

  async remove(id: number): Promise<{ message: string }> {
    const res = await http.delete(URLS.users.byId(id));
    return res.data;
  },
};
