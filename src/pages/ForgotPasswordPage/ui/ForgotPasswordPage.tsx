import { RequestPasswordResetForm } from 'features/auth';

import { AuthShell } from 'widgets/AuthShell';

const ForgotPasswordPage = () => (
  <AuthShell variant="centered">
    <RequestPasswordResetForm />
  </AuthShell>
);

export { ForgotPasswordPage };
