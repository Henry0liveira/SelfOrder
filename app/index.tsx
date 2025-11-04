import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Modal, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { firestore } from '@/services/firebase/config';
import type { Restaurant } from '@/types';
import QRScanner from '@/components/QRScanner';

// Cores (Baseadas no visual da imagem):
const COLORS = {
  background: '#FFF5E5', // Fundo creme suave (similar ao orange-50)
  primary: '#FF5733',     // Laranja forte para botões
  primaryHover: '#E04A2C', // Laranja um pouco mais escuro
  textDark: '#1F2937',    // Texto principal escuro
  textMedium: '#6B7280',  // Texto secundário (gray-600)
  inputBorder: '#D1D5DB', // Borda do input
  inputBackground: '#F9FAFB', // Fundo do input
  scanButton: '#10B981', // Verde para o botão de scanner
};

export default function Home() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const router = useRouter();

  const handleFindMenu = async (restaurantCode?: string) => {
    const searchCode = restaurantCode || code;
    if (!searchCode.trim()) {
      Alert.alert('Atenção', 'Por favor, insira o código do restaurante.');
      return;
    }
    
    setLoading(true);
    try {
      const q = query(
        collection(firestore, 'restaurants'),
        where('code', '==', searchCode.toUpperCase()),
        limit(1)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const restaurant = snapshot.docs[0].data() as Restaurant;
        setShowScanner(false); // Fecha o scanner antes de navegar
        router.push(`/(customer)/${restaurant.code}`);
      } else {
        Alert.alert('Erro', 'Restaurante não encontrado. Verifique o código.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Ocorreu um erro ao buscar o restaurante. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = (data: string) => {
    console.log('QR Code escaneado:', data);
    
    // Tentar extrair código do QR (pode ser URL ou código direto)
    let extractedCode = data;
    
    // Se for URL, extrair o código (formato: XXXX123)
    const urlMatch = data.match(/[A-Z]{4}\d{3}/);
    if (urlMatch) {
      extractedCode = urlMatch[0];
    } else {
      // Se não for URL, limpar caracteres especiais
      extractedCode = data.replace(/[^A-Z0-9]/g, '').toUpperCase();
    }
    
    if (extractedCode.length >= 4) {
      handleFindMenu(extractedCode);
    } else {
      Alert.alert('QR Code Inválido', 'O QR Code escaneado não contém um código válido.');
      setShowScanner(false);
    }
  };

  const handleStaffLogin = () => {
    router.push('/(auth)/staff-login');
  };

  const isButtonDisabled = loading || !code.trim();
  const customerButtonStyles = [
    styles.button, 
    { backgroundColor: isButtonDisabled ? COLORS.primaryHover : COLORS.primary }
  ];

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
      
      {/* Logo e Título */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🍴</Text> 
        </View>
        <Text style={styles.title}>SelfOrder</Text>
        <Text style={styles.subtitle}>
          A forma mais simples de visualizar cardápios e fazer pedidos.
        </Text>
      </View>

      {/* Seção dos Cards */}
      <View style={styles.cardsSection}>
        
        {/* Card para Clientes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Para clientes</Text>
          <Text style={styles.cardSubtitle}>
            Escaneie o QR Code ou digite o código do restaurante
          </Text>
          
          {/* Botão Escanear QR Code - DESTAQUE */}
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => {
              console.log('Botão QR pressionado!');
              setShowScanner(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.scanButtonIcon}>📷</Text>
            <View style={styles.scanButtonTextContainer}>
              <Text style={styles.scanButtonText}>Escanear QR Code</Text>
              <Text style={styles.scanButtonSubtext}>Toque para abrir a câmera</Text>
            </View>
          </TouchableOpacity>

          {/* Divisor */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OU</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Label e Input com ícone */}
          <Text style={styles.inputLabel}>Digite o código:</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputIcon}>QR</Text> 
            <TextInput
              style={styles.input}
              placeholder="Ex: CORAL123" 
              value={code}
              onChangeText={(text) => setCode(text.toUpperCase())}
              autoCapitalize="characters"
              maxLength={10}
              placeholderTextColor="#9ca3af"
              editable={!loading}
            />
          </View>

          {/* Botão "Ver Cardápio" */}
          <TouchableOpacity
            style={customerButtonStyles}
            onPress={() => handleFindMenu()}
            disabled={isButtonDisabled}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.buttonText}>Ver Cardápio</Text>
                <Text style={styles.buttonText}>➔</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Card para Restaurantes */}
        <TouchableOpacity
          style={[styles.card, styles.restaurantCard]} 
          onPress={handleStaffLogin}
          activeOpacity={0.8}
        >
          <View>
            <Text style={styles.cardTitle}>Para Restaurantes</Text>
            <Text style={styles.cardSubtitle}>
              Gerencie o cardápio e acompanhe os pedidos recebidos.
            </Text>
          </View>
          
          <View style={[styles.button, styles.staffButton]}>
            <Text style={styles.buttonText}>Staff Login</Text>
            <Text style={styles.buttonText}>➔</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Copyright */}
      <Text style={styles.copyrightText}>
        Copyright © 2025 SelfOrder. All Rights Reserved.
      </Text>

      {/* QR Scanner Modal */}
      <Modal
        visible={showScanner}
        animationType="slide"
        onRequestClose={() => setShowScanner(false)}
        presentationStyle="fullScreen"
      >
        <QRScanner
          onScan={handleQRScan}
          onClose={() => {
            console.log('Scanner fechado');
            setShowScanner(false);
          }}
        />
      </Modal>
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingVertical: 24,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 9999,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoText: {
    fontSize: 30,
    color: COLORS.primary,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMedium,
    textAlign: 'center',
    maxWidth: 300,
  },
  cardsSection: {
    width: '100%',
    maxWidth: 1024,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 32,
  },
  card: {
    width: '100%',
    maxWidth: 384,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  restaurantCard: {
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: COLORS.textDark,
  },
  cardSubtitle: {
    color: COLORS.textMedium,
    fontSize: 14,
    marginBottom: 16,
  },
  // NOVO: Botão de Scanner QR
  scanButton: {
    backgroundColor: COLORS.scanButton,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  scanButtonIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  scanButtonTextContainer: {
    flex: 1,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scanButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  // NOVO: Divisor
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.inputBorder,
  },
  dividerText: {
    marginHorizontal: 12,
    color: COLORS.textMedium,
    fontWeight: '600',
    fontSize: 14,
  },
  // NOVO: Label do input
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMedium,
    marginBottom: 8,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: COLORS.inputBackground,
  },
  inputIcon: {
    fontSize: 18,
    color: '#9ca3af',
    marginRight: 10,
    fontWeight: 'bold',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textDark,
    fontFamily: 'monospace',
  },
  button: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  staffButton: {
    backgroundColor: COLORS.primary,
    marginTop: 'auto',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 8,
  },
  copyrightText: {
    color: COLORS.textMedium,
    fontSize: 10,
    marginTop: 'auto',
    marginBottom: 16,
  },
});