enum ENotificationTypes {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning',
}

interface INotification {
  id: string;
  message?: string;
  messageKey?: string;
  type: ENotificationTypes;
  title?: string;
  titleKey?: string;
  translationNamespace?: 'translation' | 'errorMessages';
  autoCloseMs?: number;
}

interface INotificationState {
  items: INotification[];
}

type TCreateNotificationPayload = Omit<INotification, 'id'> & {
  id?: string;
};

export type { TCreateNotificationPayload, INotification, INotificationState };

export { ENotificationTypes };
