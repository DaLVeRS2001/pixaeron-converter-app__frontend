import 'i18next';

import { defaultNS } from './resources';
import type { TDefaultLanguageResources } from './resources';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    returnNull: false;
    resources: TDefaultLanguageResources;
  }
}
