import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import { BrowserRouter } from 'react-router-dom';

import { DirectionProvider } from '@/components/ui/direction';

import App from './App';
import { AdminSessionProvider, AdminGate } from '@/features/authentication/admin-session';
import '@/styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <DirectionProvider direction="rtl">
        <BrowserRouter>
          <AdminSessionProvider>
            <AdminGate>
              <App />
            </AdminGate>
          </AdminSessionProvider>
        </BrowserRouter>
      </DirectionProvider>
    </MotionConfig>
  </StrictMode>,
);
