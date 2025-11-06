//user authentication and customer types

export interface User{
    uid: number;
    role: 'customer' | 'admin';
}

export interface Customer{
    customer_id: number;
    customer_name: string;
    phone_number: number;
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    uid: number;
}

export interface LoginCredentials{
    username: string;
    password: string;
}

export interface SignUpData{
    username: string;
    password: string;
    confirmPassword: string;
    customer_name: string;
    phone_number: number;
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
}
