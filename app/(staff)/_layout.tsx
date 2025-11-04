import { Stack } from 'expo-router';



export default function StaffLayout() {

  return (

    <Stack screenOptions={{ headerShown: false }}>

      <Stack.Screen name="dashboard" />

      <Stack.Screen name="orders" />

      <Stack.Screen name="menu" />

    </Stack>

  );

}