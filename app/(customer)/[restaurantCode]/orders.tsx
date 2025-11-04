import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useCollectionQuery } from '@/hooks/useCollection';
import type { Restaurant, Order } from '@/types';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

// --- Constantes de Estilo Comuns ---
const PRIMARY_ORANGE = '#ff8c42';
const LIGHT_BEIGE_BG = '#fdf4eb';
const CARD_BACKGROUND = '#ffffff';
const TEXT_COLOR_DARK = '#444';
const GRAY_BORDER = '#E5E7EB'; 
const PRIMARY_TEXT = '#333'; 
const GRAY_TEXT = '#666';    
const LIGHT_GRAY_BG = '#F3F4F6'; 
const WARNING_YELLOW = '#F59E0B'; 

// Constantes adicionadas para os erros relatados
const CART_BG = '#fdf4eb';
const RED_ALERT = '#EF4444';

const statusEmoji = {
  'new': '🆕',
  'in-progress': '👨‍🍳',
  'ready': '✅',
  'completed': '🎉'
};

const statusText = {
  'new': 'Pedido Recebido',
  'in-progress': 'Em Preparo',
  'ready': 'Pronto',
  'completed': 'Concluído'
};

// Função auxiliar para sombra cross-platform
const getCardShadow = () => {
    if (Platform.OS === 'ios') {
      return { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 };
    } else {
      return { elevation: 3 };
    }
};

export default function OrdersPage() {
  const { restaurantCode } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const { data: restaurants } = useCollectionQuery<Restaurant>(
    'restaurants',
    { field: 'code', operator: '==', value: restaurantCode }
  );
  const restaurant = restaurants?.[0];

  const { data: orders } = useCollectionQuery<Order>(
    'orders',
    [
      { field: 'customerUid', operator: '==', value: user?.uid || '' },
      { field: 'restaurantId', operator: '==', value: restaurant?.id || '' }
    ]
  );

  const sortedOrders = orders?.sort((a, b) => 
    b.timestamp?.toMillis() - a.timestamp?.toMillis()
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Fixo */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 5 }}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Pedidos</Text>
      </View>

      {/* Estado de Pedidos Vazios */}
      {!sortedOrders || sortedOrders.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateIcon}>📋</Text>
          <Text style={styles.emptyStateText}>Nenhum pedido ainda</Text>
        </View>
      ) : (
        /* Lista de Pedidos */
        <ScrollView style={styles.scrollView}>
          {sortedOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={[styles.orderCard, getCardShadow()]}
              onPress={() => router.push({
                pathname: `/(customer)/${restaurantCode}/order-detail`,
                params: { orderId: order.id }
              })}
            >
              {/* Topo: ID, Data e Status */}
              <View style={styles.cardHeaderRow}>
                <View>
                  <Text style={styles.orderIdTitle}>
                    Pedido #{order.id.substring(0, 6)}
                  </Text>
                  <Text style={styles.orderDateText}>
                    {order.timestamp?.toDate().toLocaleString('pt-BR')}
                  </Text>
                </View>
                <View style={[styles.statusBadge, {
                    backgroundColor: order.status === 'ready' || order.status === 'completed' 
                        ? PRIMARY_ORANGE : LIGHT_GRAY_BG
                }]}>
                  <Text style={[styles.statusText, {
                      color: order.status === 'ready' || order.status === 'completed' 
                        ? CARD_BACKGROUND : PRIMARY_TEXT
                  }]}>
                    {statusEmoji[order.status]} {statusText[order.status]}
                  </Text>
                </View>
              </View>

              {/* Itens do Pedido (Resumo) */}
              <View style={styles.itemsSummary}>
                {order.items.slice(0, 2).map((item, idx) => (
                  <Text key={idx} style={styles.itemText}>
                    {item.quantity}x {item.name}
                  </Text>
                ))}
                {order.items.length > 2 && (
                  <Text style={styles.moreItemsText}>
                    +{order.items.length - 2} itens
                  </Text>
                )}
              </View>

              {/* Rodapé: Total e Avaliação */}
              <View style={styles.cardFooter}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalPriceText}>
                    ${order.total.toFixed(2)}
                  </Text>
                </View>
                
                {order.rating && (
                  <View style={styles.ratingRow}>
                    <Text style={styles.starIcon}>⭐</Text>
                    <Text style={styles.ratingText}>
                      Avaliação: {order.rating}/5
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.detailsLink}>
                Toque para ver detalhes →
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: LIGHT_BEIGE_BG,
    },
    
    // --- Header ---
    header: {
        backgroundColor: PRIMARY_ORANGE,
        padding: 16,
        paddingTop: Platform.OS === 'ios' ? 50 : 20, // Ajuste para SafeArea
    },
    backButtonText: {
        color: CARD_BACKGROUND,
        fontSize: 16,
        marginBottom: 8,
    },
    headerTitle: {
        color: CARD_BACKGROUND,
        fontSize: 24,
        fontWeight: 'bold',
    },

    // --- Empty State ---
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: CARD_BACKGROUND,
    },
    emptyStateIcon: {
        fontSize: 60,
        marginBottom: 16,
    },
    emptyStateText: {
        color: GRAY_TEXT,
        fontSize: 18,
    },

    // --- Order List ---
    scrollView: {
        flex: 1,
        padding: 16,
    },
    orderCard: {
        backgroundColor: CARD_BACKGROUND,
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    orderIdTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: PRIMARY_TEXT,
    },
    orderDateText: {
        color: GRAY_TEXT,
        fontSize: 12,
    },
    statusBadge: {
        borderRadius: 50,
        paddingHorizontal: 12,
        paddingVertical: 4,
        alignSelf: 'flex-start', // Garante que o badge não estique
    },
    statusText: {
        fontWeight: '600',
        fontSize: 14,
    },

    // --- Items Summary ---
    itemsSummary: {
        borderTopWidth: 1,
        borderTopColor: GRAY_BORDER,
        paddingTop: 12,
        marginBottom: 12,
    },
    itemText: {
        color: PRIMARY_TEXT,
        marginBottom: 4,
        fontSize: 14,
    },
    moreItemsText: {
        color: GRAY_TEXT,
        fontSize: 12,
    },

    // --- Card Footer ---
    cardFooter: {
        borderTopWidth: 1,
        borderTopColor: GRAY_BORDER,
        paddingTop: 12,
        marginTop: 12,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontWeight: 'bold',
        fontSize: 16,
        color: PRIMARY_TEXT,
    },
    totalPriceText: {
        fontWeight: 'bold',
        fontSize: 16,
        color: PRIMARY_ORANGE,
    },
    ratingRow: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    starIcon: {
        color: WARNING_YELLOW,
        marginRight: 8,
        fontSize: 16,
    },
    ratingText: {
        color: GRAY_TEXT,
        fontSize: 14,
    },
    detailsLink: {
        color: PRIMARY_ORANGE,
        textAlign: 'center',
        marginTop: 12,
        fontWeight: '600',
        fontSize: 14,
    }
});