import { useNavigate } from 'react-router-dom';
import { useAuth } from './../context/AuthContext';
import { useCart } from './../context/CartContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, customer, logout } = useAuth();
  const { getCartCount } = useCart();
  
  const cartCount = getCartCount();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div
            className="text-2xl font-bold text-blue-600 cursor-pointer"
            onClick={() => navigate('/home')}
          >
            JellyDog
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-6">
            {/* User info */}
            {user && (
              <div className="flex items-center gap-2">
                <span className="text-gray-700">
                  {customer?.customer_name || 'Admin'}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-500 hover:underline"
                >
                  Logout
                </button>
              </div>
            )}

            {/* Profile icon */}
            <button
              onClick={() => navigate('/orders')}
              className="relative p-2 hover:bg-gray-100 rounded-full"
              title="Order History"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>

            {/* Cart icon with badge */}
            <button
              onClick={() => navigate('/cart')}
              className="relative p-2 hover:bg-gray-100 rounded-full"
              title="Shopping Cart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              
              {/* Cart count badge */}
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;