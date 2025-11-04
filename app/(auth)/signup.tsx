import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '@/services/firebase/config';

// --- Constantes de Estilo ---
const PRIMARY_ORANGE = '#ff8c42';
const LIGHT_BEIGE_BG = '#fdf4eb';
const CARD_BACKGROUND = '#ffffff';
const TEXT_COLOR_DARK = '#444';
const INPUT_BACKGROUND = '#EAF3FF'; // Azul claro para o input

// Função auxiliar para sombra cross-platform
const getCardShadow = () => {
    if (Platform.OS === 'ios') {
      return {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      };
    } else {
      return {
        elevation: 8,
      };
    }
};

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const restaurantCode = params.restaurantCode as string;

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      alert('Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      await setDoc(doc(firestore, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        name,
        email,
      });

      router.replace(`/(customer)/${restaurantCode}`);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.card, getCardShadow()]}>
        <View style={styles.header}>
          {/* Ícone de Estrela/Brilho */}
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>✨</Text>
          </View>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>
            Crie sua conta para pedir neste restaurante
          </Text>
        </View>

        {/* Input Nome */}
        <Text style={styles.inputLabel}>Nome Completo</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Seu nome"
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
        />

        {/* Input Email */}
        <Text style={styles.inputLabel}>E-mail</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Seu email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Input Senha */}
        <Text style={styles.inputLabel}>Senha</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Sua senha"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Botão de Cadastro */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={CARD_BACKGROUND} />
          ) : (
            <Text style={styles.primaryButtonText}>
              Cadastrar →
            </Text>
          )}
        </TouchableOpacity>

        {/* Link de Login */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.linkContainer}
        >
            <Text style={styles.secondaryText}>
                Já tem conta?{' '}
                <Text 
                    style={styles.linkText}
                >
                    Faça login
                </Text>
            </Text>
        </TouchableOpacity>
      </View>
      
      {/* Ícone 'N' no canto inferior esquerdo */}
      <View style={styles.cornerIconPlaceholder}>
        <Text style={styles.cornerIconText}>N</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: LIGHT_BEIGE_BG,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        backgroundColor: CARD_BACKGROUND,
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    logoCircle: {
        backgroundColor: PRIMARY_ORANGE,
        borderRadius: 50,
        padding: 12,
        marginBottom: 16,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 30, 
        color: CARD_BACKGROUND,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: TEXT_COLOR_DARK,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
        textAlign: 'center',
    },
    inputLabel: {
        fontSize: 14,
        color: TEXT_COLOR_DARK,
        marginBottom: 4,
        marginTop: 10,
    },
    textInput: {
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        backgroundColor: INPUT_BACKGROUND,
        borderWidth: 1,
        borderColor: INPUT_BACKGROUND,
        height: 50,
    },
    primaryButton: {
        backgroundColor: PRIMARY_ORANGE,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 10,
    },
    primaryButtonText: {
        color: CARD_BACKGROUND,
        fontWeight: 'bold',
        fontSize: 18,
    },
    linkContainer: {
        alignItems: 'center',
    },
    secondaryText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    linkText: {
        color: PRIMARY_ORANGE,
        fontWeight: 'bold',
    },
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
    },
    cornerIconText: {
        color: CARD_BACKGROUND,
        fontWeight: 'bold',
    },
});