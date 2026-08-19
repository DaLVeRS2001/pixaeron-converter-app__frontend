import block from 'bem-cn';
import { Outlet } from 'react-router-dom';

import { AppSidebar } from 'widgets/AppSidebar';
import { Header } from 'widgets/Header';

import './Layout.scss';

const cn = block('main-layout');

const Layout = () => {
  return (
    <div className={cn()}>
      <AppSidebar />
      <div className={cn('content')}>
        <Header />
        <main className={cn('container')}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export { Layout };
