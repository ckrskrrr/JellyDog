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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdminAnalyticsPage = () => {
  const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
  const [storePerformance, setStorePerformance] = useState<StorePerformance[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch top sellers
        const topSellersResponse = await fetch(`${API_BASE_URL}/stats/top-sellers?limit=5`);
        if (!topSellersResponse.ok) throw new Error('Failed to fetch top sellers');
        const topSellersData = await topSellersResponse.json();
        setTopSellers(topSellersData);

        // Fetch store performance
        const storePerformanceResponse = await fetch(`${API_BASE_URL}/stats/best-region`);
        if (!storePerformanceResponse.ok) throw new Error('Failed to fetch store performance');
        const storePerformanceData = await storePerformanceResponse.json();
        setStorePerformance(storePerformanceData);

        // Fetch overview
        const overviewResponse = await fetch(`${API_BASE_URL}/stats/overview`);
        if (!overviewResponse.ok) throw new Error('Failed to fetch overview');
        const overviewData = await overviewResponse.json();
        setOverview(overviewData);
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
    <div className="space-y-8">
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