declare module '*.svg' {
  import * as React from 'react';
  const SVG: React.FC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
}

declare module '*.webp';
declare module '*.scss';

declare const __IS_DEV__: boolean;
declare const __GRAPHQL_API_URL__: string;
declare const __TURNSTILE_SITE_KEY__: string;
declare const __GOOGLE_CLIENT_ID__: string;

interface Window {
  turnstile?: {
    render: (
      element: HTMLElement,
      options: {
        sitekey: string;
        action: string;
        callback: (token: string) => void;
        'expired-callback': () => void;
        'error-callback': () => void;
        theme?: 'light' | 'dark' | 'auto';
      }
    ) => string;
    reset: (widgetId?: string) => void;
    remove: (widgetId: string) => void;
  };
  google?: {
    accounts: {
      id: {
        initialize: (options: {
          client_id: string;
          callback: (response: { credential: string }) => void;
        }) => void;
        renderButton: (
          element: HTMLElement,
          options: {
            theme: 'outline';
            size: 'large';
            width: number;
            text: 'signin_with' | 'signup_with';
          }
        ) => void;
      };
    };
  };
}
