import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OrderHistoryPage from './OrderHistoryPage';
import PersonalInfoPage from './PersonalInfoPage';
import AdminAnalyticsPage from './AdminAnalyticsPage';

type CustomerTabType = 'orders' | 'info';
type AdminTabType = 'analytics';

const UserPage = () => {
  const navigate = useNavigate();
  const { logout, isAdmin } = useAuth();
  
  // Separate state for customer and admin tabs
  const [customerTab, setCustomerTab] = useState<CustomerTabType>('orders');
  const [adminTab, setAdminTab] = useState<AdminTabType>('analytics');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Internal Navigation Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex gap-8 justify-center">
            {/* Customer Tabs */}
            {!isAdmin && (
              <>
                <button
                  onClick={() => setCustomerTab('orders')}
                  className={`pb-2 px-1 font-medium transition-colors ${
                    customerTab === 'orders'
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setCustomerTab('info')}
                  className={`pb-2 px-1 font-medium transition-colors ${
                    customerTab === 'info'
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Info
                </button>
              </>
            )}

            {/* Admin Tabs */}
            {isAdmin && (
              <button
                onClick={() => setAdminTab('analytics')}
                className={`pb-2 px-1 font-medium transition-colors ${
                  adminTab === 'analytics'
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Analytics
              </button>
            )}

            {/* Logout - shown for both */}
            <button
              onClick={handleLogout}
              className="pb-2 px-1 font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className={`mx-auto px-6 py-8 ${isAdmin ? 'max-w-[1000px]' : 'max-w-4xl'}`}>
        {/* Customer Content */}
        {!isAdmin && (
          <>
            {customerTab === 'orders' && <OrderHistoryPage />}
            {customerTab === 'info' && <PersonalInfoPage />}
          </>
        )}

        {/* Admin Content */}
        {isAdmin && (
          <>
            {adminTab === 'analytics' && <AdminAnalyticsPage />}
          </>
        )}
      </div>
    </div>
  );
};

export default UserPage;