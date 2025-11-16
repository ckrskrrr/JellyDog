// Mock product data for testing - Remove this when connecting to real backend

import type { Product, StoreInventory, ProductWithStock } from '../types/product_types';

// Mock Products - All products from assets folder
export const MOCK_PRODUCTS: Product[] = [
  // Birds category (8 products)
  {
    product_id: 1,
    product_name: 'Birding Swallow',
    category: 'Birds',
    price: 32.00,
    img_url: '/src/assets/product_images/Birds/Birding_Swallow.jpg',
  },
  {
    product_id: 2,
    product_name: 'Bodacious Beak Toucan',
    category: 'Birds',
    price: 36.00,
    img_url: '/src/assets/product_images/Birds/Bodacious_Beak_Toucan.jpg',
  },
  {
    product_id: 3,
    product_name: 'Chip Seagull',
    category: 'Birds',
    price: 30.00,
    img_url: '/src/assets/product_images/Birds/Chip_Seagull.jpg',
  },
  {
    product_id: 4,
    product_name: 'Evelyn Swan',
    category: 'Birds',
    price: 38.00,
    img_url: '/src/assets/product_images/Birds/Evelyn_Swan.jpg',
  },
  {
    product_id: 5,
    product_name: 'Fou Fou Ostrich',
    category: 'Birds',
    price: 40.00,
    img_url: '/src/assets/product_images/Birds/Fou_Fou_Ostrich.jpg',
  },
  {
    product_id: 6,
    product_name: 'Plum Robin',
    category: 'Birds',
    price: 28.00,
    img_url: '/src/assets/product_images/Birds/Plum_Robin.jpg',
  },
  {
    product_id: 7,
    product_name: 'Snoozling Owl',
    category: 'Birds',
    price: 33.00,
    img_url: '/src/assets/product_images/Birds/Snoozling_Owl.jpg',
  },
  {
    product_id: 8,
    product_name: 'Theo Turkey',
    category: 'Birds',
    price: 35.00,
    img_url: '/src/assets/product_images/Birds/Theo_Turkey.jpg',
  },
  // Ocean category (9 products)
  {
    product_id: 9,
    product_name: 'Fluffy Octopus',
    category: 'Ocean',
    price: 28.00,
    img_url: '/src/assets/product_images/Ocean/Fluffy_Octopus.jpg',
  },
  {
    product_id: 10,
    product_name: 'Fluffy Starfish',
    category: 'Ocean',
    price: 26.00,
    img_url: '/src/assets/product_images/Ocean/Fluffy_Starfish.jpg',
  },
  {
    product_id: 11,
    product_name: 'Fluffy Turtle',
    category: 'Ocean',
    price: 27.00,
    img_url: '/src/assets/product_images/Ocean/Fluffy_Turtle.jpg',
  },
  {
    product_id: 12,
    product_name: 'Lois Lionfish',
    category: 'Ocean',
    price: 29.00,
    img_url: '/src/assets/product_images/Ocean/Lois_Lionfish.jpg',
  },
  {
    product_id: 13,
    product_name: 'Obbie Octopus',
    category: 'Ocean',
    price: 30.00,
    img_url: '/src/assets/product_images/Ocean/Obbie_Octopus.jpg',
  },
  {
    product_id: 14,
    product_name: 'Odell Octopus',
    category: 'Ocean',
    price: 31.00,
    img_url: '/src/assets/product_images/Ocean/Odell_Octopus.jpg',
  },
  {
    product_id: 15,
    product_name: 'Silvie Shark',
    category: 'Ocean',
    price: 32.00,
    img_url: '/src/assets/product_images/Ocean/Silvie_Shark.jpg',
  },
  {
    product_id: 16,
    product_name: 'Timmy Turtle',
    category: 'Ocean',
    price: 26.00,
    img_url: '/src/assets/product_images/Ocean/Timmy_Turtle.jpg',
  },
  {
    product_id: 17,
    product_name: 'Tully Turtle',
    category: 'Ocean',
    price: 27.00,
    img_url: '/src/assets/product_images/Ocean/Tully_Turtle.jpg',
  },
  // Pets category (9 products)
  {
    product_id: 18,
    product_name: 'Bashful Beige Bunny',
    category: 'Pets',
    price: 25.00,
    img_url: '/src/assets/product_images/Pets/Bashful_Beige_Bunny.jpg',
  },
  {
    product_id: 19,
    product_name: 'Bashful Cream Bunny',
    category: 'Pets',
    price: 25.00,
    img_url: '/src/assets/product_images/Pets/Bashful_Cream_Bunny.jpg',
  },
  {
    product_id: 20,
    product_name: 'Bashful Kitten Original',
    category: 'Pets',
    price: 27.00,
    img_url: '/src/assets/product_images/Pets/Bashful_Kitten_Original.jpg',
  },
  {
    product_id: 21,
    product_name: 'Derreck Dog',
    category: 'Pets',
    price: 29.00,
    img_url: '/src/assets/product_images/Pets/Derreck_Dog.jpg',
  },
  {
    product_id: 22,
    product_name: 'Ewert Sheepdog',
    category: 'Pets',
    price: 30.00,
    img_url: '/src/assets/product_images/Pets/Ewert_Sheepdog.jpg',
  },
  {
    product_id: 23,
    product_name: 'Jellycat Jack',
    category: 'Pets',
    price: 28.00,
    img_url: '/src/assets/product_images/Pets/Jellycat_Jack.jpg',
  },
  {
    product_id: 24,
    product_name: 'Otto Sausage Dog',
    category: 'Pets',
    price: 26.00,
    img_url: '/src/assets/product_images/Pets/Otto_Sausage_Dog.jpg',
  },
  {
    product_id: 25,
    product_name: 'Smudge Rabbit',
    category: 'Pets',
    price: 24.00,
    img_url: '/src/assets/product_images/Pets/Smudge_Rabbit.jpg',
  },
  {
    product_id: 26,
    product_name: 'Spookipaws Cat',
    category: 'Pets',
    price: 27.00,
    img_url: '/src/assets/product_images/Pets/Spookipaws_Cat.jpg',
  },
];

