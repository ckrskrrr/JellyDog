import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, Customer, AuthState } from '../types/user_types';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

interface AuthContextType extends AuthState {
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateCustomer: (customerData: {
    customer_name: string;
    phone_number: string;
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomerInfo = async (uid: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/customer-info?uid=${uid}`);
      if (response.ok) {
        const customerData = await response.json();
        setCustomer(customerData);
        localStorage.setItem('customer', JSON.stringify(customerData));
      } else {
        setCustomer(null);
        localStorage.removeItem('customer');
      }
    } catch (error) {
      console.error('Failed to fetch customer info:', error);
      setCustomer(null);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchCustomerInfo(parsedUser.uid);
    }
    
    setLoading(false); // Done loading
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_name: username,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      
      const userData: User = {
        uid: data.uid,
        user_name: data.user_name,
        role: data.role,
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      await fetchCustomerInfo(data.uid);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_name: username,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Signup failed');
      }

      const data = await response.json();
      
      const userData: User = {
        uid: data.uid,
        user_name: data.user_name,
        role: data.role,
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setCustomer(null);
      localStorage.removeItem('customer');
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setCustomer(null);
    localStorage.removeItem('user');
    localStorage.removeItem('customer');
  };

  const updateCustomer = async (customerData: {
    customer_name: string;
    phone_number: string;
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  }) => {
    if (!user) throw new Error('No user logged in');

    try {
      const fullCustomerData = {
        uid: user.uid,
        ...customerData,
      };

      const method = customer ? 'PUT' : 'POST';
      const response = await fetch(`${API_BASE_URL}/customer/customer-info`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullCustomerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update customer info');
      }

      const updatedCustomer = await response.json();
      setCustomer(updatedCustomer);
      localStorage.setItem('customer', JSON.stringify(updatedCustomer));
    } catch (error) {
      console.error('Update customer failed:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    customer,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    loading,
    login,
    signup,
    logout,
    updateCustomer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};