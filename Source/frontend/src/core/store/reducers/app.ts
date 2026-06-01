import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  notification: string;
  notificationType: 'success' | 'error' | '';
}

const initialState: AppState = {
  notification: '',
  notificationType: '',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    showNotification(
      state,
      action: PayloadAction<{ text: string; type: 'success' | 'error' }>,
    ) {
      state.notification = action.payload.text;
      state.notificationType = action.payload.type;
    },
    clearNotification(state) {
      state.notification = '';
      state.notificationType = '';
    },
  },
});

export const { showNotification, clearNotification } = appSlice.actions;
export default appSlice.reducer;