// Mock Store Inventory - Different stock levels per store for all 26 products
export const MOCK_INVENTORY: StoreInventory[] = [
  // Store A (LA) - Good stock
  { store_id: 1, product_id: 1, stock: 10 },
  { store_id: 1, product_id: 2, stock: 8 },
  { store_id: 1, product_id: 3, stock: 12 },
  { store_id: 1, product_id: 4, stock: 5 },
  { store_id: 1, product_id: 5, stock: 7 },
  { store_id: 1, product_id: 6, stock: 9 },
  { store_id: 1, product_id: 7, stock: 0 }, // Out of stock
  { store_id: 1, product_id: 8, stock: 6 },
  { store_id: 1, product_id: 9, stock: 11 },
  { store_id: 1, product_id: 10, stock: 4 },
  { store_id: 1, product_id: 11, stock: 8 },
  { store_id: 1, product_id: 12, stock: 0 }, // Out of stock
  { store_id: 1, product_id: 13, stock: 9 },
  { store_id: 1, product_id: 14, stock: 7 },
  { store_id: 1, product_id: 15, stock: 5 },
  { store_id: 1, product_id: 16, stock: 10 },
  { store_id: 1, product_id: 17, stock: 6 },
  { store_id: 1, product_id: 18, stock: 12 },
  { store_id: 1, product_id: 19, stock: 8 },
  { store_id: 1, product_id: 20, stock: 0 }, // Out of stock
  { store_id: 1, product_id: 21, stock: 11 },
  { store_id: 1, product_id: 22, stock: 7 },
  { store_id: 1, product_id: 23, stock: 9 },
  { store_id: 1, product_id: 24, stock: 5 },
  { store_id: 1, product_id: 25, stock: 10 },
  { store_id: 1, product_id: 26, stock: 8 },

  // Store B (NYC) - Medium stock
  { store_id: 2, product_id: 1, stock: 5 },
  { store_id: 2, product_id: 2, stock: 3 },
  { store_id: 2, product_id: 3, stock: 7 },
  { store_id: 2, product_id: 4, stock: 0 }, // Out of stock
  { store_id: 2, product_id: 5, stock: 4 },
  { store_id: 2, product_id: 6, stock: 6 },
  { store_id: 2, product_id: 7, stock: 8 },
  { store_id: 2, product_id: 8, stock: 2 },
  { store_id: 2, product_id: 9, stock: 5 },
  { store_id: 2, product_id: 10, stock: 0 }, // Out of stock
  { store_id: 2, product_id: 11, stock: 9 },
  { store_id: 2, product_id: 12, stock: 3 },
  { store_id: 2, product_id: 13, stock: 7 },
  { store_id: 2, product_id: 14, stock: 4 },
  { store_id: 2, product_id: 15, stock: 0 }, // Out of stock
  { store_id: 2, product_id: 16, stock: 6 },
  { store_id: 2, product_id: 17, stock: 8 },
  { store_id: 2, product_id: 18, stock: 5 },
  { store_id: 2, product_id: 19, stock: 9 },
  { store_id: 2, product_id: 20, stock: 4 },
  { store_id: 2, product_id: 21, stock: 0 }, // Out of stock
  { store_id: 2, product_id: 22, stock: 7 },
  { store_id: 2, product_id: 23, stock: 3 },
  { store_id: 2, product_id: 24, stock: 6 },
  { store_id: 2, product_id: 25, stock: 8 },
  { store_id: 2, product_id: 26, stock: 5 },

  // Store C (Pittsburgh) - Varied stock
  { store_id: 3, product_id: 1, stock: 0 }, // Out of stock
  { store_id: 3, product_id: 2, stock: 12 },
  { store_id: 3, product_id: 3, stock: 4 },
  { store_id: 3, product_id: 4, stock: 7 },
  { store_id: 3, product_id: 5, stock: 0 }, // Out of stock
  { store_id: 3, product_id: 6, stock: 10 },
  { store_id: 3, product_id: 7, stock: 6 },
  { store_id: 3, product_id: 8, stock: 8 },
  { store_id: 3, product_id: 9, stock: 0 }, // Out of stock
  { store_id: 3, product_id: 10, stock: 11 },
  { store_id: 3, product_id: 11, stock: 5 },
  { store_id: 3, product_id: 12, stock: 9 },
  { store_id: 3, product_id: 13, stock: 7 },
  { store_id: 3, product_id: 14, stock: 0 }, // Out of stock
  { store_id: 3, product_id: 15, stock: 8 },
  { store_id: 3, product_id: 16, stock: 6 },
  { store_id: 3, product_id: 17, stock: 10 },
  { store_id: 3, product_id: 18, stock: 4 },
  { store_id: 3, product_id: 19, stock: 0 }, // Out of stock
  { store_id: 3, product_id: 20, stock: 9 },
  { store_id: 3, product_id: 21, stock: 7 },
  { store_id: 3, product_id: 22, stock: 11 },
  { store_id: 3, product_id: 23, stock: 0 }, // Out of stock
  { store_id: 3, product_id: 24, stock: 8 },
  { store_id: 3, product_id: 25, stock: 5 },
  { store_id: 3, product_id: 26, stock: 10 },
];

// Mock API to fetch products with stock for a specific store
export const mockGetProductsWithStock = async (
  storeId: number
): Promise<ProductWithStock[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const productsWithStock = MOCK_PRODUCTS.map((product) => {
    const inventory = MOCK_INVENTORY.find(
      (inv) => inv.store_id === storeId && inv.product_id === product.product_id
    );

    return {
      ...product,
      stock: inventory?.stock || 0,
    };
  });

  return productsWithStock;
};

// Mock API to fetch products by category with stock
export const mockGetProductsByCategory = async (
  storeId: number,
  categories: string[]
): Promise<ProductWithStock[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const productsWithStock = MOCK_PRODUCTS.filter((product) =>
    categories.includes(product.category)
  ).map((product) => {
    const inventory = MOCK_INVENTORY.find(
      (inv) => inv.store_id === storeId && inv.product_id === product.product_id
    );

    return {
      ...product,
      stock: inventory?.stock || 0,
    };
  });

  return productsWithStock;
};