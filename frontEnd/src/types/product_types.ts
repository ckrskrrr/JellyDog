//types for product, sick

export interface Product{
    product_id: number;
    product_name: string;
    category: string;
    price: number;
    img_url: string;
}

export interface Store {
    store_id: number;
    street: string;
    city: string;
    state: string;
    zip: string;
}

export interface StoreInventory {
    store_id: number;
    product_id: number;
    stock: number;
}

export interface ProductWithStock extends Product {
    stock: number;
}

// For admin adding new products
export interface CreateProductRequest {
    product_name: string;
    category: string;
    price: number;
    image: File; // The actual image file to upload
    stock: number;
    store_id: number;
}

// Add existing product to store (admin)
export interface AddProductToStoreRequest {
    product_id: number;
    store_id: number;
    stock: number;
}

// Update product request (admin)
export interface UpdateProductRequest {
    product_id: number;
    product_name?: string;
    category?: string;
    price?: number;
    img_url?: string;
    stock?: number; // Store-specific
}