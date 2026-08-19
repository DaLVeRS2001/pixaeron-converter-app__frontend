import block from 'bem-cn';
import type { ReactNode } from 'react';

import './PageMessage.scss';

type PageMessageProps = {
  code?: string;
  title: string;
  description?: string;
  details?: string;
  alert?: boolean;
  actions: ReactNode;
};

const cn = block('page-message');

const PageMessage = ({
  code,
  title,
  description,
  details,
  alert,
  actions,
}: PageMessageProps) => (
  <main className={cn()}>
    <div className={cn('card')} role={alert ? 'alert' : undefined}>
      {code && <p className={cn('code')}>{code}</p>}
      <h1 className={cn('title')}>{title}</h1>
      {description && <p className={cn('description')}>{description}</p>}
      {details && <pre className={cn('details')}>{details}</pre>}
      <div className={cn('actions')}>{actions}</div>
    </div>
  </main>
);

export { PageMessage };
