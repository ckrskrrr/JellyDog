import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CheckoutSuccessPage = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const hasCleared = useRef(false);

  useEffect(() => {
    // Clear the cart only once when component mounts
    if (!hasCleared.current) {
      clearCart();
      hasCleared.current = true;
    }
  }, []); // Empty dependency array - only run once

  const handleViewOrders = () => {
    navigate('/account');
  };

  const handleContinueShopping = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* Success Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Order Placed!!
        </h1>
        
        <p className="text-xl text-gray-600 mb-12">
          Thank you for your purchase! Your order has been successfully placed.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleViewOrders}
            className="bg-gray-800 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-700 transition-colors"
          >
            View Orders
          </button>
          <button
            onClick={handleContinueShopping}
            className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;