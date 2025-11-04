import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, Dimensions } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'; 
import * as Clipboard from 'expo-clipboard'; 
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useDoc } from '@/hooks/useDoc';
import { useCollectionQuery } from '@/hooks/useCollection';
import { signOut } from 'firebase/auth';
import { auth } from '@/services/firebase/config';
import type { Restaurant, Order } from '@/types';

// --- Constantes de Layout e Cores ---
const { width } = Dimensions.get('window');
// Define o breakpoint para quando o layout deve mudar de coluna para linha (ex: tablets/web)
const BREAKPOINT = 700; 
const isLargeScreen = width >= BREAKPOINT;

const PRIMARY_ORANGE = '#ff8c42'; 
const LIGHT_BEIGE_BG = '#fdf4eb'; 
const CARD_BACKGROUND = '#ffffff';
const TEXT_COLOR_DARK = '#444';

// Função auxiliar para copiar
const copyToClipboard = async (text: string) => {
  await Clipboard.setStringAsync(text);
};

// Função auxiliar para sombra cross-platform
const getCardShadow = () => {
    if (Platform.OS === 'ios') {
      return {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      };
    } else {
      return {
        elevation: 5, 
      };
    }
  };


export default function StaffDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false); // Estado para feedback visual de cópia

  const { data: restaurant } = useDoc<Restaurant>(
    'restaurants',
    user?.uid || ''
  );

  const { data: orders } = useCollectionQuery<Order>(
    'orders',
    { field: 'restaurantId', operator: '==', value: restaurant?.id || '' }
  );

  const newOrdersCount = orders?.filter(o => o.status === 'new').length || 0;

  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/');
  };

  const handleCopy = (code: string) => {
    copyToClipboard(code);
    setCopied(true);
    // Exibe a notificação de cópia por 2 segundos
    setTimeout(() => setCopied(false), 2000); 
  };


  if (!restaurant) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#666' }}>Carregando...</Text>
      </View>
    );
  }

  const restaurantCode = restaurant.code.toUpperCase(); 

  return (
    <SafeAreaView style={styles.container}>
      
      {/* --- Header (Top Bar) --- */}
      <View style={styles.header}>
        <View style={styles.logoName}>
          <Feather name="anchor" size={isLargeScreen ? 22 : 18} color={PRIMARY_ORANGE} />
          <Text style={[styles.restaurantName, isLargeScreen && {fontSize: 18}]}>{restaurant.name}</Text>
        </View>
        
        {/* Título Principal: Centralizado em Telas Grandes, Oculto em Telas Pequenas para economizar espaço */}
        {isLargeScreen && (
            <View style={styles.mainTitleContainer}>
                <Text style={styles.mainTitle}>Painel da Equipe</Text>
                <Text style={styles.mainSubtitle}>Selecione uma opção para começar</Text>
            </View>
        )}

        {/* Link Logout */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Feather name="log-out" size={16} color={TEXT_COLOR_DARK} />
            <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* --- Scroll Content --- */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Título e Subtítulo para Telas Pequenas (Colocado dentro do Scroll) */}
        {!isLargeScreen && (
            <View style={styles.mobileTitleContainer}>
                <Text style={[styles.mainTitle, {fontSize: 20}]}>Painel da Equipe</Text>
                <Text style={styles.mainSubtitle}>Selecione uma opção para começar</Text>
            </View>
        )}

        {/* 1. Card: Seu Código de Restaurante */}
        <View style={[styles.card, styles.codeCard, getCardShadow()]}>
          <Text style={styles.cardTitle}>Seu Código de Restaurante</Text>
          <Text style={styles.codeSubtitle}>Os clientes usarão este código para acessar seu cardápio.</Text>
          
          <View style={styles.codeRow}>
            {/* Código */}
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{restaurantCode}</Text>
            </View>
            
            {/* Botão Copiar */}
            <TouchableOpacity 
                style={styles.copyButton}
                onPress={() => handleCopy(restaurantCode)}
            >
                <Feather name="copy" size={16} color={TEXT_COLOR_DARK} />
                <Text style={styles.copyButtonText}>Copiar Código</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Cards de Ações (Responsivo) */}
        <View style={isLargeScreen ? styles.actionCardsRowLarge : styles.actionCardsRowSmall}>
            
            {/* Card: Ver Pedidos */}
            <TouchableOpacity 
                style={[styles.card, styles.actionCard, isLargeScreen ? styles.actionCardLarge : styles.actionCardSmall, getCardShadow()]}
                onPress={() => router.push('/(staff)/orders')}
            >
                <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name="clipboard-text-outline" size={32} color={PRIMARY_ORANGE} />
                    {newOrdersCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{newOrdersCount}</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.actionCardTitle}>Ver Pedidos</Text>
                <Text style={styles.actionCardSubtitle}>Acompanhe os pedidos dos clientes em tempo real.</Text>
            </TouchableOpacity>

            {/* Card: Gerenciar Cardápio */}
            <TouchableOpacity 
                style={[styles.card, styles.actionCard, isLargeScreen ? styles.actionCardLarge : styles.actionCardSmall, getCardShadow()]}
                onPress={() => router.push('/(staff)/menu')}
            >
                <View style={styles.iconCircle}>
                    <Feather name="book-open" size={32} color={PRIMARY_ORANGE} />
                </View>
                <Text style={styles.actionCardTitle}>Gerenciar Cardápio</Text>
                <Text style={styles.actionCardSubtitle}>Adicione, edite ou remova itens do seu cardápio.</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>

      {/* --- Toast de Login Bem-Sucedido/Cópia --- */}
      {(copied || !user) && ( // Exibe se copiado ou se for a notificação de primeiro login
          <View style={styles.toastContainer}>
            <Text style={styles.toastTitle}>{copied ? 'Copiado!' : 'Login bem-sucedido!'}</Text>
            <Text style={styles.toastText}>
                {copied 
                    ? `O código ${restaurantCode} foi copiado.` 
                    : 'Bem-vindo de volta! Redirecionando para o seu painel...'
                }
            </Text>
          </View>
      )}
      
      {/* Ícone 'N' no canto inferior esquerdo */}
      <View style={styles.cornerIconPlaceholder}>
        <Text style={{ color: CARD_BACKGROUND, fontWeight: 'bold' }}>N</Text>
      </View>
    </SafeAreaView>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BEIGE_BG, 
  },
  
  // --- Header/Top Bar (Fixo e Flexível) ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0e3d9', 
    backgroundColor: CARD_BACKGROUND, 
  },
  logoName: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    minWidth: 100, // Garante que a logo tenha um tamanho mínimo
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PRIMARY_ORANGE,
    marginLeft: 5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    minWidth: 70, // Garante que o Logout tenha um tamanho mínimo
    justifyContent: 'flex-end',
  },
  logoutText: {
    fontSize: 14,
    color: TEXT_COLOR_DARK,
    marginLeft: 5,
  },
  
  // --- Título Principal para Telas Grandes (Header) ---
  mainTitleContainer: {
    alignItems: 'center',
    flex: 1, 
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_COLOR_DARK,
  },
  mainSubtitle: {
    fontSize: 16,
    color: '#666',
  },

  // --- Título para Telas Pequenas (Scroll Content) ---
  mobileTitleContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },

  // --- Scroll Content (Define o Alinhamento Central) ---
  scrollContent: {
    alignItems: 'center', 
    padding: 20,
    minHeight: '100%',
  },
  
  // --- Cards Compartilhados ---
  card: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 8,
    padding: 20,
    width: '100%',
    maxWidth: 900, 
    marginBottom: 20,
  },

  // --- Card 1: Código do Restaurante ---
  codeCard: {
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_COLOR_DARK,
    marginBottom: 5,
  },
  codeSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeBox: {
    backgroundColor: '#ffedd5', 
    borderRadius: 4,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  codeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: PRIMARY_ORANGE,
    letterSpacing: 1,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5', 
    borderRadius: 4,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  copyButtonText: {
    fontSize: 14,
    color: TEXT_COLOR_DARK,
    marginLeft: 5,
  },

  // --- Card 2 & 3: Ações (Layout Responsivo) ---
  
  // Layout para telas grandes (Linha)
  actionCardsRowLarge: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 900,
  },
  actionCardLarge: {
    width: '45%', 
    marginHorizontal: 10,
  },

  // Layout para telas pequenas (Coluna)
  actionCardsRowSmall: {
    flexDirection: 'column',
    width: '100%',
    maxWidth: 400, // Limita a largura máxima da coluna
  },
  actionCardSmall: {
    marginBottom: 20,
  },

  actionCard: {
    padding: 30,
    alignItems: 'center',
  },
  iconCircle: {
    backgroundColor: '#ffedd5', 
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_COLOR_DARK,
    marginTop: 10,
    textAlign: 'center',
  },
  actionCardSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  
  // Badge de Novos Pedidos
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // --- Toast/Snackbar (Notificação) ---
  toastContainer: {
    position: 'absolute',
    // Posição responsiva: canto inferior direito em telas grandes, centralizado no rodapé em telas pequenas
    bottom: 20,
    right: isLargeScreen ? 20 : 'auto',
    left: isLargeScreen ? 'auto' : 20,
    backgroundColor: CARD_BACKGROUND,
    padding: 15,
    borderRadius: 8,
    ...getCardShadow(), 
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY_ORANGE,
    width: isLargeScreen ? 300 : width - 40, // Largura total com margem em telas pequenas
  },
  toastTitle: {
    fontWeight: 'bold',
    color: TEXT_COLOR_DARK,
    marginBottom: 5,
  },
  toastText: {
    fontSize: 14,
    color: '#666',
  },

  // --- Ícone de Canto ---
  cornerIconPlaceholder: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: TEXT_COLOR_DARK,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    // Esconde o ícone de canto se o toast estiver no canto esquerdo (em telas pequenas)
    opacity: isLargeScreen ? 1 : 0, 
  },
});