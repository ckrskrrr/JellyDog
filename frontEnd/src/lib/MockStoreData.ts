// Mock store data for testing - Remove this when connecting to real backend

import type{ Store } from '../types/product_types';

export const MOCK_STORES: Store[] = [
  {
    store_id: 1,
    street: '123 Fashion Ave',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90001',
  },
  {
    store_id: 2,
    street: '456 Broadway',
    city: 'New York',
    state: 'NY',
    zip: '10001',
  },
  {
    store_id: 3,
    street: '789 Liberty Ave',
    city: 'Pittsburgh',
    state: 'PA',
    zip: '15222',
  },
];

// Mock API to fetch stores
export const mockGetStores = async (): Promise<Store[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_STORES;
};