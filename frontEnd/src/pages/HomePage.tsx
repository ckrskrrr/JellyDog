import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { mockGetProductsWithStock, mockGetProductsByCategory } from '../lib/MockProductData';
import type { ProductWithStock } from '../types/product_types';

const HomePage = () => {
  const navigate = useNavigate();
  const { selectedStore } = useStore();
  
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Birds',
    'Ocean',
    'Pets',
  ]); // All categories selected by default

  const categories = [
    { name: 'Birds', emoji: '🐦' },
    { name: 'Ocean', emoji: '🐟' },
    { name: 'Pets', emoji: '🐶' },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedStore) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const productsData =
          selectedCategories.length === 0
            ? await mockGetProductsWithStock(selectedStore.store_id)
            : await mockGetProductsByCategory(
                selectedStore.store_id,
                selectedCategories
              );
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedStore, selectedCategories]);

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryName)) {
        return prev.filter((cat) => cat !== categoryName);
      } else {
        return [...prev, categoryName];
      }
    });
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  // If no store selected, show message
  if (!selectedStore) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please select a store first
          </h2>
          <button
            onClick={() => navigate('/select-store')}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Select Store
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar - Category Filters */}
          <div className="w-48 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-8">
              <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-3">
                {categories.map((category) => (
                  <label
                    key={category.name}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.name)}
                      onChange={() => handleCategoryToggle(category.name)}
                      className="w-4 h-4 text-cyan-400 rounded focus:ring-2 focus:ring-cyan-400"
                    />
                    <span className="text-sm text-gray-700">
                      {category.emoji} {category.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Product Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No products found in selected categories.</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-6">
                {products.map((product) => {
                  const isOutOfStock = product.stock === 0;

                  return (
                    <div
                      key={product.product_id}
                      onClick={() => handleProductClick(product.product_id)}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      {/* Product Image */}
                      <div className="relative">
                        <img
                          src={product.img_url}
                          alt={product.product_name}
                          className={`w-full h-64 object-cover ${
                            isOutOfStock ? 'opacity-40 grayscale' : ''
                          }`}
                          onError={(e) => {
                            // Fallback if image doesn't load
                            e.currentTarget.src = `https://via.placeholder.com/300x300/cccccc/666666?text=${encodeURIComponent(
                              product.product_name
                            )}`;
                          }}
                        />
                        {isOutOfStock && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <p className="text-gray font-bold text-lg">
                                SOLD OUT
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className={`font-medium mb-1 ${
                          isOutOfStock ? 'text-gray-400' : 'text-gray-900'
                        }`}>
                          {product.product_name}
                        </h3>
                        <p className={`font-bold ${
                          isOutOfStock ? 'text-gray-400' : 'text-gray-900'
                        }`}>
                          ${product.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Body text.</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;