import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { Feather } from '@expo/vector-icons';
import { useDoc } from '@/hooks/useDoc';
import { useCollectionQuery } from '@/hooks/useCollection';
import type { Restaurant, Order } from '@/types';
import ReviewsList from '@/components/ReviewsList';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf4eb',
  },
  header: {
    backgroundColor: '#ff8c42',
    padding: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 8,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default function StaffReviews() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: restaurant } = useDoc<Restaurant>('restaurants', user?.uid || '');
  const { data: orders } = useCollectionQuery<Order>(
    'orders',
    { field: 'restaurantId', operator: '==', value: restaurant?.id || '' }
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fdf4eb',
    },
    header: {
      backgroundColor: '#ff8c42',
      padding: 16,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    backButtonText: {
      color: '#ffffff',
      fontSize: 16,
      marginLeft: 8,
    },
    headerTitle: {
      color: '#ffffff',
      fontSize: 24,
      fontWeight: 'bold',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#ffffff" />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Avaliações</Text>
      </View>

      <ReviewsList orders={orders || []} />
    </SafeAreaView>
  );
}
