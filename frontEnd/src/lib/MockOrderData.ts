// Mock order data for testing - Remove this when connecting to real backend

import type { Order, OrderItem } from '../types/order_types';
import { MOCK_PRODUCTS } from './MockProductData';

// Mock Orders
export const MOCK_ORDERS: Order[] = [
  {
    order_id: 101,
    customer_id: 1,
    order_number: 101,
    order_datetime: new Date('2025-11-01T10:30:00').getTime(),
    total_price: 50.00,
    status: 'complete',
    store_id: 1,
  },
  {
    order_id: 102,
    customer_id: 1,
    order_number: 102,
    order_datetime: new Date('2025-11-01T14:20:00').getTime(),
    total_price: 150.00,
    status: 'complete',
    store_id: 1,
  },
  {
    order_id: 103,
    customer_id: 1,
    order_number: 103,
    order_datetime: new Date('2025-11-01T16:45:00').getTime(),
    total_price: 250.00,
    status: 'complete',
    store_id: 2,
  },
  {
    order_id: 104,
    customer_id: 1,
    order_number: 104,
    order_datetime: new Date('2025-11-01T18:10:00').getTime(),
    total_price: 350.00,
    status: 'complete',
    store_id: 1,
  },
];

// Mock Order Items
export const MOCK_ORDER_ITEMS: OrderItem[] = [
  // Order 101 items
  {
    order_item_id: 1,
    order_id: 101,
    product_id: 3, // Chip Seagull
    unit_price: 25.00,
    quantity: 2,
    is_return: false,
  },
  // Order 102 items
  {
    order_item_id: 2,
    order_id: 102,
    product_id: 1, // Birding Swallow
    unit_price: 32.00,
    quantity: 2,
    is_return: false,
  },
  {
    order_item_id: 3,
    order_id: 102,
    product_id: 9, // Fluffy Octopus
    unit_price: 28.00,
    quantity: 3,
    is_return: false,
  },
  // Order 103 items
  {
    order_item_id: 4,
    order_id: 103,
    product_id: 18, // Bashful Beige Bunny
    unit_price: 25.00,
    quantity: 5,
    is_return: false,
  },
  {
    order_item_id: 5,
    order_id: 103,
    product_id: 21, // Derreck Dog
    unit_price: 29.00,
    quantity: 3,
    is_return: false,
  },
  {
    order_item_id: 6,
    order_id: 103,
    product_id: 4, // Evelyn Swan
    unit_price: 38.00,
    quantity: 1,
    is_return: false,
  },
  // Order 104 items
  {
    order_item_id: 7,
    order_id: 104,
    product_id: 7, // Snoozling Owl
    unit_price: 33.00,
    quantity: 4,
    is_return: false,
  },
  {
    order_item_id: 8,
    order_id: 104,
    product_id: 15, // Silvie Shark
    unit_price: 32.00,
    quantity: 6,
    is_return: false,
  },
  {
    order_item_id: 9,
    order_id: 104,
    product_id: 25, // Smudge Rabbit
    unit_price: 24.00,
    quantity: 3,
    is_return: false,
  },
];

// Mock API to get all orders for a customer
export const mockGetOrders = async (customerId: number): Promise<Order[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_ORDERS.filter((order) => order.customer_id === customerId);
};

// Mock API to get order details with items
export const mockGetOrderDetail = async (orderId: number) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const order = MOCK_ORDERS.find((o) => o.order_id === orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  const orderItems = MOCK_ORDER_ITEMS.filter((item) => item.order_id === orderId).map((item) => {
    const product = MOCK_PRODUCTS.find((p) => p.product_id === item.product_id);
    return {
      ...item,
      product: product!,
    };
  });

  return {
    order,
    items: orderItems,
  };
};

// Mock API to mark items as returned
export const mockReturnItems = async (orderItemIds: number[]): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Update the mock data
  orderItemIds.forEach((itemId) => {
    const item = MOCK_ORDER_ITEMS.find((i) => i.order_item_id === itemId);
    if (item) {
      item.is_return = true;
    }
  });
};