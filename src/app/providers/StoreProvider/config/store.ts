import { configureStore } from '@reduxjs/toolkit';

import { notificationReducer } from 'entities/notification';

const store = configureStore({
  reducer: {
    notification: notificationReducer,
  },
});

export { store };
