import block from 'bem-cn';
import { Outlet } from 'react-router-dom';

import { Header } from 'widgets/Header';

import './Layout.scss';

const cn = block('main-layout');

const Layout = () => {
  return (
    <div className={cn()}>
      <Header />
      <main className={cn('container')}>
        <Outlet />
      </main>
    </div>
  );
};

export { Layout };
