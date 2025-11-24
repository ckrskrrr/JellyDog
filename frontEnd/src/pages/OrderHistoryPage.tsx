import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

interface Order {
  order_id: number;
  order_number: number;
  order_datetime: string;
  total_price: number;
  status: string;
  store_id: number;
  street: string;
  city: string;
  state: string;
  zip: string;
}

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const { customer } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!customer) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/orders/past_orders?customer_id=${customer.customer_id}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const ordersData = await response.json();
        setOrders(ordersData);
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [customer]);

  const handleOrderClick = (orderId: number) => {
    navigate(`/orders/${orderId}`);
  };

  const formatDate = (datetimeString: string) => {
    const date = new Date(datetimeString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
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

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">No orders found</h2>
          <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
          <button
            onClick={() => navigate('/home')}
            className="bg-gray-800 text-white px-8 py-3 rounded-md hover:bg-gray-700 transition-colors"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        // Calculate total items in order (rough estimate from total price)
        const estimatedItems = Math.max(1, Math.floor(order.total_price / 15));

        return (
          <div
            key={order.order_id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleOrderClick(order.order_id)}
          >
            <div className="grid grid-cols-4 gap-4 text-center">
              {/* Order Number */}
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Order #</p>
                <p className="text-gray-900 underline font-medium">
                  {order.order_number}
                </p>
              </div>

              {/* Date Placed */}
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Date Placed</p>
                <p className="text-gray-900">{formatDate(order.order_datetime)}</p>
              </div>

              {/* Quantity (estimated) */}
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Items</p>
                <p className="text-gray-900">{estimatedItems}</p>
              </div>

              {/* Total */}
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Total</p>
                <p className="text-gray-900 font-semibold">
                  ${order.total_price.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderHistoryPage;