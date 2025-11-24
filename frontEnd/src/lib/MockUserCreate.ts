// Mock API for testing - Remove this when connecting to real backend
// Hardcoded test user:
// username="user", password="user"

import type { User, Customer } from '../types/user_types';

// Mock users database
const MOCK_USERS: { [key: string]: { user: User; customer?: Customer } } = {
  user: {
    user: {
      uid: 1,
      user_name: 'user',
      password: 'user', // In real app, this would be hashed
      role: 'customer',
    },
    customer: {
      customer_id: 1,
      uid: 1,
      customer_name: 'Test User',
      phone_number: '(123) 456-7890',
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      country: 'USA',
      zip_code: '12345',
    },
  },
};

// Mock login
export const mockLogin = async (
  username: string,
  password: string
): Promise<{ user: User; customer?: Customer }> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const userData = MOCK_USERS[username];

  if (!userData || userData.user.password !== password) {
    throw new Error('Invalid username or password');
  }

  return {
    user: userData.user,
    customer: userData.customer,
  };
};

// Mock signup
export const mockSignup = async (
  username: string,
  password: string
): Promise<{ user: User }> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Check if username already exists
  if (MOCK_USERS[username]) {
    throw new Error('Username already exists');
  }

  // Create new user
  const newUser: User = {
    uid: Object.keys(MOCK_USERS).length + 1,
    user_name: username,
    password: password,
    role: 'customer',
  };

  // Store in mock database
  MOCK_USERS[username] = { user: newUser };

  return { user: newUser };
};

// Mock create customer
export const mockCreateCustomer = async (
  uid: number,
  customer_name: string,
  phone_number: string,
  street: string,
  city: string,
  state: string,
  zip_code: string,
  country: string
): Promise<{ customer: Customer }> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const newCustomer: Customer = {
    customer_id: Object.keys(MOCK_USERS).length + 1,
    uid: uid,
    customer_name: customer_name,
    phone_number: phone_number,
    street: street,
    city: city,
    state: state,
    country: country,
    zip_code: zip_code,
  };

  // Update mock database
  const userEntry = Object.values(MOCK_USERS).find(
    (entry) => entry.user.uid === uid
  );
  if (userEntry) {
    userEntry.customer = newCustomer;
  }

  return { customer: newCustomer };
};