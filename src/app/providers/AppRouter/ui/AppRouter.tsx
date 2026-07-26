import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';

import { PageLoader } from 'shared/ui/PageLoader';

import { router } from '../routeConfig/routeConfig';

const AppRouter = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
};

export { AppRouter };
