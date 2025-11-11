import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useCollectionQuery } from '@/hooks/useCollection';
import { useCollection } from '@/hooks/useCollection';
import type { Restaurant, MenuItem } from '@/types';
import { Feather } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '@/services/firebase/config';

// --- Constantes de Estilo ---
const PRIMARY_ORANGE = '#ff8c42';
const LIGHT_BEIGE_BG = '#fdf4eb';
const CARD_BACKGROUND = '#ffffff';
const TEXT_COLOR_DARK = '#444';
const RED_ALERT = '#EF4444'; 
const GRAY_BORDER = '#E5E7EB'; 

const { width } = Dimensions.get('window');
const isLargeScreen = width >= 700;

// Largura fixa para cada item do menu para garantir a rolagem horizontal fluida
const ITEM_WIDTH = isLargeScreen ? 280 : 220;
const ITEM_MARGIN = 15; // Margem entre os itens e padding lateral

// Função auxiliar para sombra cross-platform
const getCardShadow = () => {
    if (Platform.OS === 'ios') {
      return { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 5 };
    } else {
      return { elevation: 5 };
    }
};

export default function MenuPage() {
  const { restaurantCode } = useLocalSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { addToCart, itemCount } = useCart();

  const { data: restaurants } = useCollectionQuery<Restaurant>(
    'restaurants',
    { field: 'code', operator: '==', value: restaurantCode }
  );
  const restaurant = restaurants?.[0];

  const { data: menuItems } = useCollection<MenuItem>(
    restaurant ? `restaurants/${restaurant.id}/menu` : ''
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push({
        pathname: '/(auth)/login',
        params: { restaurantCode }
      });
    }
  }, [user, authLoading, restaurantCode]);

  if (!restaurant) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  const menuByCategory = menuItems?.reduce((acc, item) => {
    const category = item.category || 'Outros';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.menuScreenContainer}>
      
      {/* Header (Top Bar) */}
      <View style={styles.header}>
        <View style={styles.headerLogo}>
          <Feather name="anchor" size={20} color={PRIMARY_ORANGE} />
          <Text style={styles.restaurantNameText}>{restaurant.name}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.userButton}>
            <Feather name="user" size={20} color={TEXT_COLOR_DARK} />
            <Text style={styles.userNameText}>{user?.displayName?.split(' ')[0] || 'Cliente'}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Feather name="log-out" size={18} color={TEXT_COLOR_DARK} />
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Conteúdo Principal (Scroll Vertical) */}
      <View style={styles.mainContentArea}>
          <ScrollView contentContainerStyle={styles.menuScrollContentFull}>
            <View style={styles.menuInnerContainer}>
              
              {/* Loop para Categoria com Scroll Horizontal */}
              {Object.entries(menuByCategory || {}).map(([category, items]) => (
                <View key={category} style={styles.categorySection}>
                  
                  {/* Título da Categoria */}
                  <Text style={styles.pageTitle}>{category}</Text>
                  <View style={styles.categorySeparator} />

                  {/* Scroll Horizontal dos Itens */}
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.itemsHorizontalScroll}
                  >
                    {items.map((item) => (
                      <View 
                        key={item.id} 
                        style={[styles.itemCard, getCardShadow()]}
                      >
                        <Image
                          source={{ uri: item.imageUrl }}
                          style={styles.itemImage}
                          resizeMode="cover"
                        />
                        <View style={styles.itemDetails}>
                          <Text style={styles.itemNameText}>{item.name}</Text>
                          <Text style={styles.itemDescriptionText}>{item.description}</Text>
                          
                          <View style={styles.itemFooter}>
                            <Text style={styles.itemPriceText}>
                              ${item.price.toFixed(2)}
                            </Text>
                            <TouchableOpacity
                              style={styles.addButton}
                              onPress={() => addToCart(item)}
                            >
                              <Feather name="plus" size={14} color={CARD_BACKGROUND} />
                              <Text style={styles.addButtonText}>Add</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              ))}
            </View>
          </ScrollView>
      </View>
      
      {/* Bottom Navigation (Em todas as telas) */}
      <View style={styles.bottomNavigation}>
        {/* Item: Cardápio */}
        <TouchableOpacity style={styles.navItemActive}>
          <Feather name="home" size={24} color={PRIMARY_ORANGE} />
          <Text style={styles.navTextActive}>Cardápio</Text>
        </TouchableOpacity>

        {/* Item: Carrinho (Abre o modal/página em telas pequenas) */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push(`/(customer)/${restaurantCode}/cart`)}
        >
          <Feather name="shopping-cart" size={24} color={'#888'} />
          <Text style={styles.navText}>Carrinho</Text>
          {itemCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{itemCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Item: Pedidos */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push(`/(customer)/${restaurantCode}/orders`)}
        >
          <Feather name="clipboard" size={24} color={'#888'} />
          <Text style={styles.navText}>Pedidos</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: CARD_BACKGROUND },
  loadingText: { color: TEXT_COLOR_DARK },

  menuScreenContainer: {
    flex: 1,
    backgroundColor: LIGHT_BEIGE_BG,
  },
  
  // --- Header ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: CARD_BACKGROUND,
  },
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PRIMARY_ORANGE,
    marginLeft: 5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userNameText: {
    fontSize: 16,
    color: TEXT_COLOR_DARK,
    marginLeft: 5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 15,
  },
  logoutText: {
    fontSize: 14,
    color: TEXT_COLOR_DARK,
    marginLeft: 5,
  },

  // --- Main Content Area ---
  mainContentArea: {
    flex: 1,
    width: '100%',
  },
  menuScrollContentFull: {
    // Apenas padding vertical. Padding horizontal é tratado pelos elementos internos
    paddingVertical: ITEM_MARGIN, 
    flexGrow: 1,
    maxWidth: isLargeScreen ? 1000 : '100%', 
    // Removido 'alignSelf: 'center'', para que o conteúdo não seja centralizado
  },
  menuInnerContainer: {
    width: '100%',
  },

  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: TEXT_COLOR_DARK,
    marginBottom: 5,
    paddingLeft: ITEM_MARGIN, // Adiciona padding à esquerda para o título
  },
  categorySeparator: {
    borderBottomWidth: 2,
    borderBottomColor: PRIMARY_ORANGE,
    marginBottom: 20,
    width: '30%',
    marginLeft: ITEM_MARGIN, // Alinha o separador com o título
  },
  categorySection: {
    marginBottom: 40, 
  },
  
  // --- Scroll Horizontal dos Itens ---
  itemsHorizontalScroll: {
    paddingLeft: ITEM_MARGIN, // Espaçamento inicial à esquerda
    paddingRight: ITEM_MARGIN, // Espaçamento à direita
  },
  
  itemCard: {
    width: ITEM_WIDTH, 
    marginRight: ITEM_MARGIN, 
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 8,
    overflow: 'hidden',
    height: isLargeScreen ? 380 : 350, 
  },
  itemImage: {
    width: '100%',
    height: isLargeScreen ? 180 : 150, 
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  itemDetails: {
    padding: 15,
    flex: 1, 
    justifyContent: 'space-between',
  },
  itemNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  itemDescriptionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  itemPriceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PRIMARY_ORANGE,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_ORANGE,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addButtonText: {
    color: CARD_BACKGROUND,
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 14,
  },

  // --- Bottom Navigation ---
  bottomNavigation: {
    backgroundColor: CARD_BACKGROUND,
    borderTopWidth: 1,
    borderTopColor: GRAY_BORDER,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10, 
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  navItemActive: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  navText: {
    fontSize: 12,
    color: '#888',
  },
  navTextActive: {
    fontSize: 12,
    fontWeight: 'bold',
    color: PRIMARY_ORANGE,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: '30%',
    backgroundColor: RED_ALERT,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: CARD_BACKGROUND,
    fontSize: 10,
    fontWeight: 'bold',
  },
});