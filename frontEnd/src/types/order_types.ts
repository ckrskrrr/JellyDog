//Order table
export interface Order{
    order_id: number;
    customer_id: number;
    order_number: number;
    order_datetime: number;
    total_price: number;
    status: 'complete' | 'in_cart';
    store_id: number;
}

// Order_Item table
export interface OrderItem {
    order_item_id: number;
    order_id: number;
    product_id: number;
    unit_price: number;
    quantity: number;
    is_return: boolean;
}


// Order with items (for display)
export interface OrderWithItems extends Order {
    items: OrderItemWithProduct[];
}

// Order item with product details
export interface OrderItemWithProduct extends OrderItem {
    product_name: string;
    category: string;
    img_url: string;
}

// Create order request
export interface CreateOrderRequest {
    customer_id: number;
    store_id: number;
    items: {
    product_id: number;
    quantity: number;
    unit_price: number;
    }[];
}

// Return items request
export interface ReturnItemsRequest {
    order_id: number;
    order_item_ids: number[]; // Items to return
}