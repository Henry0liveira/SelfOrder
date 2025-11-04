import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, Dimensions, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDoc } from '@/hooks/useDoc';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/services/firebase/config';
import type { Order } from '@/types';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
// import RatingModal from '@/components/ratingmodal'; // Comentado pois o modal não foi fornecido

// --- Constantes de Estilo Comuns ---
const PRIMARY_ORANGE = '#ff8c42';
const LIGHT_BEIGE_BG = '#fdf4eb';
const CARD_BACKGROUND = '#ffffff';
const TEXT_COLOR_DARK = '#444';
const GRAY_BORDER = '#E5E7EB'; 
const PROGRESS_GRAY = '#E0E0E0';
const STAR_YELLOW = '#FFC107';

// Constantes adicionadas para os erros relatados
const CART_BG = '#fdf4eb';
const RED_ALERT = '#EF4444';
const SUCCESS_GREEN = '#10B981';

// Função auxiliar para sombra cross-platform
const getCardShadow = () => {
    if (Platform.OS === 'ios') {
      return { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 5 };
    } else {
      return { elevation: 5 };
    }
};

const statusConfig = {
  'new': { text: 'Pedido Recebido', emoji: '🆕', progress: 25 },
  'in-progress': { text: 'Em Preparo', emoji: '👨‍🍳', progress: 50 },
  'ready': { text: 'Pronto', emoji: '✅', progress: 75 },
  'completed': { text: 'Finalizado', emoji: '🎉', progress: 100 } // Mudado para 'Finalizado' para coincidir com a imagem
};

const StarDisplay = ({ rating }: { rating: number }) => {
  return (
    <View style={styles.starDisplayRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Text
          key={star}
          style={[
            styles.star, 
            { opacity: star <= rating ? 1 : 0.3 }
          ]}
        >
          ⭐
        </Text>
      ))}
    </View>
  );
};

// Componente RatingModal simplificado (baseado na Captura de Tela 32)
const SimpleRatingSection = ({ onSubmit, order }: { onSubmit: (rating: number, review: string) => void, order: Order }) => {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');

    return (
        <View style={styles.ratingCard}>
            <Text style={styles.ratingTitle}>Avalie sua experiência</Text>
            
            <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setRating(star)}>
                        <MaterialCommunityIcons 
                            name={star <= rating ? "star" : "star-outline"} 
                            size={30} 
                            color={STAR_YELLOW} 
                            style={{marginHorizontal: 5}}
                        />
                    </TouchableOpacity>
                ))}
            </View>

            <TextInput
                style={styles.reviewInput}
                placeholder="Deixe um comentário (opcional)..."
                placeholderTextColor="#999"
                value={review}
                onChangeText={setReview}
                multiline
                numberOfLines={3}
            />

            <TouchableOpacity 
                style={[styles.ratingSubmitButton, { opacity: rating === 0 ? 0.5 : 1 }]}
                onPress={() => onSubmit(rating, review)}
                disabled={rating === 0}
            >
                <Text style={styles.ratingSubmitButtonText}>Enviar Avaliação</Text>
            </TouchableOpacity>
        </View>
    );
}

