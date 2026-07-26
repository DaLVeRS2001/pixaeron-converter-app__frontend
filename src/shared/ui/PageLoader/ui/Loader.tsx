import block from 'bem-cn';

import './Loader.scss';

const cn = block('loader');

const Loader = () => {
  return <span className={cn()} />;
};

export { Loader };
