import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useStore } from './StoreContext';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

interface CartItem {
  order_item_id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  img_url: string;
  stock?: number; // Optional, for display purposes
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: number, quantity: number, price: number) => Promise<void>;
  removeFromCart: (orderItemId: number) => Promise<void>;
  updateQuantity: (orderItemId: number, quantity: number) => Promise<void>;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { customer } = useAuth();
  const { selectedStore } = useStore();

  // Fetch cart from backend when customer or store changes
  const fetchCart = async () => {
    if (!customer || !selectedStore) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/cart?customer_id=${customer.customer_id}&store_id=${selectedStore.store_id}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const data = await response.json();
      const cartItems = data.items || [];

      // Fetch stock info for each item
      const itemsWithStock = await Promise.all(
        cartItems.map(async (item: CartItem) => {
          try {
            const productResponse = await fetch(
              `${API_BASE_URL}/products/?store_id=${selectedStore.store_id}&product_id=${item.product_id}`
            );
            
            if (productResponse.ok) {
              const productData = await productResponse.json();
              return { ...item, stock: productData.stock };
            }
            return item;
          } catch (error) {
            console.error(`Failed to fetch stock for product ${item.product_id}:`, error);
            return item;
          }
        })
      );

      setItems(itemsWithStock);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Load cart when customer or store changes
  useEffect(() => {
    fetchCart();
  }, [customer, selectedStore]);

  const addToCart = async (productId: number, quantity: number, price: number) => {
    if (!customer || !selectedStore) {
      throw new Error('Must be logged in and have a store selected');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cart/add_to_cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customer.customer_id,
          product_id: productId,
          quantity: quantity,
          store_id: selectedStore.store_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add to cart');
      }

      // Refresh cart after adding
      await fetchCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (orderItemId: number, quantity: number) => {
    if (!customer) {
      throw new Error('Must be logged in');
    }

    if (quantity <= 0) {
      await removeFromCart(orderItemId);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cart/items/${orderItemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customer.customer_id,
          quantity: quantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update quantity');
      }

      // Update local state immediately for better UX
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.order_item_id === orderItemId ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  const removeFromCart = async (orderItemId: number) => {
    if (!customer) {
      throw new Error('Must be logged in');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cart/items/${orderItemId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customer.customer_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove from cart');
      }

      // Update local state immediately
      setItems((prevItems) =>
        prevItems.filter((item) => item.order_item_id !== orderItemId)
      );
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => total + item.unit_price * item.quantity, 0);
  };

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const value: CartContextType = {
    items,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};