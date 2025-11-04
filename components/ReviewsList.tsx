import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import type { Order } from '@/types';

type ReviewsListProps = {
  orders: Order[];
};

const StarDisplay = ({ rating }: { rating: number }) => {
  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <Text
          key={star}
          className={`text-lg ${star <= rating ? 'opacity-100' : 'opacity-30'}`}
        >
          ⭐
        </Text>
      ))}
    </View>
  );
};

export default function ReviewsList({ orders }: ReviewsListProps) {
  const reviewedOrders = orders.filter(
    (order) => order.rating && order.rating > 0
  );

  if (reviewedOrders.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-6xl mb-4">💬</Text>
        <Text className="text-gray-600 text-lg text-center">
          Nenhuma avaliação ainda
        </Text>
      </View>
    );
  }

  // Calcular média
  const averageRating =
    reviewedOrders.reduce((sum, order) => sum + (order.rating || 0), 0) /
    reviewedOrders.length;

  return (
    <ScrollView className="flex-1 p-4">
      {/* Summary */}
      <View className="bg-white rounded-2xl shadow-lg p-6 mb-6 items-center">
        <Text className="text-5xl mb-2">⭐</Text>
        <Text className="text-4xl font-bold text-primary mb-2">
          {averageRating.toFixed(1)}
        </Text>
        <StarDisplay rating={Math.round(averageRating)} />
        <Text className="text-gray-600 mt-2">
          {reviewedOrders.length} avaliações
        </Text>
      </View>

      {/* Reviews List */}
      <Text className="text-2xl font-bold mb-4">Avaliações dos Clientes</Text>
      
      {reviewedOrders.map((order) => (
        <View
          key={order.id}
          className="bg-white rounded-lg shadow-md p-4 mb-4"
        >
          <View className="flex-row justify-between items-start mb-3">
            <View>
              <Text className="font-semibold text-lg">
                {order.customer?.name || 'Cliente'}
              </Text>
              <Text className="text-gray-500 text-sm">
                {order.timestamp?.toDate().toLocaleDateString('pt-BR')}
              </Text>
            </View>
            <StarDisplay rating={order.rating || 0} />
          </View>

          {order.review && (
            <View className="border-l-4 border-primary pl-3 mt-2">
              <Text className="text-gray-700 italic">"{order.review}"</Text>
            </View>
          )}

          <View className="mt-3 pt-3 border-t border-gray-200">
            <Text className="text-gray-600 text-sm">
              Pedido #{order.id.substring(0, 6)} • ${order.total.toFixed(2)}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}