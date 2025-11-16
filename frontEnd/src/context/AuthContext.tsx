import React, { createContext, useContext, useState, useEffect} from 'react';
import type{ ReactNode } from 'react';
import type{ User, Customer, AuthState } from '../types/user_types';

interface AuthContextType extends AuthState {
  login: (user: User, customer?: Customer) => void;
  logout: () => void;
  updateCustomer: (customer: Customer) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedCustomer = localStorage.getItem('customer');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedCustomer) {
      setCustomer(JSON.parse(savedCustomer));
    }
  }, []);

  const login = (user: User, customer?: Customer) => {
    setUser(user);
    setCustomer(customer || null);
    
    localStorage.setItem('user', JSON.stringify(user));
    if (customer) {
      localStorage.setItem('customer', JSON.stringify(customer));
    }
  };

  const logout = () => {
    setUser(null);
    setCustomer(null);
    localStorage.removeItem('user');
    localStorage.removeItem('customer');
  };

  const updateCustomer = (customer: Customer) => {
    setCustomer(customer);
    localStorage.setItem('customer', JSON.stringify(customer));
  };

  const value: AuthContextType = {
    user,
    customer,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
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