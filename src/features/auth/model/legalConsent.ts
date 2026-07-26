const LEGAL_CONSENT_ACTION = 'accept_legal_terms';
const LEGAL_CONSENT_NOTICE = 'google_account_creation_requires_consent';

const CURRENT_LEGAL_CONSENT = {
  legalConsentAccepted: true,
  legalConsentVersion: '2026-07-26',
} as const;

export { CURRENT_LEGAL_CONSENT, LEGAL_CONSENT_ACTION, LEGAL_CONSENT_NOTICE };
