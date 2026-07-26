import { VerifyEmailPanel } from 'features/auth';

import { AuthShell } from 'widgets/AuthShell';

const EmailConfirmationPage = () => (
  <AuthShell variant="centered">
    <VerifyEmailPanel />
  </AuthShell>
);

export { EmailConfirmationPage };
