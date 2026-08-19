import block from 'bem-cn';
import type { ReactNode } from 'react';

import './LegalPageLayout.scss';

type LegalPageLayoutProps = { title: string; updated: string; children: ReactNode };
const cn = block('legal-page');

const LegalPageLayout = ({ title, updated, children }: LegalPageLayoutProps) => (
  <div className={cn()}>
    <main className={cn('content')}>
      <h1>{title}</h1>
      <p className={cn('updated')}>Last updated: {updated}</p>
      {children}
    </main>
  </div>
);

export { LegalPageLayout };
