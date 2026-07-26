import { LegalPageLayout } from 'widgets/LegalPageLayout';

const PrivacyPage = () => (
  <LegalPageLayout title="Privacy Policy" updated="July 26, 2026">
    <p>
      This policy explains how Pixaeron handles personal data when you create an account, sign
      in, secure your session, or use account recovery. The image-processing product is still
      under development; this policy must be updated before additional data flows are launched.
    </p>
    <h2>Data we collect</h2>
    <ul>
      <li>
        Account data: email address, username, password hash, email-verification state, and
        linked identity-provider identifiers.
      </li>
      <li>
        Google Sign-In data: Google account identifier (<code>sub</code>), primary email,
        email-verification signal, and display name. The Google ID token is sent to our backend
        for verification and is not stored as account data.
      </li>
      <li>
        Security data: session identifiers, a User-Agent value truncated to 512 characters,
        hashed IP-derived identifiers, timestamps, and security/audit events. Passwords, reset
        tokens, verification tokens, CAPTCHA tokens, and Google ID tokens are not written to
        audit logs.
      </li>
      <li>
        Transactional-email acceptance data: recipient account, Amazon SES provider message
        identifier, accepted/failed submission outcome, and timestamps. Pixaeron does not yet
        process delivery, bounce, complaint, or suppression events; those controls must be
        documented here before they are introduced.
      </li>
    </ul>
    <h2>Why we use data</h2>
    <p>
      We use this data to provide accounts, authenticate users, protect the service from abuse,
      maintain sessions, deliver verification and password-reset messages, investigate security
      events, and meet operational obligations.
    </p>
    <h2>Service providers</h2>
    <p>
      Cloudflare provides edge security and Turnstile CAPTCHA; Google provides Google Sign-In;
      Amazon Web Services provides application infrastructure and transactional email. Each
      provider processes limited data required for its role under its own terms and privacy
      commitments.
    </p>
    <h2>Cookies and local storage</h2>
    <p>
      Authentication uses secure HTTP-only cookies. Language preference and the email pending
      verification may be stored locally in your browser. We do not store passwords or identity
      tokens in browser storage.
    </p>
    <h2>Retention and choices</h2>
    <p>
      Security and account records are retained only for operational, fraud-prevention, and
      legal needs. Final retention periods and deletion procedures must be approved before
      production launch. You may request access, correction, or deletion by contacting{' '}
      <a href="mailto:support@pixaeron.com">support@pixaeron.com</a>.
    </p>
    <h2>Children and international use</h2>
    <p>
      Pixaeron is not intended for children who cannot legally consent to data processing in
      their jurisdiction. International transfer and regional privacy terms will be finalized
      during legal review before commercial launch.
    </p>
    <h2>Changes</h2>
    <p>
      We may update this policy when the product or its data flows change. The date above
      identifies the current version.
    </p>
  </LegalPageLayout>
);

export { PrivacyPage };
