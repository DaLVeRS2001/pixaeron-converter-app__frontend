import block from 'bem-cn';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import './AuthForm.scss';

const cn = block('auth-form');

type LegalNoticeProps = {
  id?: string;
  lead: string;
};

const LegalNotice = ({ id, lead }: LegalNoticeProps) => {
  const { t } = useTranslation('auth');

  return (
    <p id={id} className={cn('legal')}>
      {lead}{' '}
      <Link to="/terms" target="_blank">
        {t('legal.terms')}
      </Link>{' '}
      {t('legal.and')}{' '}
      <Link to="/privacy" target="_blank">
        {t('legal.privacy')}
      </Link>
    </p>
  );
};

export { LegalNotice };
