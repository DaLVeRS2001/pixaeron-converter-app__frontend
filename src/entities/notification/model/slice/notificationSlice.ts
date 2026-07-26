import { type PayloadAction, createSlice, nanoid } from '@reduxjs/toolkit';

import { initialNotificationState } from '../initial';
import type { TCreateNotificationPayload } from '../types';

const notificationSlice = createSlice({
  name: 'notification',
  initialState: initialNotificationState,
  reducers: {
    addNotification: (state, action: PayloadAction<TCreateNotificationPayload>) => {
      state.items.push({
        ...action.payload,
        id: action.payload.id || nanoid(),
      });
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    clearNotifications: (state) => {
      state.items = [];
    },
  },
});

const { addNotification, clearNotifications, removeNotification } = notificationSlice.actions;
const notificationReducer = notificationSlice.reducer;

export { addNotification, clearNotifications, notificationReducer, removeNotification };
