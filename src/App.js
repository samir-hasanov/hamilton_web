import React, { useEffect } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import AppRoutes from './routes/AppRoutes';
import { setupTokenCleanup } from './utils/tokenUtils';

function App() {
  useEffect(() => {
    // Setup token cleanup when app starts
    setupTokenCleanup();
  }, []);

  return (
    <ChakraProvider>
      <AppRoutes />
    </ChakraProvider>
  );
}

export default App;