export default function OrderDetailPage() {
  const { orderId, restaurantCode } = useLocalSearchParams();
  const router = useRouter();
  const [showRatingModal, setShowRatingModal] = useState(false); // Mantido o estado original

  const { data: order, loading } = useDoc<Order>('orders', orderId as string);

  // Função mantida para o modal original, mas usamos o SimpleRatingSection para replicar a imagem
  const handleSubmitRating = async (rating: number, review: string) => {
    if (!order) return;
    try {
      const orderRef = doc(firestore, 'orders', order.id);
      await updateDoc(orderRef, { rating, review });
      setShowRatingModal(false);
      alert('Avaliação enviada com sucesso! 🎉');
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Erro ao enviar avaliação');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>❌</Text>
        <Text style={styles.errorText}>Pedido não encontrado</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => router.back()}
        >
          <Text style={styles.errorButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentStatus = statusConfig[order.status];

  return (
    <SafeAreaView style={styles.scrollViewContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.pageCard, getCardShadow()]}>
            
            <Text style={styles.pageTitle}>Pedido finalizado</Text>
            <Text style={styles.orderIdText}>Acompanhe o status do seu pedido #{order.id.substring(0, 8)}...</Text>
            
            {/* Status Steps */}
            <View style={styles.progressContainer}>
                {/* As Views de step precisam ser absolutas para garantir o espaçamento correto sobre a barra de progresso */}
                <View style={[styles.progressBar, { width: `${currentStatus.progress}%`, backgroundColor: PRIMARY_ORANGE }]} />
                
                {/* Steps visuais */}
                <View style={[styles.progressStep, {left: 0, opacity: currentStatus.progress >= 25 ? 1 : 0.5}]} />
                <View style={[styles.progressStep, {left: '33.3%', opacity: currentStatus.progress >= 50 ? 1 : 0.5}]} />
                <View style={[styles.progressStep, {left: '66.6%', opacity: currentStatus.progress >= 75 ? 1 : 0.5}]} />
                <View style={[styles.progressStep, {right: 0, opacity: currentStatus.progress >= 100 ? 1 : 0.5}]} />

            </View>
            <View style={styles.statusLabels}>
                <Text style={styles.statusLabelText}>Recebido</Text>
                <Text style={styles.statusLabelText}>Em Preparo</Text>
                <Text style={styles.statusLabelText}>Pronto</Text>
                <Text style={styles.statusLabelText}>Finalizado</Text>
            </View>

            {/* Resumo do Pedido */}
            <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Resumo do Pedido</Text>
                {order.items.map((item, idx) => (
                    <View key={idx} style={styles.summaryItemRow}>
                        <Text style={styles.summaryItemText}>
                            {item.quantity}x {item.name}
                        </Text>
                        <Text style={styles.summaryItemPrice}>
                            ${(item.price * item.quantity).toFixed(2)}
                        </Text>
                    </View>
                ))}
                
                <View style={styles.totalRow}>
                    <Text style={styles.summaryTotalText}>Total</Text>
                    <Text style={[styles.summaryTotalText, styles.totalPriceText]}>
                        ${order.total.toFixed(2)}
                    </Text>
                </View>
            </View>

            {/* Avaliação (Simple Rating Section para replicar a imagem 32) */}
            {order.status === 'completed' && !order.rating && (
                <SimpleRatingSection 
                    onSubmit={handleSubmitRating} 
                    order={order} 
                />
            )}
            
            {/* Botão Voltar ao Cardápio */}
            <TouchableOpacity
                style={styles.backToMenuButton}
                onPress={() => router.replace(`/(customer)/${restaurantCode}`)}
            >
                <Text style={styles.backToMenuButtonText}>Voltar ao Cardápio</Text>
            </TouchableOpacity>

        </View>

        {/* Rating Modal (Mantido o código original caso você use um modal real) */}
        {/* <RatingModal
            visible={showRatingModal}
            onClose={() => setShowRatingModal(false)}
            onSubmit={handleSubmitRating}
            orderNumber={order.id.substring(0, 6)}
        /> */}

    </ScrollView>
    </SafeAreaView>
  );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: CARD_BACKGROUND },
    loadingText: { color: '#666' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: CARD_BACKGROUND, padding: 24 },
    errorIcon: { fontSize: 32, marginBottom: 16 },
    errorText: { fontSize: 18, color: '#666', marginBottom: 24 },
    errorButton: { backgroundColor: PRIMARY_ORANGE, borderRadius: 8, paddingHorizontal: 24, paddingVertical: 12 },
    errorButtonText: { color: CARD_BACKGROUND, fontWeight: 'bold' },

    scrollViewContainer: {
        flex: 1,
        backgroundColor: LIGHT_BEIGE_BG,
    },
    scrollContent: {
        alignItems: 'center',
        paddingVertical: 50,
    },
    pageCard: {
        backgroundColor: CARD_BACKGROUND,
        borderRadius: 8,
        padding: 30,
        width: '90%',
        maxWidth: 500,
    },
    pageTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: TEXT_COLOR_DARK,
        textAlign: 'center',
    },
    orderIdText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },

    // --- Progress Bar (Status Steps) ---
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 8,
        backgroundColor: PROGRESS_GRAY,
        borderRadius: 4,
        marginHorizontal: 10,
        position: 'relative',
        marginBottom: 5,
    },
    progressBar: {
        position: 'absolute',
        height: '100%',
        borderRadius: 4,
        left: 0,
    },
    progressStep: {
        position: 'absolute',
        width: 15,
        height: 15,
        backgroundColor: CARD_BACKGROUND,
        borderRadius: 7.5,
        borderWidth: 4,
        borderColor: PRIMARY_ORANGE,
        top: -3.5,
        zIndex: 2,
    },
    statusLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
        marginBottom: 30,
        paddingHorizontal: 0,
    },
    statusLabelText: {
        fontSize: 12,
        color: '#666',
        width: '25%',
        textAlign: 'center',
    },

    // --- Summary Card ---
    summaryCard: {
        marginBottom: 20,
        padding: 20,
        borderRadius: 8,
        backgroundColor: '#f9f9f9', // Cor sutilmente diferente para diferenciar da página
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: TEXT_COLOR_DARK,
    },
    summaryItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    summaryItemText: {
        color: '#666',
    },
    summaryItemPrice: {
        color: '#666',
        fontWeight: '500',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: GRAY_BORDER,
        paddingTop: 10,
        marginTop: 10,
    },
    summaryTotalText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: TEXT_COLOR_DARK,
    },
    totalPriceText: {
        color: PRIMARY_ORANGE,
    },

    // --- Rating Section (SimpleRatingSection Styles) ---
    ratingCard: {
        marginBottom: 20,
    },
    ratingTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
    },
    ratingStars: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 15,
    },
    reviewInput: {
        borderWidth: 1,
        borderColor: GRAY_BORDER,
        borderRadius: 5,
        padding: 10,
        textAlignVertical: 'top',
        marginBottom: 15,
        minHeight: 80,
    },
    ratingSubmitButton: {
        backgroundColor: PRIMARY_ORANGE,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    ratingSubmitButtonText: {
        color: CARD_BACKGROUND,
        fontWeight: 'bold',
        fontSize: 16,
    },
    backToMenuButton: {
        marginTop: 20,
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: GRAY_BORDER,
        alignItems: 'center',
    },
    backToMenuButtonText: {
        color: TEXT_COLOR_DARK,
        fontWeight: 'bold',
    },
    starDisplayRow: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    star: {
        fontSize: 24,
    },
});