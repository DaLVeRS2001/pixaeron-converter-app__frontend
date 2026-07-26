import { createRoot } from 'react-dom/client';

import { App } from 'app/App';
import { AppProviders } from 'app/providers/AppProviders';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element #root not found');
}

const root = createRoot(container);

root.render(
  <AppProviders>
    <App />
  </AppProviders>
);
