// Cart and order types
import type { Product } from './product_types';

// Cart item (frontend state)
export interface CartItem {
  product: Product;
  quantity: number;
  stock: number; // Available stock at selected store
}

// Cart state
export interface CartState {
  items: CartItem[];
  store_id: number | null;
}

// Add to cart request
export interface AddToCartRequest {
  product_id: number;
  quantity: number;
}