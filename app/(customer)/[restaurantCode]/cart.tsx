import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Platform, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCollectionQuery } from '@/hooks/useCollection';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/services/firebase/config';
import type { Restaurant, Order } from '@/types';
import { Feather } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '@/services/firebase/config';

// --- Constantes de Estilo Comuns ---
const PRIMARY_ORANGE = '#ff8c42';
const LIGHT_BEIGE_BG = '#fdf4eb';
const CARD_BACKGROUND = '#ffffff';
const TEXT_COLOR_DARK = '#444';
const GRAY_BORDER = '#E5E7EB'; 
const RED_ALERT = '#EF4444'; 

// Função auxiliar para sombra cross-platform
const getCardShadow = () => {
    if (Platform.OS === 'ios') {
      return { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 5 };
    } else {
      return { elevation: 5 };
    }
};

export default function CartPage() {
  const { restaurantCode } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false); // Novo estado

  const { data: restaurants } = useCollectionQuery<Restaurant>(
    'restaurants',
    { field: 'code', operator: '==', value: restaurantCode }
  );
  const restaurant = restaurants?.[0];

  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/');
  };

  const handlePlaceOrder = async () => {
    if (!user || !restaurant || cartItems.length === 0 || isPlacingOrder) return;

    setIsPlacingOrder(true);

    const newOrder: Omit<Order, 'id'> = {
      restaurantId: restaurant.id,
      customerUid: user.uid,
      customer: {
        name: user.displayName || 'Anônimo',
        email: user.email || ''
      },
      items: cartItems.map(ci => ({
        menuItemId: ci.menuItem.id,
        name: ci.menuItem.name,
        quantity: ci.quantity,
        price: ci.menuItem.price
      })),
      total: cartTotal,
      status: 'new',
      timestamp: serverTimestamp() as any
    };

    try {
      await addDoc(collection(firestore, 'orders'), newOrder);
      await clearCart();
      alert('Pedido realizado com sucesso! Acompanhe o status na aba Pedidos.');
      router.replace(`/(customer)/${restaurantCode}/orders`);
    } catch (error) {
      alert('Erro ao realizar pedido');
      console.error(error);
    } finally {
      setIsPlacingOrder(false);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      {/* Header com o título da página */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{padding: 5}}>
          <Feather name="arrow-left" size={24} color={TEXT_COLOR_DARK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seu Pedido</Text>
        <TouchableOpacity 
          onPress={handleLogout} 
          style={styles.logoutButton}
        >
          <Feather name="log-out" size={18} color={TEXT_COLOR_DARK} />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <Feather name="shopping-cart" size={60} color={'#888'} style={styles.emptyCartIcon} />
          <Text style={styles.emptyCartText}>Seu carrinho está vazio</Text>
          <Text style={styles.emptyCartSubtext}>Adicione itens do cardápio para começar.</Text>
        </View>
      ) : (
        <>
          <ScrollView style={styles.scrollView}>
            {cartItems.map((item) => (
              <View key={item.id} style={[styles.cartItemCard, getCardShadow()]}>
                <Image
                  source={{ uri: item.menuItem.imageUrl }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemNameText}>{item.menuItem.name}</Text>
                  <Text style={styles.itemPriceText}>${item.menuItem.price.toFixed(2)}</Text>
                  
                  <View style={styles.quantityControl}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Text style={styles.quantityButtonText}>−</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.quantityCount}>{item.quantity}</Text>
                    
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Botão de Remover */}
                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFromCart(item.id)}
                >
                    <Feather name="trash-2" size={20} color={RED_ALERT} />
                </TouchableOpacity>

              </View>
            ))}
          </ScrollView>

          {/* Footer do Carrinho (Total e Botão) */}
          <View style={styles.cartFooter}>
            <View style={styles.cartTotalRow}>
              <Text style={styles.cartTotalText}>Total:</Text>
              <Text style={[styles.cartTotalText, {color: PRIMARY_ORANGE}]}>
                ${cartTotal.toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.primaryButton, {opacity: isPlacingOrder ? 0.7 : 1}]}
              onPress={handlePlaceOrder}
              disabled={isPlacingOrder}
            >
              {isPlacingOrder ? (
                  <ActivityIndicator color={CARD_BACKGROUND} />
              ) : (
                  <Text style={styles.primaryButtonText}>
                    <Text>Finalizar Pedido</Text>
                    <Text> →</Text>
                  </Text>
              )}
            </TouchableOpacity>
          </View>
        </>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: Platform.OS === 'ios' ? 50 : 20, // Ajuste para SafeArea
        paddingBottom: 15,
        backgroundColor: CARD_BACKGROUND,
        borderBottomWidth: 1,
        borderBottomColor: GRAY_BORDER,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: TEXT_COLOR_DARK,
        flex: 1,
        textAlign: 'center',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
    },
    logoutText: {
        fontSize: 14,
        color: TEXT_COLOR_DARK,
        marginLeft: 5,
    },

    // --- Empty Cart State ---
    emptyCartContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyCartIcon: {
        marginBottom: 20,
    },
    emptyCartText: {
        fontSize: 20,
        color: '#666',
        fontWeight: '600',
        marginBottom: 5,
    },
    emptyCartSubtext: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
    },

    // --- Scroll View and Cart Items ---
    scrollView: {
        flex: 1,
        padding: 15,
    },
    cartItemCard: {
        flexDirection: 'row',
        backgroundColor: CARD_BACKGROUND,
        borderRadius: 8,
        marginBottom: 10,
        overflow: 'hidden',
        position: 'relative',
        paddingRight: 15, // Espaço para o botão de remover
    },
    itemImage: {
        width: 80,
        height: 80,
    },
    itemDetails: {
        flex: 1,
        padding: 10,
        justifyContent: 'space-between',
    },
    itemNameText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    itemPriceText: {
        color: PRIMARY_ORANGE,
        fontSize: 14,
        marginTop: 4,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    quantityButton: {
        backgroundColor: GRAY_BORDER,
        borderRadius: 50,
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: TEXT_COLOR_DARK,
        lineHeight: 20,
    },
    quantityCount: {
        marginHorizontal: 15,
        fontSize: 16,
        fontWeight: 'bold',
        color: TEXT_COLOR_DARK,
    },
    removeButton: {
        justifyContent: 'center',
        paddingLeft: 10,
    },
    
    // --- Footer ---
    cartFooter: {
        backgroundColor: CARD_BACKGROUND,
        borderTopWidth: 1,
        borderTopColor: GRAY_BORDER,
        padding: 15,
        paddingBottom: Platform.OS === 'ios' ? 30 : 15, // Ajuste para SafeArea
    },
    cartTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    cartTotalText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: TEXT_COLOR_DARK,
    },
    primaryButton: {
        backgroundColor: PRIMARY_ORANGE,
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: CARD_BACKGROUND,
        fontWeight: 'bold',
        fontSize: 18,
    },
});