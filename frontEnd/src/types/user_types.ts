//user authentication and customer types

export interface User{
    uid: number;
    user_name: string;
    password: string;
    role: 'customer' | 'admin';
}

export interface Customer{
    customer_id: number;
    customer_name: string;
    phone_number: string;
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    uid: number;
}

export interface AuthState{
    user: User | null;
    customer: Customer | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
}


export interface LoginRequest{
    username: string;
    password: string;
}

export interface SignUpRequest{
    user_name: string;
    password: string;
    confirmPassword: string;
}

export interface CustomerInfoRequest {
    customer_name: string;
    phone_number: string;
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
}

// Update customer info (partial update)
export interface UpdateCustomerRequest {
    customer_name?: string;
    phone_number?: string;
    street?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
  }