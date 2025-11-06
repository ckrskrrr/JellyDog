import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import type{ Store, ProductWithStock } from '../types/product_types';

const HomePage = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { selectedStore, setSelectedStore } = useStore();

  // Fetch all stores on mount
  useEffect(() => {
    fetchStores();
  }, []);

  // Fetch products when store is selected
  useEffect(() => {
    if (selectedStore) {
      fetchProducts(selectedStore.store_id);
    }
  }, [selectedStore]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const fetchStores = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/stores');
      const data = await response.json();
      setStores(data);
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const fetchProducts = async (storeId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/products?store_id=${storeId}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStoreChange = (store: Store) => {
    if (selectedStore?.store_id !== store.store_id) {
      // Show warning if switching stores
      if (selectedStore) {
        const confirmed = window.confirm(
          `Switching to ${store.city} store. Your current cart will be saved. Continue?`
        );
        if (!confirmed) return;
      }
      setSelectedStore(store);
    }
    setShowStoreModal(false);
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Store Selection Bar */}
        <div className="mb-8 flex items-center justify-between bg-white p-4 rounded-lg shadow">
          <div>
            <h2 className="text-lg font-semibold">Selected Store:</h2>
            {selectedStore ? (
              <p className="text-gray-600">
                {selectedStore.street}, {selectedStore.city}, {selectedStore.state} {selectedStore.zip}
              </p>
            ) : (
              <p className="text-red-500">Please select a store to start shopping</p>
            )}
          </div>
          <button
            onClick={() => setShowStoreModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            {selectedStore ? 'Change Store' : 'Select Store'}
          </button>
        </div>

        {/* Products Grid */}
        {selectedStore ? (
          loading ? (
            <div className="text-center py-20">
              <p className="text-gray-500">Loading products...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.product_id}
                  onClick={() => handleProductClick(product.product_id)}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer overflow-hidden"
                >
                  <img
                    src={product.img_url}
                    alt={product.product_name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{product.product_name}</h3>
                    <p className="text-gray-500 text-sm mb-2">{product.category}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-blue-600 font-bold">${product.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500">No products available at this store</p>
            </div>
          )
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500">Please select a store to view products</p>
          </div>
        )}
      </div>

      {/* Store Selection Modal */}
      {showStoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Select a Store</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {stores.map((store) => (
                <button
                  key={store.store_id}
                  onClick={() => handleStoreChange(store)}
                  className={`w-full text-left p-4 rounded-lg border-2 hover:border-blue-500 transition ${
                    selectedStore?.store_id === store.store_id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <p className="font-semibold">{store.city} Store</p>
                  <p className="text-sm text-gray-600">
                    {store.street}, {store.city}, {store.state} {store.zip}
                  </p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowStoreModal(false)}
              className="mt-4 w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Admin Floating Add Button */}
      {isAdmin && (
        <button
          onClick={() => {/* TODO: Open add product modal */}}
          className="fixed bottom-8 right-8 bg-blue-500 text-white w-14 h-14 rounded-full shadow-lg hover:bg-blue-600 flex items-center justify-center text-3xl"
          title="Add Product"
        >
          +
        </button>
      )}
    </div>
  );
};

export default HomePage;