import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

const CartPage = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, getCartTotal, loading } = useCart();
  const { customer } = useAuth();
  const { selectedStore } = useStore();

  const handleCheckout = async () => {
    if (!customer || !selectedStore) {
      alert('Please log in and select a store');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customer.customer_id,
          store_id: selectedStore.store_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Checkout failed');
      }

      // Navigate to success page
      navigate('/checkout-success');
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.message || 'Failed to complete checkout');
    }
  };

  const handleUpdateQuantity = async (orderItemId: number, newQuantity: number, currentStock?: number) => {
    // Validate against stock if available
    if (currentStock !== undefined && newQuantity > currentStock) {
      alert(`Cannot add more than ${currentStock} items (current stock limit)`);
      return;
    }

    try {
      await updateQuantity(orderItemId, newQuantity);
    } catch (error: any) {
      alert(error.message || 'Failed to update quantity');
    }
  };

  const handleRemove = async (orderItemId: number) => {
    try {
      await removeFromCart(orderItemId);
    } catch (error: any) {
      alert(error.message || 'Failed to remove item');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading cart...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-6">Add some items to get started!</p>
          <button
            onClick={() => navigate('/home')}
            className="bg-gray-800 text-white px-8 py-3 rounded-md hover:bg-gray-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Your Cart
        </h1>

        {/* Cart Items Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Qty
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Item Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Unit Price
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Total
                </th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => {
                const itemTotal = item.unit_price * item.quantity;

                return (
                  <tr key={item.order_item_id} className="hover:bg-gray-50">
                    {/* Quantity Controls */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.order_item_id, item.quantity - 1, item.stock)
                          }
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <span className="text-gray-600 text-lg">−</span>
                        </button>
                        <span className="text-gray-900 font-medium min-w-[2ch] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.order_item_id, item.quantity + 1, item.stock)
                          }
                          disabled={item.stock !== undefined && item.quantity >= item.stock}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Increase quantity"
                          title={item.stock !== undefined && item.quantity >= item.stock ? `Only ${item.stock} available in stock` : ''}
                        >
                          <span className="text-gray-600 text-lg">+</span>
                        </button>
                      </div>
                    </td>

                    {/* Item Name with Image */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={item.img_url}
                          alt={item.product_name}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = `https://via.placeholder.com/64x64/cccccc/666666?text=${encodeURIComponent(
                              item.product_name.slice(0, 1)
                            )}`;
                          }}
                        />
                        <span className="text-gray-900 font-medium">
                          {item.product_name}
                        </span>
                      </div>
                    </td>

                    {/* Unit Price */}
                    <td className="px-6 py-4 text-gray-900">
                      ${item.unit_price.toFixed(2)}
                    </td>

                    {/* Total */}
                    <td className="px-6 py-4 text-gray-900 font-semibold">
                      ${itemTotal.toFixed(2)}
                    </td>

                    {/* Remove Button */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleRemove(item.order_item_id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Cart Summary & Checkout */}
        <div className="flex justify-between items-center">
          {/* Continue Shopping */}
          <button
            onClick={() => navigate('/home')}
            className="text-gray-600 hover:text-gray-800 underline"
          >
            ← Continue Shopping
          </button>

          {/* Checkout Section */}
          <div className="text-right">
            <div className="mb-4">
              <span className="text-gray-600 text-lg mr-4">Total:</span>
              <span className="text-gray-900 text-3xl font-bold">
                ${getCartTotal().toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="bg-gray-800 text-white px-12 py-4 rounded-lg text-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Check Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;