import { Slot } from 'expo-router';

import { AuthProvider } from '@/contexts/AuthContext';

import { CartProvider } from '@/contexts/CartContext';

import { PaperProvider } from 'react-native-paper';

import { StatusBar } from 'expo-status-bar';



export default function RootLayout() {

  return (

    <AuthProvider>

      <CartProvider>

        <PaperProvider>

          <StatusBar style="auto" />

          <Slot />

        </PaperProvider>

      </CartProvider>

    </AuthProvider>

  );

}