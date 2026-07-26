import block from 'bem-cn';

import { Loader } from './Loader';

import './PageLoader.scss';

const cn = block('page-loader');

interface PageLoaderProps {
  isLoading?: boolean;
}

const PageLoader = ({ isLoading = true }: PageLoaderProps) => {
  if (!isLoading) return null;
  return (
    <div className={cn()}>
      <Loader />
    </div>
  );
};

export { PageLoader };
