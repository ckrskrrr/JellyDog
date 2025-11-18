import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockGetOrders } from '../lib/MockOrderData';
import type { Order } from '../types/order_types';

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const { customer } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!customer) {
        setLoading(false);
        return;
      }

      try {
        const ordersData = await mockGetOrders(customer.customer_id);
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [customer]);

  const handleOrderClick = (orderId: number) => {
    navigate(`/orders/${orderId}`);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const getTotalQuantity = (order: Order) => {
    // In real app, this would come from order items
    // For now, we'll calculate from mock data
    return Math.floor(order.total_price / 30); // Rough estimate
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading orders...</div>
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
      {orders.map((order) => (
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

            {/* Quantity */}
            <div>
              <p className="text-sm text-gray-600 mb-2 font-medium">Qty</p>
              <p className="text-gray-900">{getTotalQuantity(order)}</p>
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
      ))}
    </div>
  );
};

export default OrderHistoryPage;