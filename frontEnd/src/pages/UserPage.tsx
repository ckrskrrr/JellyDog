import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OrderHistoryPage from './OrderHistoryPage';
import PersonalInfoPage from './PersonalInfoPage';

type TabType = 'orders' | 'info';

const UserPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const navigate = useNavigate();
  const { logout } = useAuth();

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
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-2 px-1 font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-2 px-1 font-medium transition-colors ${
                activeTab === 'info'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Info
            </button>
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
      <div className="max-w-4xl mx-auto px-6 py-8">
        {activeTab === 'orders' && <OrderHistoryPage />}
        {activeTab === 'info' && <PersonalInfoPage />}
      </div>
    </div>
  );
};

export default UserPage;