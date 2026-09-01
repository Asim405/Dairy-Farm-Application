import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const AuthConsumer = () => {
  const { state, isLoading } = React.useContext(AuthContext);
  return <RootNavigator isLoading={isLoading} state={state} />;
};
