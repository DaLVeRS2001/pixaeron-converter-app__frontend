import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import block from 'bem-cn';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import {
  ConversionEntitlementDocument,
  formatBytes,
  storagePercent,
} from 'entities/conversion';

import { LogoutDocument } from 'shared/api';
import CompressIcon from 'shared/assets/icons/compress.svg';
import FolderIcon from 'shared/assets/icons/folder.svg';
import GridIcon from 'shared/assets/icons/grid.svg';
import SignOutIcon from 'shared/assets/icons/sign-out.svg';
import SwapIcon from 'shared/assets/icons/swap.svg';
import { SVG } from 'shared/ui/SVG';

import './AppSidebar.scss';

const cn = block('app-sidebar');

const AppSidebar = () => {
  const { t } = useTranslation();
  const apolloClient = useApolloClient();
  const [logout, { loading }] = useMutation(LogoutDocument);
  const entitlement = useQuery(ConversionEntitlementDocument).data?.conversionEntitlement;
  const storage =
    entitlement?.storageBytes != null && entitlement.storageBytesUsed != null
      ? {
          used: entitlement.storageBytesUsed,
          limit: entitlement.storageBytes,
          percent: storagePercent(entitlement.storageBytesUsed, entitlement.storageBytes),
        }
      : null;

  const onLogout = async () => {
    try {
      await logout();
    } finally {
      try {
        await apolloClient.cache.reset({ discardWatches: false });
      } finally {
        window.location.replace('/sign-in');
      }
    }
  };

  return (
    <aside className={cn()}>
      <nav className={cn('nav')} aria-label={t('app.sidebar.label')}>
        <NavLink to="/app" end className={cn('link').toString()}>
          <SVG Svg={GridIcon} className={cn('icon').toString()} />
          <span>{t('app.sidebar.dashboard')}</span>
        </NavLink>
        <NavLink to="/app/compress" className={cn('link').toString()}>
          <SVG Svg={CompressIcon} className={cn('icon').toString()} />
          <span>{t('app.sidebar.compress')}</span>
        </NavLink>
        <span className={cn('link', { disabled: true })} aria-disabled="true">
          <SVG Svg={SwapIcon} className={cn('icon').toString()} />
          <span>{t('app.sidebar.convert')}</span>
          <em>{t('app.sidebar.soon')}</em>
        </span>
        <NavLink to="/app/files" className={cn('link').toString()}>
          <SVG Svg={FolderIcon} className={cn('icon').toString()} />
          <span>{t('app.sidebar.files')}</span>
        </NavLink>
      </nav>

      {storage && (
        <div className={cn('storage')}>
          <p>{t('app.sidebar.storage', { percent: storage.percent })}</p>
          <span className={cn('storage-bar')}>
            <span className={cn('storage-fill')} style={{ width: `${storage.percent}%` }} />
          </span>
          <p className={cn('storage-detail')}>
            {t('app.sidebar.storageDetail', {
              used: formatBytes(storage.used),
              limit: formatBytes(storage.limit),
            })}
          </p>
        </div>
      )}

      <button type="button" className={cn('sign-out')} onClick={onLogout} disabled={loading}>
        <SVG Svg={SignOutIcon} className={cn('icon').toString()} />
        {loading ? t('app.sidebar.signingOut') : t('app.sidebar.signOut')}
      </button>
    </aside>
  );
};

export { AppSidebar };
