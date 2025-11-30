import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

interface Store {
  store_id: number;
  street: string;
  city: string;
  state: string;
  zip: string;
}

const SelectStorePage = () => {
  const navigate = useNavigate();
  const { selectedStore, setSelectedStore } = useStore();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [localSelectedId, setLocalSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/stores`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch stores');
        }
        
        const storeData = await response.json();
        setStores(storeData);
        
        // If no store selected yet, auto-select first store
        if (!selectedStore && storeData.length > 0) {
          setLocalSelectedId(storeData[0].store_id);
          setSelectedStore(storeData[0]); // Actually save to context
        } else if (selectedStore) {
          setLocalSelectedId(selectedStore.store_id);
        }
      } catch (err: any) {
        console.error('Error fetching stores:', err);
        setError(err.message || 'Failed to load stores');
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [selectedStore]);

  const handleSelectStore = (store: Store) => {
    setLocalSelectedId(store.store_id);
    setSelectedStore(store);
    
    // Navigate to home after a brief delay to show the selection
    setTimeout(() => {
      navigate('/home');
    }, 300);
  };

  const getStoreName = (index: number): string => {
    return `Store ${index + 1}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading stores...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Store</h1>
          <p className="text-gray-600">Choose a store to shop</p>
        </div>

        {/* Store List */}
        <div className="space-y-6">
          {stores.map((store, index) => {
            const isSelected = localSelectedId === store.store_id;
            
            return (
              <div
                key={store.store_id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Store Name */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      {getStoreName(index)}
                    </h2>
                    
                    {/* Store Address */}
                    <div className="text-gray-600 space-y-1">
                      <p>{store.street}</p>
                      <p>{store.city}, {store.state} {store.zip}</p>
                    </div>
                  </div>

                  {/* Select/Selected Button */}
                  <button
                    onClick={() => handleSelectStore(store)}
                    disabled={isSelected}
                    className={`
                      px-6 py-2 rounded-md font-medium transition-all
                      ${isSelected 
                        ? 'bg-gray-700 text-white cursor-default flex items-center gap-2' 
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    {isSelected ? (
                      <>
                        <svg 
                          className="w-5 h-5" 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                        Selected
                      </>
                    ) : (
                      'Select'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SelectStorePage;