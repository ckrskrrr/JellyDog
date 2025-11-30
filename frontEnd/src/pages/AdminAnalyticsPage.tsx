import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

const getStatusClasses = (status: string) => {
  switch (status) {
    case 'complete':
      return 'bg-green-100 text-green-800';
    case 'in cart':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

interface TopSeller {
  product_id: number;
  product_name: string;
  category: string;
  price: number;
  img_url: string;
  total_sold: number;
}

interface StorePerformance {
  store_id: number;
  state: string;
  city: string;
  order_count: number;
  total_revenue: number;
}

interface Overview {
  total_revenue: number;
  total_orders: number;
  total_products_sold: number;
}

interface ReturnRate {
  total_items_sold: number;
  total_items_returned: number;
  return_rate_percent: number;
  revenue_lost: number;
  top_returned_products: {
    product_id: number;
    product_name: string;
    category: string;
    img_url: string;
    total_sold: number;
    total_returned: number;
    return_rate: number;
  }[];
}

interface InventoryHealth {
  out_of_stock: InventoryItem[];
  low_stock: InventoryItem[];
  overstocked: InventoryItem[];
}

interface InventoryItem {
  product_id: number;
  product_name: string;
  img_url: string;
  store_id: number;
  city: string;
  state: string;
  stock: number;
}

interface Order {
  order_id: number;
  order_number: number;
  order_datetime: string;
  total_price: number;
  status: string;
  customer_name: string;
  user_name: string;
  store_id: number;
  city: string;
  state: string;
}

const COLORS = ['#6eed37', '#0099ff', '#fdaa2e', '#FF8042', '#716be6'];

const AdminAnalyticsPage = () => {
  const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
  const [storePerformance, setStorePerformance] = useState<StorePerformance[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [returnRate, setReturnRate] = useState<ReturnRate | null>(null);
  const [inventoryHealth, setInventoryHealth] = useState<InventoryHealth | null>(null);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Collapsible sections state
  const [showInventoryDetails, setShowInventoryDetails] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch all analytics data
        const [topSellersRes, storePerformanceRes, overviewRes, returnRateRes, inventoryRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/stats/top-sellers?limit=5`),
          fetch(`${API_BASE_URL}/stats/best-region`),
          fetch(`${API_BASE_URL}/stats/overview`),
          fetch(`${API_BASE_URL}/stats/return-rate`),
          fetch(`${API_BASE_URL}/stats/inventory-health`),
          fetch(`${API_BASE_URL}/stats/all-orders`),
        ]);

        if (!topSellersRes.ok || !storePerformanceRes.ok || !overviewRes.ok || !returnRateRes.ok || !inventoryRes.ok || !ordersRes.ok) {
          throw new Error('Failed to fetch analytics');
        }

        const [topSellersData, storePerformanceData, overviewData, returnRateData, inventoryData, ordersData] = await Promise.all([
          topSellersRes.json(),
          storePerformanceRes.json(),
          overviewRes.json(),
          returnRateRes.json(),
          inventoryRes.json(),
          ordersRes.json(),
        ]);

        setTopSellers(topSellersData);
        setStorePerformance(storePerformanceData);
        setOverview(overviewData);
        setReturnRate(returnRateData);
        setInventoryHealth(inventoryData);
        setAllOrders(ordersData);
      } catch (err: any) {
        console.error('Error fetching analytics:', err);
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const formatDate = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading analytics...</div>
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

  // Prepare data for charts
  const storeRevenueData = storePerformance.map(store => ({
    name: `${store.city}, ${store.state}`,
    revenue: store.total_revenue,
    orders: store.order_count,
  }));

  const categoryData = topSellers.reduce((acc, product) => {
    const existing = acc.find(item => item.name === product.category);
    if (existing) {
      existing.value += product.total_sold;
    } else {
      acc.push({ name: product.category, value: product.total_sold });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  return (
    <div className="space-y-8 max-w-[1600px]">
      {/* Overview Cards */}
      {overview && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
              <p className="text-3xl font-bold" style={{ color: '#6eed37' }}>
                ${overview.total_revenue.toFixed(2)}
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-2">Total Orders</p>
              <p className="text-3xl font-bold" style={{ color: '#0099ff' }}>
                {overview.total_orders}
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-2">Products Sold</p>
              <p className="text-3xl font-bold" style={{ color: '#716be6' }}>
                {overview.total_products_sold}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Return Rate Section */}
      {returnRate && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Return Analytics</h2>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-2">Return Rate</p>
              <p className="text-3xl font-bold text-red-600">
                {returnRate.return_rate_percent}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {returnRate.total_items_returned} of {returnRate.total_items_sold} items
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-2">Revenue Lost to Returns</p>
              <p className="text-3xl font-bold text-red-600">
                ${returnRate.revenue_lost.toFixed(2)}
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-2">Items Returned</p>
              <p className="text-3xl font-bold" style={{ color: '#fdaa2e' }}>
                {returnRate.total_items_returned}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Health Section */}
      {inventoryHealth && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Inventory Health</h2>
            <button
              onClick={() => setShowInventoryDetails(!showInventoryDetails)}
              className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              {showInventoryDetails ? 'Hide Details' : 'See Details'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="border border-red-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-2">Out of Stock</p>
              <p className="text-3xl font-bold text-red-600">
                {inventoryHealth.out_of_stock.length}
              </p>
            </div>
            <div className="border border-yellow-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-2">Low Stock (&lt; 5)</p>
              <p className="text-3xl font-bold text-yellow-600">
                {inventoryHealth.low_stock.length}
              </p>
            </div>
            <div className="border border-blue-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-2">Overstocked (&gt; 50)</p>
              <p className="text-3xl font-bold" style={{ color: '#0099ff' }}>
                {inventoryHealth.overstocked.length}
              </p>
            </div>
          </div>

          {/* Inventory Details - Collapsible */}
          {showInventoryDetails && (
            <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-3 gap-6">
              {/* Out of Stock */}
              <div>
                <h3 className="text-lg font-bold text-red-600 mb-4">Out of Stock</h3>
                {inventoryHealth.out_of_stock.length === 0 ? (
                  <p className="text-gray-600 text-sm">No products out of stock</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {inventoryHealth.out_of_stock.map((item) => (
                      <div key={`${item.store_id}-${item.product_id}`} className="border-b border-gray-200 pb-2 last:border-0">
                        <p className="font-semibold text-sm text-gray-900">{item.product_name}</p>
                        <p className="text-xs text-gray-600">{item.city}, {item.state}</p>
                        <p className="text-xs text-red-600 font-bold">Stock: 0</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Low Stock */}
              <div>
                <h3 className="text-lg font-bold text-yellow-600 mb-4">Low Stock</h3>
                {inventoryHealth.low_stock.length === 0 ? (
                  <p className="text-gray-600 text-sm">No low stock items</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {inventoryHealth.low_stock.map((item) => (
                      <div key={`${item.store_id}-${item.product_id}`} className="border-b border-gray-200 pb-2 last:border-0">
                        <p className="font-semibold text-sm text-gray-900">{item.product_name}</p>
                        <p className="text-xs text-gray-600">{item.city}, {item.state}</p>
                        <p className="text-xs text-yellow-600 font-bold">Stock: {item.stock}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Overstocked */}
              <div>
                <h3 className="text-lg font-bold" style={{ color: '#0099ff' }}>Overstocked</h3>
                {inventoryHealth.overstocked.length === 0 ? (
                  <p className="text-gray-600 text-sm">No overstocked items</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {inventoryHealth.overstocked.map((item) => (
                      <div key={`${item.store_id}-${item.product_id}`} className="border-b border-gray-200 pb-2 last:border-0">
                        <p className="font-semibold text-sm text-gray-900">{item.product_name}</p>
                        <p className="text-xs text-gray-600">{item.city}, {item.state}</p>
                        <p className="text-xs font-bold" style={{ color: '#0099ff' }}>Stock: {item.stock}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Store Performance Bar Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Store Performance</h2>
        {storePerformance.length === 0 ? (
          <p className="text-gray-600">No sales data available yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={storeRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#000000" />
              <YAxis yAxisId="right" orientation="right" stroke="#000000" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="right" dataKey="orders" fill="#fdaa2e" name="Orders" />
              <Bar yAxisId="left" dataKey="revenue" fill="#309de7" name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Sales by Category Pie Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sales by Category</h2>
          {categoryData.length === 0 ? (
            <p className="text-gray-600">No sales data available yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#716be6"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Store Performance Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Store Details</h2>
          {storePerformance.length === 0 ? (
            <p className="text-gray-600">No sales data available yet.</p>
          ) : (
            <div className="space-y-4">
              {storePerformance.map((store, index) => (
                <div key={store.store_id} className="border-b border-gray-200 pb-3 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">
                      #{index + 1}: {store.city}, {store.state}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Revenue:</span>{' '}
                      <span className="font-semibold" style={{ color: '#6eed37' }}>
                        ${store.total_revenue.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Orders:</span>{' '}
                      <span className="font-semibold" style={{ color: '#0099ff' }}>
                        {store.order_count}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All Orders Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
          <button
            onClick={() => setShowAllOrders(!showAllOrders)}
            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            {showAllOrders ? 'Hide Orders' : 'See All Orders'}
          </button>
        </div>

        {!showAllOrders ? (
          <p className="text-gray-600">Click "See All Orders" to view all customer orders</p>
        ) : allOrders.length === 0 ? (
          <p className="text-gray-600">No orders found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Order #</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Store</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date/Time</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allOrders.map((order) => (
                  <tr key={order.order_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      #{order.order_number}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {order.customer_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {order.user_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {order.city}, {order.state}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(order.order_datetime)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: '#6eed37' }}>
                      ${order.total_price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClasses(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      

      
     
    
      {/* Top Sellers Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Top 5 Best Sellers</h2>
        </div>
        
        {topSellers.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            No sales data available yet.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rank</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Units Sold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topSellers.map((product, index) => (
                <tr key={product.product_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.img_url}
                        alt={product.product_name}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = `https://via.placeholder.com/48x48/cccccc/666666?text=${encodeURIComponent(
                            product.product_name.slice(0, 1)
                          )}`;
                        }}
                      />
                      <span className="font-medium text-gray-900">{product.product_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{product.category}</td>
                  <td className="px-6 py-4 text-gray-900">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold" style={{ color: '#6eed37' }}>{product.total_sold} units</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;