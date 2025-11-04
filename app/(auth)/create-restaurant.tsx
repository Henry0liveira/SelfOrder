import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '@/services/firebase/config';
import { Feather } from '@expo/vector-icons';

// Style Constants
const PRIMARY_COLOR = '#ff8c42';
const BACKGROUND_COLOR = '#fdf4eb';
const WHITE = '#ffffff';
const TEXT_DARK = '#333333';
const TEXT_GRAY = '#666666';

export default function CreateRestaurant() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleCreateRestaurant = async () => {
    if (!user || !formData.name || !formData.email || !formData.password) return;
    
    setIsLoading(true);
    try {
      // Generate a unique code for the restaurant (you might want to improve this)
      const code = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 6) + Math.random().toString(36).substring(2, 5);

      await setDoc(doc(firestore, 'restaurants', user.uid), {
        id: user.uid,
        name: formData.name,
        code,
        ownerUid: user.uid,
        createdAt: new Date(),
      });

      router.replace('/(staff)/dashboard');
    } catch (error) {
      console.error('Error creating restaurant:', error);
      alert('Erro ao criar restaurante. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Feather name="coffee" size={32} color={PRIMARY_COLOR} />
          </View>
          <Text style={styles.title}>Crie um Novo Restaurante</Text>
          <Text style={styles.subtitle}>Preencha os detalhes para começar.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do Restaurante</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: The Tasty Spoon"
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail de Login</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: seu@email.com"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              value={formData.password}
              onChangeText={(text) => setFormData({...formData, password: text})}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleCreateRestaurant}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Criando...' : 'Criar Restaurante'}
            </Text>
            {!isLoading && <Feather name="arrow-right" size={20} color={WHITE} style={styles.buttonIcon} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={20} color={PRIMARY_COLOR} style={styles.backButtonIcon} />
            <Text style={styles.backButtonText}>Voltar ao Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  content: {
    flex: 1,
    padding: 20,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: TEXT_GRAY,
    textAlign: 'center',
  },
  form: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: TEXT_DARK,
    marginBottom: 8,
  },
  input: {
    backgroundColor: BACKGROUND_COLOR,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: TEXT_DARK,
  },
  button: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 8,
  },
  backButtonIcon: {
    marginRight: 8,
  },
  backButtonText: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontWeight: '500',
  },
});