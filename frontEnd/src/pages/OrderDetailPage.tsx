import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockGetOrderDetail, mockReturnItems } from '../lib/MockOrderData';
import type { Order, OrderItem } from '../types/order_types';
import type { Product } from '../types/product_types';

interface OrderItemWithProduct extends OrderItem {
  product: Product;
}

const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItemWithProduct[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [returningItems, setReturningItems] = useState(false);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!orderId) return;

      try {
        const { order: orderData, items: itemsData } = await mockGetOrderDetail(
          parseInt(orderId)
        );
        setOrder(orderData);
        setItems(itemsData);
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

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
    if (selectedItems.size === 0) return;

    setReturningItems(true);
    try {
      await mockReturnItems(Array.from(selectedItems));
      
      // Update local state to show returned status
      setItems((prevItems) =>
        prevItems.map((item) =>
          selectedItems.has(item.order_item_id)
            ? { ...item, is_return: true }
            : item
        )
      );
      
      // Clear selection
      setSelectedItems(new Set());
      
      alert('Items marked for return successfully!');
    } catch (error) {
      console.error('Error returning items:', error);
      alert('Failed to return items. Please try again.');
    } finally {
      setReturningItems(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const getStatus = (item: OrderItemWithProduct) => {
    if (item.is_return) {
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

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
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

  const hasSelectableItems = items.some((item) => !item.is_return);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Order Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Order #{order.order_number}
          </h2>
          <div className="flex gap-8 text-sm text-gray-600">
            <div>
              <span className="font-medium">Date:</span> {formatDate(order.order_datetime)}
            </div>
            <div>
              <span className="font-medium">Total:</span> ${order.total_price.toFixed(2)}
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
              {items.map((item) => {
                const itemTotal = item.unit_price * item.quantity;
                const isReturned = item.is_return;

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
                          src={item.product.img_url}
                          alt={item.product.product_name}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = `https://via.placeholder.com/48x48/cccccc/666666?text=${encodeURIComponent(
                              item.product.product_name.slice(0, 1)
                            )}`;
                          }}
                        />
                        <span className="text-gray-900 font-medium">
                          {item.product.product_name}
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