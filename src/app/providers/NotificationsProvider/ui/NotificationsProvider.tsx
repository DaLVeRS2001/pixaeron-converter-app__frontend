import block from 'bem-cn';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { removeNotification, selectNotifications } from 'entities/notification';

import { getOrCreateNodeById } from 'shared/lib/dom';
import { useAppDispatch, useAppSelector } from 'shared/lib/store';

import './NotificationsProvider.scss';

const cn = block('notifications-provider');

const NOTIFICATION_ROOT_ID = 'notification-root';

type TNotificationTranslationNamespace = 'translation' | 'errorMessages';
type TTranslateNotificationKey = (
  key: string,
  namespace?: TNotificationTranslationNamespace
) => string;

const NotificationsProvider = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const { t } = useTranslation();
  const { t: tError } = useTranslation('errorMessages');

  const translateNotificationKey: TTranslateNotificationKey = (
    key,
    namespace = 'translation'
  ) => {
    if (namespace === 'errorMessages') {
      return tError(key as never);
    }

    return t(key as never);
  };

  useEffect(() => {
    const timers = notifications
      .filter((notification) => notification.autoCloseMs)
      .map((notification) =>
        window.setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, notification.autoCloseMs)
      );

    return () => {
      timers.forEach(window.clearTimeout);
    };
  }, [dispatch, notifications]);

  if (notifications.length === 0) {
    return null;
  }

  const Content = (
    <div className={cn()}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn('item', {
            type: notification.type,
          })}
          role="status"
        >
          {(notification.titleKey || notification.title) && (
            <div className={cn('title')}>
              {notification.titleKey
                ? translateNotificationKey(
                    notification.titleKey,
                    notification.translationNamespace
                  )
                : notification.title}
            </div>
          )}

          <div className={cn('message')}>
            {notification.messageKey
              ? translateNotificationKey(
                  notification.messageKey,
                  notification.translationNamespace
                )
              : notification.message}
          </div>

          <button
            className={cn('close')}
            type="button"
            aria-label={t('notifications.close')}
            onClick={() => dispatch(removeNotification(notification.id))}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );

  return createPortal(Content, getOrCreateNodeById(NOTIFICATION_ROOT_ID));
};

export { NotificationsProvider };
