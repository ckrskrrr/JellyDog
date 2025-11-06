import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderDetailPage from './pages/OrderDetailPage';

import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Route>
          <Route path = "/" element = {<Navigate to="/login"/>}/>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout-success" element={<CheckoutSuccessPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
      </Route>

    </Router>
  )
}

export default App
