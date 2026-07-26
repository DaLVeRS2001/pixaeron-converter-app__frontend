import { SignInForm } from 'features/auth';

import { AuthShell } from 'widgets/AuthShell';

const SignInPage = () => (
  <AuthShell variant="signin">
    <SignInForm />
  </AuthShell>
);

export { SignInPage };
