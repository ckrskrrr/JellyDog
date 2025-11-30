import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdminAnalyticsPage = () => {
  const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
  const [storePerformance, setStorePerformance] = useState<StorePerformance[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [returnRate, setReturnRate] = useState<ReturnRate | null>(null);
  const [inventoryHealth, setInventoryHealth] = useState<InventoryHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch all analytics data
        const [topSellersRes, storePerformanceRes, overviewRes, returnRateRes, inventoryRes] = await Promise.all([
          fetch(`${API_BASE_URL}/stats/top-sellers?limit=5`),
          fetch(`${API_BASE_URL}/stats/best-region`),
          fetch(`${API_BASE_URL}/stats/overview`),
          fetch(`${API_BASE_URL}/stats/return-rate`),
          fetch(`${API_BASE_URL}/stats/inventory-health`),
        ]);

        if (!topSellersRes.ok || !storePerformanceRes.ok || !overviewRes.ok || !returnRateRes.ok || !inventoryRes.ok) {
          throw new Error('Failed to fetch analytics');
        }

        const [topSellersData, storePerformanceData, overviewData, returnRateData, inventoryData] = await Promise.all([
          topSellersRes.json(),
          storePerformanceRes.json(),
          overviewRes.json(),
          returnRateRes.json(),
          inventoryRes.json(),
        ]);

        setTopSellers(topSellersData);
        setStorePerformance(storePerformanceData);
        setOverview(overviewData);
        setReturnRate(returnRateData);
        setInventoryHealth(inventoryData);
      } catch (err: any) {
        console.error('Error fetching analytics:', err);
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

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
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600">
              ${overview.total_revenue.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Total Orders</p>
            <p className="text-3xl font-bold text-blue-600">
              {overview.total_orders}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Products Sold</p>
            <p className="text-3xl font-bold text-purple-600">
              {overview.total_products_sold}
            </p>
          </div>
        </div>
      )}

      {/* Return Rate Cards */}
      {returnRate && (
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Return Rate</p>
            <p className="text-3xl font-bold text-red-600">
              {returnRate.return_rate_percent}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {returnRate.total_items_returned} of {returnRate.total_items_sold} items
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Revenue Lost to Returns</p>
            <p className="text-3xl font-bold text-red-600">
              ${returnRate.revenue_lost.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Items Returned</p>
            <p className="text-3xl font-bold text-orange-600">
              {returnRate.total_items_returned}
            </p>
          </div>
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
              <YAxis yAxisId="left" orientation="left" stroke="#10b981" />
              <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill="#10b981" name="Revenue ($)" />
              <Bar yAxisId="right" dataKey="orders" fill="#3b82f6" name="Orders" />
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
                  fill="#8884d8"
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
                      Store {index + 1}: {store.city}, {store.state}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Revenue:</span>{' '}
                      <span className="font-semibold text-green-600">
                        ${store.total_revenue.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Orders:</span>{' '}
                      <span className="font-semibold text-blue-600">
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

      {/* Products with Highest Return Rates */}
      {returnRate && returnRate.top_returned_products.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Products with Highest Return Rates</h2>
          <div className="grid grid-cols-5 gap-6">
            {returnRate.top_returned_products.map((product) => (
              <div key={product.product_id} className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow">
                <img
                  src={product.img_url}
                  alt={product.product_name}
                  className="w-full h-48 object-cover rounded mb-4"
                  onError={(e) => {
                    e.currentTarget.src = `https://via.placeholder.com/200x200/cccccc/666666?text=${encodeURIComponent(
                      product.product_name.slice(0, 1)
                    )}`;
                  }}
                />
                <h3 className="font-semibold text-gray-900 text-base mb-3 line-clamp-2">
                  {product.product_name}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Return Rate:</span>
                    <span className="font-bold text-red-600 text-lg">{product.return_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sold:</span>
                    <span className="font-semibold">{product.total_sold}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Returned:</span>
                    <span className="text-red-600 font-semibold">{product.total_returned}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Health */}
      {inventoryHealth && (
        <div className="grid grid-cols-3 gap-6">
          {/* Out of Stock */}
          <div className="bg-white rounded-lg border border-red-200 p-6">
            <h3 className="text-lg font-bold text-red-600 mb-4">
              Out of Stock ({inventoryHealth.out_of_stock.length})
            </h3>
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
          <div className="bg-white rounded-lg border border-yellow-200 p-6">
            <h3 className="text-lg font-bold text-yellow-600 mb-4">
              Low Stock &lt; 5 ({inventoryHealth.low_stock.length})
            </h3>
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
          <div className="bg-white rounded-lg border border-blue-200 p-6">
            <h3 className="text-lg font-bold text-blue-600 mb-4">
              Overstocked &gt; 50 ({inventoryHealth.overstocked.length})
            </h3>
            {inventoryHealth.overstocked.length === 0 ? (
              <p className="text-gray-600 text-sm">No overstocked items</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {inventoryHealth.overstocked.map((item) => (
                  <div key={`${item.store_id}-${item.product_id}`} className="border-b border-gray-200 pb-2 last:border-0">
                    <p className="font-semibold text-sm text-gray-900">{item.product_name}</p>
                    <p className="text-xs text-gray-600">{item.city}, {item.state}</p>
                    <p className="text-xs text-blue-600 font-bold">Stock: {item.stock}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Units Sold
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topSellers.map((product, index) => (
                <tr key={product.product_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="text-2xl font-bold text-gray-400">
                      #{index + 1}
                    </span>
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
                      <span className="font-medium text-gray-900">
                        {product.product_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-green-600">
                      {product.total_sold} units
                    </span>
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