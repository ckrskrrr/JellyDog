import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

interface ProductWithStock {
  product_id: number;
  product_name: string;
  category: string;
  price: number;
  img_url: string;
  stock: number;
}

// Helper function to convert GitHub URLs to raw format
const fixGitHubImageUrl = (url: string): string => {
  if (url.includes('github.com') && url.includes('/blob/')) {
    return url
      .replace('https://github.com/', 'https://raw.githubusercontent.com/')
      .replace('/blob/', '/');
  }
  return url;
};

const HomePage = () => {
  const navigate = useNavigate();
  const { selectedStore } = useStore();
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Birds',
    'Ocean',
    'Pets',
  ]); // All categories selected by default

  const categories = [
    { name: 'Birds', emoji: '🦜' },
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
      setError('');
      try {
        let productsData;
        
        // Use search endpoint if search query exists
        if (searchQuery.trim()) {
          const response = await fetch(
            `${API_BASE_URL}/products/search?store_id=${selectedStore.store_id}&q=${encodeURIComponent(searchQuery)}`
          );
          
          if (!response.ok) {
            throw new Error('Failed to search products');
          }
          
          productsData = await response.json();
        } else {
          // Regular product fetch
          const response = await fetch(
            `${API_BASE_URL}/stores/products?store_id=${selectedStore.store_id}`
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch products');
          }
          
          productsData = await response.json();
        }
        
        // Filter by selected categories on the frontend (only if not searching)
        const filteredProducts = searchQuery.trim() 
          ? productsData // Show all search results regardless of category
          : selectedCategories.length === 0
            ? productsData
            : productsData.filter((p: ProductWithStock) => selectedCategories.includes(p.category));
        
        setProducts(filteredProducts);
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedStore, selectedCategories, searchQuery]);

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

  const handleStockAdjustment = async (productId: number, adjustment: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigating to product detail
    
    if (!selectedStore) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/inventory/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: selectedStore.store_id,
          product_id: productId,
          adjustment: adjustment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to adjust stock');
      }

      const data = await response.json();
      
      // Update local state with new stock
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.product_id === productId ? { ...p, stock: data.new_stock } : p
        )
      );
    } catch (err: any) {
      console.error('Error adjusting stock:', err);
      alert(err.message || 'Failed to adjust stock');
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Try again
          </button>
        </div>
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
            {/* Search Results Header */}
            {searchQuery && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Search results for "{searchQuery}"
                </h2>
                <p className="text-gray-600 mt-1">
                  Found {products.length} {products.length === 1 ? 'product' : 'products'}
                </p>
              </div>
            )}
            
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  {searchQuery 
                    ? `No products found matching "${searchQuery}"`
                    : 'No products found in selected categories.'
                  }
                </p>
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
                          src={fixGitHubImageUrl(product.img_url)}
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
                        
                        {/* Admin Stock Controls */}
                        {isAdmin && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                Stock: <span className="font-semibold text-gray-900">{product.stock}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => handleStockAdjustment(product.product_id, -1, e)}
                                  disabled={product.stock === 0}
                                  className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Decrease stock by 1"
                                >
                                  −
                                </button>
                                <button
                                  onClick={(e) => handleStockAdjustment(product.product_id, 1, e)}
                                  className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors"
                                  title="Increase stock by 1"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {!isAdmin && <p className="text-xs text-gray-500 mt-1">Body text.</p>}
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