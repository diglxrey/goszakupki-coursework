import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TendersAPI } from '../../api/tenders';
import { extractError } from '../../api/interceptor';
import { TenderCard, Tender } from '../../constants/types';

interface TendersState {
  list: TenderCard[];
  current: Tender | null;
  isLoading: boolean;
  error: string;
}

const initialState: TendersState = {
  list: [],
  current: null,
  isLoading: false,
  error: '',
};

export const fetchTendersThunk = createAsyncThunk(
  'tenders/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await TendersAPI.getAll();
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const fetchTenderThunk = createAsyncThunk(
  'tenders/fetchOne',
  async (id: number, { rejectWithValue }) => {
    try {
      return await TendersAPI.getOne(id);
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

const tendersSlice = createSlice({
  name: 'tenders',
  initialState,
  reducers: {
    clearCurrent(state) {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTendersThunk.pending, (s) => { s.isLoading = true; s.error = ''; })
      .addCase(fetchTendersThunk.fulfilled, (s, a) => { s.isLoading = false; s.list = a.payload; })
      .addCase(fetchTendersThunk.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; })

      .addCase(fetchTenderThunk.pending, (s) => { s.isLoading = true; s.error = ''; s.current = null; })
      .addCase(fetchTenderThunk.fulfilled, (s, a) => { s.isLoading = false; s.current = a.payload; })
      .addCase(fetchTenderThunk.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
  },
});

export const { clearCurrent } = tendersSlice.actions;
export default tendersSlice.reducer;
