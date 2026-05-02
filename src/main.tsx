import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { WSProvider } from './WSContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WSProvider>
      <App />
    </WSProvider>
  </StrictMode>,
);
