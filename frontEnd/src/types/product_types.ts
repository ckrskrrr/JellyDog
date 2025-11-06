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
export interface NewProductData {
    product_name: string;
    category: string;
    price: number;
    image: File; // The actual image file to upload
    stock: number;
    store_id: number;
}