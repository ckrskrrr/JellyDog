import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type{ User, Customer } from '../types/user_types';

interface AuthContextType {
  user: User | null;
  customer: Customer | null;
  isAdmin: boolean;
  login: (user: User, customer?: Customer) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);

  const login = (userData: User, customerData?: Customer) => {
    setUser(userData);
    if (customerData) {
      setCustomer(customerData);
    }
  };

  const logout = () => {
    setUser(null);
    setCustomer(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, customer, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};