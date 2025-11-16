import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { MOCK_PRODUCTS, MOCK_INVENTORY } from '../lib/MockProductData';
import type { ProductWithStock } from '../types/product_types';

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { selectedStore } = useStore();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<ProductWithStock | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  //use 3 img irl but same pic for the sake of this project
  const productImages = product ? [product.img_url, product.img_url, product.img_url] : [];

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId || !selectedStore) {
        setLoading(false);
        return;
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      const foundProduct = MOCK_PRODUCTS.find(
        (p) => p.product_id === parseInt(productId)
      );

      if (foundProduct) {
        const inventory = MOCK_INVENTORY.find(
          (inv) =>
            inv.store_id === selectedStore.store_id &&
            inv.product_id === foundProduct.product_id
        );

        setProduct({
          ...foundProduct,
          stock: inventory?.stock || 0,
        });
      }

      setLoading(false);
    };

    fetchProduct();
  }, [productId, selectedStore]);

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleAddToCart = () => {
    if (product && product.stock > 0) {
      addToCart(product, quantity, product.stock);
      // Show success feedback or navigate to cart
      alert(`Added ${quantity} ${product.product_name} to cart!`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Product not found
          </h2>
          <button
            onClick={() => navigate('/home')}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Back to products
          </button>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-8 py-12">
        {/* Image Carousel Section */}
        <div className="relative mb-12">
          {/* Main Image with Navigation Arrows */}
          <div className="relative w-full h-[600px] flex items-center justify-center bg-white">
            {/* Previous Button */}
            <button
              onClick={handlePreviousImage}
              className="absolute left-8 z-10 w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
              aria-label="Previous image"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Product Image */}
            <img
              src={productImages[currentImageIndex]}
              alt={product.product_name}
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                e.currentTarget.src = `https://via.placeholder.com/600x600/cccccc/666666?text=${encodeURIComponent(
                  product.product_name
                )}`;
              }}
            />

            {/* Next Button */}
            <button
              onClick={handleNextImage}
              className="absolute right-8 z-10 w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
              aria-label="Next image"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Image Indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {productImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-gray-800' : 'bg-gray-300'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Product Info Section */}
        <div className="flex items-start justify-between">
          {/* Left: Product Name & Price */}
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              {product.product_name}
            </h1>
            <p className="text-4xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </p>
          </div>

          {/* Right: Stock & Add to Cart */}
          <div className="text-right">
            {/* Stock Status */}
            {isOutOfStock ? (
              <p className="text-2xl font-bold text-red-600 mb-4">
                Out of Stock
              </p>
            ) : (
              <p className="text-xl mb-4">
                <span className="font-bold text-green-600">In-stock:</span>{' '}
                <span className="text-gray-900">{product.stock} left</span>
              </p>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`
                px-12 py-4 rounded-lg text-white text-xl font-medium transition-colors
                ${
                  isOutOfStock
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gray-800 hover:bg-gray-700'
                }
              `}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;