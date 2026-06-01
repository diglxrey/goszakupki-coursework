import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthAPI } from '../../api/auth';
import { extractError } from '../../api/interceptor';
import { User } from '../../constants/types';

interface AuthState {
  user: User | null;
  isAuth: boolean;
  isLoading: boolean;
  error: string;
}

const storedUser = localStorage.getItem('user');
const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuth: !!localStorage.getItem('token'),
  isLoading: false,
  error: '',
};

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (
    data: { name: string; email: string; password: string; role?: string; organization?: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await AuthAPI.register(data);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      return res.user;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await AuthAPI.login(data.email, data.password);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      return res.user;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const checkAuthThunk = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const user = await AuthAPI.check();
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.isAuth = false;
      state.error = '';
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError(state) {
      state.error = '';
    },
  },
  extraReducers: (builder) => {
    const onAuthSuccess = (state: AuthState, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuth = true;
      state.isLoading = false;
      state.error = '';
    };

    builder
      .addCase(registerThunk.pending, (s) => { s.isLoading = true; s.error = ''; })
      .addCase(registerThunk.fulfilled, onAuthSuccess)
      .addCase(registerThunk.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })

      .addCase(loginThunk.pending, (s) => { s.isLoading = true; s.error = ''; })
      .addCase(loginThunk.fulfilled, onAuthSuccess)
      .addCase(loginThunk.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })

      .addCase(checkAuthThunk.fulfilled, onAuthSuccess)
      .addCase(checkAuthThunk.rejected, (s) => { s.user = null; s.isAuth = false; });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
