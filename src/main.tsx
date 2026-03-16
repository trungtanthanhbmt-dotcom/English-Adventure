import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

// Fix for "Cannot set property fetch of #<Window> which has only a getter"
// This can happen in some sandboxed environments when libraries try to polyfill fetch.
if (typeof window !== 'undefined') {
  try {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'fetch');
    if (descriptor && !descriptor.writable && descriptor.configurable) {
      Object.defineProperty(window, 'fetch', {
        value: window.fetch,
        writable: true,
        configurable: true,
        enumerable: true
      });
    }
  } catch (e) {
    console.warn('Could not patch window.fetch:', e);
  }
}

import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
