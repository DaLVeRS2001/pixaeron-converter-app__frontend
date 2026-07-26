export {
  addNotification,
  clearNotifications,
  notificationReducer,
  removeNotification,
} from './model/slice/notificationSlice';

export { selectNotifications } from './model/selectors';

export type {
  TCreateNotificationPayload,
  INotification,
  INotificationState,
} from './model/types';
export { ENotificationTypes } from './model/types';
