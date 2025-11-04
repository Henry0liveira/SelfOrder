import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
// Importação de ícones do Expo. Certifique-se de que estão instalados,
// ou substitua por um componente de imagem real do seu logo.
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'; 

// Importações do Firebase mantidas, mas a lógica de login é encapsulada na função
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/services/firebase/config';

// Definição da cor primária, assumindo que 'bg-primary' no NativeWind é esse laranja
const PRIMARY_ORANGE = '#ff8c42'; 
const LIGHT_BEIGE_BG = '#fdf4eb'; 

export default function StaffLogin() {
  const [email, setEmail] = useState('staff@coral.cafe');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navega para o dashboard após o login
      router.replace('/(staff)/dashboard'); 
    } catch (error) {
      alert('Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  const goToCreateRestaurant = () => {
    // Implemente a navegação para a tela de criação de restaurante
    // Exemplo: router.push('/create-restaurant');
    console.log('Navegar para Criar Restaurante');
  };

  const goBack = () => {
    // Implementa a navegação de volta para a tela anterior
    router.back(); 
  };

  return (
    // Fundo da tela: cor laranja clara
    <SafeAreaView style={styles.container}>
      {/* Card principal com cantos arredondados e sombra */}
      <View style={styles.card}>
        
        {/* --- Logo e Título --- */}
        <View style={styles.header}>
          {/* Logo (Ícone de Garfo/Talheres) */}
          <View style={styles.logoCircle}>
            {/* Ícone Feather 'anchor' para simular o talher. Você pode usar uma Image se tiver o logo real. */}
            <Feather name="anchor" size={24} color="white" /> 
          </View>
          <Text style={styles.title}>Portal da Equipe</Text>
          <Text style={styles.subtitle}>Faça login para gerenciar seu restaurante</Text>
        </View>

        {/* --- Formulário de Login --- */}
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.textInput}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.inputLabel}>Senha</Text>
        <TextInput
          style={styles.textInput}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* --- Botão Principal de Login --- */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.loginButtonText}>
              Login →
            </Text>
          )}
        </TouchableOpacity>

        {/* --- Ações Secundárias (Criar conta e Voltar) --- */}
        
        <View style={styles.separator} /> 

        <Text style={styles.secondaryActionText}>
          Não tem uma conta?
        </Text>

        <TouchableOpacity
          style={styles.createButton}
          onPress={goToCreateRestaurant}
        >
          <MaterialCommunityIcons name="plus-circle-outline" size={20} color="#888" style={{ marginRight: 5 }}/>
          <Text style={styles.createButtonText}>
            Criar restaurante
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>

        {/* --- Texto de Demonstração --- */}
        <Text style={styles.demoText}>
          Use e-mail: <Text style={{ fontWeight: 'bold' }}>staff@coral.cafe</Text> e senha: <Text style={{ fontWeight: 'bold' }}>password</Text> para demonstração.
        </Text>
      </View>
      
      {/* Ícone 'N' no canto inferior esquerdo (Manter o estilo da tela anterior) */}
      <View style={styles.cornerIconPlaceholder}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>N</Text>
      </View>
    </SafeAreaView>
  );
}

// Para garantir a precisão do estilo, vamos usar StyleSheet.create
// As classes do NativeWind (ou Tailwind) seriam aplicadas diretamente na prop 'className'
// Mas para compatibilidade direta, aplicaremos os estilos CSS.

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BEIGE_BG, // orange-50
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#ffffff', // bg-white
    borderRadius: 16, // rounded-2xl
    padding: 24,
    width: '100%',
    maxWidth: 400, // Limita a largura do card
    // Sombra (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // Sombra (Android)
    elevation: 8,
  },
  header: {
    alignItems: 'center', // items-center
    marginBottom: 24, // mb-6
  },
  logoCircle: {
    backgroundColor: PRIMARY_ORANGE, // bg-primary
    borderRadius: 25, 
    padding: 12,
    marginBottom: 16,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20, // text-xl (ajustado de 3xl para se adequar ao design)
    fontWeight: 'bold', 
    color: '#444',
  },
  subtitle: {
    fontSize: 14,
    color: '#666', // text-gray-600
    marginTop: 4, // mt-2
  },
  inputLabel: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd', // border-gray-300
    borderRadius: 8, // rounded-lg
    padding: 12,
    marginBottom: 16, // mb-4 ou mb-6
    backgroundColor: '#fff',
    height: 48,
  },
  loginButton: {
    backgroundColor: PRIMARY_ORANGE, // bg-primary
    borderRadius: 8, // rounded-lg
    padding: 16,
    alignItems: 'center', // items-center
    marginBottom: 16,
    height: 50,
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#ffffff', // text-white
    fontWeight: 'bold',
    fontSize: 16, // text-lg
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  secondaryActionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    backgroundColor: '#f9f9f9', // Cor de fundo leve para o botão de criação
  },
  createButtonText: {
    color: '#444',
    fontWeight: '600',
    fontSize: 16,
  },
  backButton: {
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    color: PRIMARY_ORANGE,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  demoText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
  cornerIconPlaceholder: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});