import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

interface OrderItem {
  order_item_id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  img_url: string;
  is_return: number;
}

interface OrderDetail {
  order_id: number;
  order_number: number;
  order_datetime: string;
  total_price: number;
  status: string;
  store: {
    store_id: number;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  items: OrderItem[];
}

const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { customer } = useAuth();
  
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [returningItems, setReturningItems] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!orderId || !customer) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/orders/${orderId}?customer_id=${customer.customer_id}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }

        const data = await response.json();
        setOrderDetail(data);
      } catch (err: any) {
        console.error('Error fetching order details:', err);
        setError(err.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId, customer]);

  const handleItemToggle = (orderItemId: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(orderItemId)) {
      newSelected.delete(orderItemId);
    } else {
      newSelected.add(orderItemId);
    }
    setSelectedItems(newSelected);
  };

  const handleReturn = async () => {
    if (selectedItems.size === 0 || !customer || !orderId) return;

    setReturningItems(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/orders/${orderId}/return`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: customer.customer_id,
            order_item_ids: Array.from(selectedItems),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to return items');
      }

      // Update local state to show returned status
      if (orderDetail) {
        setOrderDetail({
          ...orderDetail,
          items: orderDetail.items.map((item) =>
            selectedItems.has(item.order_item_id)
              ? { ...item, is_return: 1 }
              : item
          ),
        });
      }
      
      // Clear selection
      setSelectedItems(new Set());
      
      alert('Items marked for return successfully!');
    } catch (err: any) {
      console.error('Error returning items:', err);
      alert(err.message || 'Failed to return items. Please try again.');
    } finally {
      setReturningItems(false);
    }
  };

  const formatDate = (datetimeString: string) => {
    const date = new Date(datetimeString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const getStatus = (item: OrderItem) => {
    if (item.is_return === 1) {
      return <span className="text-gray-500">Returned</span>;
    }
    return <span className="text-green-600 font-medium">Delivered</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading order details...</div>
      </div>
    );
  }

  if (error || !orderDetail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Order not found'}
          </h2>
          <button
            onClick={() => navigate('/account')}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Back to orders
          </button>
        </div>
      </div>
    );
  }

  const hasSelectableItems = orderDetail.items.some((item) => item.is_return === 0);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Order Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Order #{orderDetail.order_number}
          </h2>
          <div className="flex gap-8 text-sm text-gray-600">
            <div>
              <span className="font-medium">Date:</span> {formatDate(orderDetail.order_datetime)}
            </div>
            <div>
              <span className="font-medium">Total:</span> ${orderDetail.total_price.toFixed(2)}
            </div>
            <div>
              <span className="font-medium">Store:</span> {orderDetail.store.city}, {orderDetail.store.state}
            </div>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  {hasSelectableItems && ''}
                </th>
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orderDetail.items.map((item) => {
                const itemTotal = item.unit_price * item.quantity;
                const isReturned = item.is_return === 1;

                return (
                  <tr key={item.order_item_id} className="hover:bg-gray-50">
                    {/* Checkbox */}
                    <td className="px-6 py-4">
                      {!isReturned && (
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.order_item_id)}
                          onChange={() => handleItemToggle(item.order_item_id)}
                          className="w-4 h-4 text-cyan-400 rounded focus:ring-2 focus:ring-cyan-400"
                        />
                      )}
                    </td>

                    {/* Quantity */}
                    <td className="px-6 py-4 text-gray-900">{item.quantity}</td>

                    {/* Item Name with Image */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={item.img_url}
                          alt={item.product_name}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = `https://via.placeholder.com/48x48/cccccc/666666?text=${encodeURIComponent(
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

                    {/* Status */}
                    <td className="px-6 py-4">{getStatus(item)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Return Button and Back Button */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/account')}
            className="text-gray-600 hover:text-gray-800 underline"
          >
            ← Back to Orders
          </button>

          {hasSelectableItems && (
            <button
              onClick={handleReturn}
              disabled={selectedItems.size === 0 || returningItems}
              className={`px-12 py-3 rounded-lg text-lg font-medium transition-colors ${
                selectedItems.size === 0 || returningItems
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {returningItems ? 'Processing...' : 'Return'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;