import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './screens/LoginScreen';
import MainScreen from './screens/MainScreen';

export default function App() {
  const [isAuth, setIsAuth] = useState(false);
  return (
    <>
      <StatusBar style="light" />
      {isAuth
        ? <MainScreen onLogout={() => setIsAuth(false)} />
        : <LoginScreen onSuccess={() => setIsAuth(true)} />
      }
    </>
  );
}
