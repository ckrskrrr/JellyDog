import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import logo from '../../assets/jellydog-logo.png';
import storeIcon from '../../assets/icons/Store.svg';
import userIcon from '../../assets/icons/User.svg';
import cartIcon from '../../assets/icons/Shopping cart.svg';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { getCartCount } = useCart();
  const { selectedStore } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleProfileClick = () => {
    if (isAuthenticated) navigate('/account');
    else navigate('/login');
  };

  const handleCartClick = () => {
    if (isAuthenticated) navigate('/cart');
    else navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && selectedStore) {
      // Navigate to home with search query as URL parameter
      navigate(`/home?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    // Navigate back to home without search
    navigate('/home');
  };

  return (
    <nav className="w-full h-[100px] bg-white border-b border-gray-200 flex items-center justify-between px-16 lg:px-24">
      {/* Left - Search */}
      <div className="flex-1 flex items-center">
        <form onSubmit={handleSearch} className="relative w-[280px] lg:w-[320px]">
          <input
            type="text"
            placeholder="Search a product"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-5 py-2.5 pr-10 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-gray-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl hover:text-gray-600"
            >
              ×
            </button>
          )}
        </form>
      </div>

      {/* Center - Logo */}
      <div className="flex-1 flex justify-center">
        <Link to="/home">
          <img
            src={logo}
            alt="JellyDog Logo"
            className="h-[75px] lg:h-[85px] w-auto object-contain"
          />
        </Link>
      </div>

      {/* Right - Icons */}
      <div className="flex-1 flex justify-end items-center gap-10 lg:gap-12">
        <Link to="/select-store">
          <button className="hover:opacity-70 transition-opacity">
            <img src={storeIcon} alt="Store" className="w-8 h-8" />
          </button>
        </Link>

        <button
          onClick={handleProfileClick}
          className="hover:opacity-70 transition-opacity"
        >
          <img src={userIcon} alt="Profile" className="w-8 h-8" />
        </button>

        <button
          onClick={handleCartClick}
          className="relative hover:opacity-70 transition-opacity"
        >
          <img src={cartIcon} alt="Cart" className="w-8 h-8" />
          {getCartCount() > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
              {getCartCount()}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;