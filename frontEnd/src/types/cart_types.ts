// Cart and order types

import type { Product } from './product_types';

export interface CartItem {
  order_item_id?: number; // Optional because new items won't have this yet
  product: Product;
  quantity: number;
  unit_price: number;
}

export interface Order {
  order_id: number;
  customer_id: number;
  order_number: number;
  order_datetime: number; // timestamp
  total_price: number;
  status: 'complete' | 'in_cart';
  store_id: number;
}

export interface OrderItem {
  order_item_id: number;
  order_id: number;
  product_id: number;
  unit_price: number;
  quantity: number;
  is_return: boolean;
}

// Combined type for displaying order details with product info
export interface OrderWithItems extends Order {
  items: (OrderItem & { product: Product })[];
}