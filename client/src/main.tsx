import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import { useSettingsStore } from './store/useSettingsStore';
import { ReloadPrompt } from './components/ReloadPrompt';

const queryClient = new QueryClient();

// Settings initializer component
const SettingsInitializer = ({ children }: { children: React.ReactNode }) => {
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);
  
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);
  
  return <>{children}</>;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SettingsInitializer>
          <App />
          <ReloadPrompt />
        </SettingsInitializer>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
