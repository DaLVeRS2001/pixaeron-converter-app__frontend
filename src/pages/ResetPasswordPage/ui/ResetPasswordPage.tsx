import { ResetPasswordForm } from 'features/auth';

import { AuthShell } from 'widgets/AuthShell';

const ResetPasswordPage = () => (
  <AuthShell variant="centered">
    <ResetPasswordForm />
  </AuthShell>
);

export { ResetPasswordPage };
