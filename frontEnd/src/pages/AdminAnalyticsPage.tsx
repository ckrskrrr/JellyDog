import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

interface TopSeller {
  product_id: number;
  product_name: string;
  category: string;
  price: number;
  img_url: string;
  total_sold: number;
}

interface BestRegion {
  state: string | null;
  city: string | null;
  order_count: number;
  total_revenue: number;
}

const AdminAnalyticsPage = () => {
  const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
  const [bestRegion, setBestRegion] = useState<BestRegion | null>(null);
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

        // Fetch best region
        const bestRegionResponse = await fetch(`${API_BASE_URL}/stats/best-region`);
        if (!bestRegionResponse.ok) throw new Error('Failed to fetch best region');
        const bestRegionData = await bestRegionResponse.json();
        setBestRegion(bestRegionData);
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

  return (
    <div className="space-y-8">
      {/* Best Region Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Performing Store</h2>
        {bestRegion && bestRegion.city ? (
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Location</p>
              <p className="text-xl font-bold text-gray-900">
                {bestRegion.city}, {bestRegion.state}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-xl font-bold text-green-600">
                ${bestRegion.total_revenue.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Orders</p>
              <p className="text-xl font-bold text-gray-900">
                {bestRegion.order_count}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">No sales data available yet.</p>
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