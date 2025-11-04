import { Stack } from 'expo-router';



export default function CustomerLayout() {

  return (

    <Stack screenOptions={{ headerShown: false }}>

      <Stack.Screen name="[restaurantCode]/index" />

      <Stack.Screen name="[restaurantCode]/cart" />

      <Stack.Screen name="[restaurantCode]/orders" />

    </Stack>

  );

}