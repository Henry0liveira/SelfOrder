import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useDoc } from '@/hooks/useDoc';
import { useCollectionQuery } from '@/hooks/useCollection';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/services/firebase/config';
import type { Restaurant, Order, OrderStatus } from '@/types';
import { Feather } from '@expo/vector-icons';

// --- Style Constants ---
const PRIMARY_ORANGE = '#ff8c42';
const LIGHT_BEIGE_BG = '#fdf4eb';
const CARD_BACKGROUND = '#ffffff';
const TEXT_DARK = '#333333';
const TEXT_GRAY = '#666666';



export default function StaffOrders() {

  const router = useRouter();

  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<OrderStatus>('new');



  const { data: restaurant } = useDoc<Restaurant>('restaurants', user?.uid || '');

  const { data: orders } = useCollectionQuery<Order>(

    'orders',

    { field: 'restaurantId', operator: '==', value: restaurant?.id || '' }

  );



  const filteredOrders = orders

    ?.filter(o => o.status === activeTab)

    .sort((a, b) => b.timestamp?.toMillis() - a.timestamp?.toMillis());



  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {

    const orderRef = doc(firestore, 'orders', orderId);

    await updateDoc(orderRef, { status: newStatus });

  };



  const tabs: { status: OrderStatus; label: string; icon: string; count: number }[] = [
    { status: 'new', label: 'Novo', icon: '🆕', count: orders?.filter(o => o.status === 'new').length || 0 },
    { status: 'in-progress', label: 'Em Progresso', icon: '👨‍🍳', count: orders?.filter(o => o.status === 'in-progress').length || 0 },
    { status: 'ready', label: 'Pronto', icon: '✅', count: orders?.filter(o => o.status === 'ready').length || 0 },
    { status: 'completed', label: 'Concluído', icon: '🎉', count: orders?.filter(o => o.status === 'completed').length || 0 }
  ];



  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={CARD_BACKGROUND} />
            <Text style={styles.backButtonText}>Voltar ao Painel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Pedidos Recebidos</Text>
        <Text style={styles.headerSubtitle}>Gerencie e acompanhe os pedidos dos clientes em tempo real.</Text>
      </View>

      <View style={styles.tabContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.status}
            style={[
              styles.tabButton,
              activeTab === tab.status && styles.tabButtonActive
            ]}
            onPress={() => setActiveTab(tab.status)}
          >
            <View style={styles.tabContent}>
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[
                styles.tabLabel,
                activeTab === tab.status && styles.tabLabelActive
              ]}>
                {tab.label} ({tab.count})
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.orderList} contentContainerStyle={styles.orderListContent}>
        {!filteredOrders || filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>�</Text>
            <Text style={styles.emptyStateText}>Nenhum pedido na categoria {activeTab} agora.</Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>Pedido #{order.id.substring(0, 6)}</Text>
                  <Text style={styles.orderTime}>
                    {order.timestamp?.toDate().toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                  {order.customer && (
                    <View style={styles.customerInfo}>
                      <Feather name="user" size={14} color={TEXT_GRAY} />
                      <Text style={styles.customerName}>{order.customer.name}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
              </View>

              <View style={styles.orderItems}>
                {order.items.map((item, idx) => (
                  <Text key={idx} style={styles.orderItem}>
                    {item.quantity}x {item.name}
                  </Text>
                ))}
              </View>

              {order.rating && (
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingStars}>{'⭐'.repeat(order.rating)}</Text>
                  {order.review && (
                    <Text style={styles.reviewText}>"{order.review}"</Text>
                  )}
                </View>
              )}

              {activeTab !== 'completed' && (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: order.status === 'new' ? '#F59E0B' : 
                      order.status === 'in-progress' ? '#10B981' : PRIMARY_ORANGE }
                  ]}
                  onPress={() => updateStatus(order.id, 
                    order.status === 'new' ? 'in-progress' : 
                    order.status === 'in-progress' ? 'ready' : 'completed'
                  )}
                >
                  <Text style={styles.actionButtonText}>
                    {order.status === 'new' ? '👨‍🍳 Iniciar Preparo' :
                     order.status === 'in-progress' ? '✅ Marcar como Pronto' :
                     '🎉 Concluir Pedido'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BEIGE_BG,
  },
  header: {
    backgroundColor: PRIMARY_ORANGE,
    padding: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: CARD_BACKGROUND,
    fontSize: 16,
    marginLeft: 8,
  },
  logoutText: {
    color: CARD_BACKGROUND,
    fontSize: 16,
  },
  headerTitle: {
    color: CARD_BACKGROUND,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: CARD_BACKGROUND,
    fontSize: 14,
    opacity: 0.9,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: CARD_BACKGROUND,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: PRIMARY_ORANGE,
  },
  tabContent: {
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: TEXT_GRAY,
  },
  tabLabelActive: {
    color: PRIMARY_ORANGE,
    fontWeight: 'bold',
  },
  orderList: {
    flex: 1,
  },
  orderListContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: TEXT_GRAY,
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_DARK,
  },
  orderTime: {
    fontSize: 14,
    color: TEXT_GRAY,
    marginTop: 4,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  customerName: {
    fontSize: 14,
    color: TEXT_GRAY,
    marginLeft: 6,
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: PRIMARY_ORANGE,
  },
  orderItems: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  orderItem: {
    fontSize: 14,
    color: TEXT_DARK,
    marginBottom: 4,
  },
  ratingContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 12,
  },
  ratingStars: {
    fontSize: 16,
    marginBottom: 4,
  },
  reviewText: {
    fontSize: 14,
    color: TEXT_GRAY,
    fontStyle: 'italic',
  },
  actionButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: CARD_BACKGROUND,
    fontSize: 16,
    fontWeight: 'bold',
  },
});