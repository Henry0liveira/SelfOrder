import React, { createContext, useContext, useMemo } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, writeBatch, runTransaction } from 'firebase/firestore';
import { firestore } from '@/services/firebase/config';
import { useAuth } from './AuthContext';
import { useCollection } from '@/hooks/useCollection';
import type { MenuItem, CartItem, FirestoreCartItem } from '@/types';

type CartContextType = {
  cartItems: CartItem[];
  loading: boolean;
  addToCart: (item: MenuItem) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  itemCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const cartPath = user ? `users/${user.uid}/cart` : '';
  const { data: firestoreCartItems, loading } = useCollection<FirestoreCartItem>(cartPath);

  const cartItems: CartItem[] = useMemo(() => {
    if (!firestoreCartItems) return [];
    return firestoreCartItems.map(item => ({
      id: item.id,
      menuItem: {
        id: item.menuItemId,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        description: item.description || '',
        category: item.category || '',
        imageHint: item.imageHint || '',
      },
      quantity: item.quantity,
    }));
  }, [firestoreCartItems]);

  const addToCart = async (item: MenuItem) => {
    if (!user) throw new Error('User not authenticated');
    
    const cartRef = collection(firestore, `users/${user.uid}/cart`);
    
    await runTransaction(firestore, async (transaction) => {
      const existingItem = firestoreCartItems?.find(ci => ci.menuItemId === item.id);
      
      if (existingItem) {
        const itemDocRef = doc(firestore, `users/${user.uid}/cart`, existingItem.id);
        transaction.update(itemDocRef, { quantity: existingItem.quantity + 1 });
      } else {
        const newDocRef = doc(cartRef);
        transaction.set(newDocRef, {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          imageUrl: item.imageUrl,
          description: item.description,
          category: item.category,
          imageHint: item.imageHint,
        });
      }
    });
  };

  const removeFromCart = async (cartItemId: string) => {
    if (!user) return;
    const itemDocRef = doc(firestore, `users/${user.uid}/cart`, cartItemId);
    await deleteDoc(itemDocRef);
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (!user) return;
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
    } else {
      const itemDocRef = doc(firestore, `users/${user.uid}/cart`, cartItemId);
      await updateDoc(itemDocRef, { quantity });
    }
  };

  const clearCart = async () => {
    if (!user || !firestoreCartItems?.length) return;
    
    const batch = writeBatch(firestore);
    firestoreCartItems.forEach(item => {
      const docRef = doc(firestore, `users/${user.uid}/cart`, item.id);
      batch.delete(docRef);
    });
    await batch.commit();
  };

  const cartTotal = cartItems.reduce((total, item) => 
    total + item.menuItem.price * item.quantity, 0
  );

  const itemCount = cartItems.reduce((count, item) => 
    count + item.quantity, 0
  );

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      itemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};