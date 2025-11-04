import { Timestamp } from 'firebase/firestore';

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  imageHint: string;
};

export type Restaurant = {
  id: string;
  name: string;
  code: string;
  ownerUid: string;
};

export type OrderStatus = 'new' | 'in-progress' | 'ready' | 'completed';

export type FirestoreCartItem = {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  description?: string;
  category?: string;
  imageHint?: string;
};

export type CartItem = {
  id: string;
  menuItem: MenuItem;
  quantity: number;
};

export type OrderItem = {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  restaurantId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  timestamp: Timestamp;
  customerUid: string;
  customer?: {
    name: string;
    email: string;
  };
  rating?: number;
  review?: string;
};