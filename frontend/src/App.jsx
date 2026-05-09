import React from 'react';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e2535',
            color: '#e2e8f0',
            border: '1px solid #2d3748',
            borderRadius: '10px',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#48bb78', secondary: '#1e2535' } },
          error:   { iconTheme: { primary: '#fc8181', secondary: '#1e2535' } },
        }}
      />
      <Dashboard />
    </>
  );
}

export default App;
