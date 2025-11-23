import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PersonalInfoPage = () => {
  const navigate = useNavigate();
  const { user, customer, updateCustomer } = useAuth();
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Load existing customer data when component mounts
  useEffect(() => {
    if (customer) {
      // User has existing customer info - populate form
      setFormData({
        customerName: customer.customer_name || '',
        phoneNumber: customer.phone_number || '',
        street: customer.street || '',
        city: customer.city || '',
        state: customer.state || '',
        zipCode: customer.zip_code || '',
        country: customer.country || '',
      });
      setIsEditing(true); // They're editing existing info
    } else {
      setIsEditing(false); // They're creating new info
    }
  }, [customer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // updateCustomer handles both POST (create) and PUT (update)
      await updateCustomer({
        customer_name: formData.customerName,
        phone_number: formData.phoneNumber,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        country: formData.country,
      });
      
      // If this was first-time setup, redirect to store selection
      // If editing from account page, stay on account page
      if (!isEditing) {
        navigate('/select-store');
      } else {
        // Show success message or just stay on page
        alert('Information updated successfully!');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save your information. Please try again.');
      console.error('Customer info error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Personal Information' : 'Personal Information'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {isEditing 
              ? 'Update your profile information' 
              : 'Please complete your profile to continue'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="customerName"
              placeholder="Full name"
              value={formData.customerName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              required
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="(123) 456-7890"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              required
            />
          </div>

          {/* Street */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address *
            </label>
            <input
              type="text"
              name="street"
              placeholder="123 Main St"
              value={formData.street}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              required
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              required
            />
          </div>

          {/* State and Zip Code - Side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <input
                type="text"
                name="state"
                placeholder="State"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zip Code *
              </label>
              <input
                type="text"
                name="zipCode"
                placeholder="12345"
                value={formData.zipCode}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country *
            </label>
            <input
              type="text"
              name="country"
              placeholder="USA"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-800 text-white py-3 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : (isEditing ? 'Update Information' : 'Continue')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PersonalInfoPage;