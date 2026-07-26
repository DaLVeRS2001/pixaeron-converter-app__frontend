import block from 'bem-cn';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { LanguageSwitcher } from 'features/changeLanguage';

import { BrandLogo } from 'shared/ui/BrandLogo';
import { PublicFooter } from 'shared/ui/PublicFooter';

import './LegalPageLayout.scss';

type LegalPageLayoutProps = { title: string; updated: string; children: ReactNode };
const cn = block('legal-page');

const LegalPageLayout = ({ title, updated, children }: LegalPageLayoutProps) => (
  <div className={cn()}>
    <header className={cn('header')}>
      <Link to="/" aria-label="Pixaeron home">
        <BrandLogo />
      </Link>
      <LanguageSwitcher />
    </header>
    <main className={cn('content')}>
      <h1>{title}</h1>
      <p className={cn('updated')}>Last updated: {updated}</p>
      {children}
    </main>
    <PublicFooter />
  </div>
);

export { LegalPageLayout };
