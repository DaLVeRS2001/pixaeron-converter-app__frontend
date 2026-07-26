import { SignUpForm } from 'features/auth';

import { AuthShell } from 'widgets/AuthShell';

const SignUpPage = () => (
  <AuthShell variant="signup">
    <SignUpForm />
  </AuthShell>
);

export { SignUpPage };
