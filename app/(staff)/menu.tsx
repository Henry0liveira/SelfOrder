import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollection } from '@/hooks/useCollection';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '@/services/firebase/config';
import { Feather } from '@expo/vector-icons';
import type { MenuItem } from '@/types';

// Style Constants
const PRIMARY_COLOR = '#ff8c42';
const BACKGROUND_COLOR = '#fdf4eb';
const WHITE = '#ffffff';
const TEXT_DARK = '#333333';
const TEXT_GRAY = '#666666';



export default function StaffMenu() {
  const router = useRouter();
  const { user } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    imageUrl: '',
  });

  const { data: menuItems } = useCollection<MenuItem>(
    user ? `restaurants/${user.uid}/menu` : ''
  );



  const menuByCategory = menuItems?.reduce((acc, item) => {

    const category = item.category || 'Outros';

    if (!acc[category]) acc[category] = [];

    acc[category].push(item);

    return acc;

  }, {} as Record<string, MenuItem[]>);



  const addMenuItem = async () => {
    if (!user) return;
    
    try {
      const itemId = Date.now().toString();
      await setDoc(doc(firestore, `restaurants/${user.uid}/menu/${itemId}`), {
        id: itemId,
        ...newItem,
        price: parseFloat(newItem.price),
        createdAt: new Date(),
      });
      setIsModalVisible(false);
      setNewItem({ name: '', category: '', description: '', price: '', imageUrl: '' });
    } catch (error) {
      console.error('Error adding menu item:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={WHITE} />
            <Text style={styles.backButtonText}>Voltar ao Painel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Gerenciar Cardápio</Text>
        <Text style={styles.headerSubtitle}>Veja e gerencie os itens do seu cardápio.</Text>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Feather name="plus-circle" size={20} color={WHITE} />
          <Text style={styles.addButtonText}>Adicionar Novo Item</Text>
        </TouchableOpacity>
      </View>

      {!menuItems || menuItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>📖</Text>
          <Text style={styles.emptyStateTitle}>Cardápio vazio</Text>
          <Text style={styles.emptyStateText}>
            Clique em "Adicionar Novo Item" para começar a criar seu cardápio
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {Object.entries(menuByCategory || {}).map(([category, items]) => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>
                {category}
              </Text>
              {items.map((item) => (
                <View key={item.id} style={styles.menuItem}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                  <View style={styles.itemContent}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDescription}>{item.description}</Text>
                    <Text style={styles.itemPrice}>
                      R$ {item.price.toFixed(2)}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.editButton}>
                    <Feather name="edit-2" size={20} color={PRIMARY_COLOR} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      )}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Novo Item ao Cardápio</Text>
            <Text style={styles.modalSubtitle}>Preencha os detalhes do novo item.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nome do Item</Text>
              <TextInput
                style={styles.input}
                value={newItem.name}
                onChangeText={(text) => setNewItem({...newItem, name: text})}
                placeholder="Ex: Hambúrguer Clássico"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Categoria</Text>
              <TextInput
                style={styles.input}
                value={newItem.category}
                onChangeText={(text) => setNewItem({...newItem, category: text})}
                placeholder="Ex: Pratos Principais"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descrição</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newItem.description}
                onChangeText={(text) => setNewItem({...newItem, description: text})}
                placeholder="Uma breve descrição do item."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1, styles.marginRight]}>
                <Text style={styles.inputLabel}>Preço</Text>
                <TextInput
                  style={styles.input}
                  value={newItem.price}
                  onChangeText={(text) => setNewItem({...newItem, price: text})}
                  placeholder="Ex: 25.50"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.inputLabel}>URL da Imagem</Text>
                <TextInput
                  style={styles.input}
                  value={newItem.imageUrl}
                  onChangeText={(text) => setNewItem({...newItem, imageUrl: text})}
                  placeholder="https://..."
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={addMenuItem}
              >
                <Text style={styles.submitButtonText}>Adicionar Item</Text>
                <Feather name="arrow-right" size={20} color={WHITE} style={styles.submitButtonIcon} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  header: {
    backgroundColor: PRIMARY_COLOR,
    padding: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: WHITE,
    fontSize: 16,
    marginLeft: 8,
  },
  logoutText: {
    color: WHITE,
    fontSize: 16,
  },
  headerTitle: {
    color: WHITE,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: WHITE,
    fontSize: 14,
    opacity: 0.9,
  },
  actionContainer: {
    padding: 16,
  },
  addButton: {
    backgroundColor: PRIMARY_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    color: TEXT_DARK,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: TEXT_GRAY,
    textAlign: 'center',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: PRIMARY_COLOR,
    paddingBottom: 8,
  },
  menuItem: {
    backgroundColor: WHITE,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  itemImage: {
    width: 100,
    height: 100,
  },
  itemContent: {
    flex: 1,
    padding: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: TEXT_GRAY,
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
  },
  editButton: {
    padding: 12,
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: TEXT_GRAY,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  marginRight: {
    marginRight: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
  },
  cancelButton: {
    marginRight: 12,
    padding: 12,
  },
  cancelButtonText: {
    color: TEXT_GRAY,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  submitButtonIcon: {
    marginLeft: 4,
  },
});