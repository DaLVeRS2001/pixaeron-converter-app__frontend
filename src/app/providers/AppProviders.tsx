import type { PropsWithChildren } from 'react';
import { I18nextProvider } from 'react-i18next';

import { ApolloProvider } from 'app/providers/ApolloProvider';

import { CurrentUserProvider } from 'entities/user';

import { i18n } from 'shared/config/i18n';

const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <I18nextProvider i18n={i18n}>
      <ApolloProvider>
        <CurrentUserProvider>{children}</CurrentUserProvider>
      </ApolloProvider>
    </I18nextProvider>
  );
};

export { AppProviders };
