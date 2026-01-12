import React from 'react';
import { AppContextProvider } from './src/context/AppContext';
import { AppRoutes } from './src/routes';

const App: React.FC = () => {
  return (
    <AppContextProvider>
      <div className="w-full h-full min-h-screen bg-gray-100 dark:bg-black flex justify-center">
        <AppRoutes />
      </div>
    </AppContextProvider>
  );
};

export default App;
