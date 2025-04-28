import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    plan: "",
    memberSince: ""
  });

  // Update formData when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        company: user.company || "",
        role: user.role || "",
        plan: user.plan || "",
        memberSince: user.memberSince || ""
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would update the user profile in the backend
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading user information...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <h1 className="text-3xl font-bold text-white">User Profile</h1>
        </div>
        
        <div className="p-6">
          <div className="flex items-start">
            <div className="w-1/3 pr-8">
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <div className="w-32 h-32 mx-auto bg-gray-300 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl text-gray-600">
                    {formData.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-semibold">{formData.name}</h2>
                  <p className="text-gray-600">{formData.email}</p>
                </div>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Subscription</h3>
                <p className="mb-1"><span className="text-gray-600">Plan:</span> {formData.plan}</p>
                <p><span className="text-gray-600">Member since:</span> {formData.memberSince}</p>
                <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
                  Upgrade Plan
                </button>
              </div>
            </div>
            
            <div className="w-2/3">
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Personal Information</h3>
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>
                
                {isEditing ? (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Company</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Role</label>
                      <input
                        type="text"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
                    >
                      Save Changes
                    </button>
                  </form>
                ) : (
                  <div>
                    <div className="mb-4">
                      <p><span className="font-medium">Full Name:</span> {formData.name}</p>
                    </div>
                    <div className="mb-4">
                      <p><span className="font-medium">Email:</span> {formData.email}</p>
                    </div>
                    <div className="mb-4">
                      <p><span className="font-medium">Company:</span> {formData.company}</p>
                    </div>
                    <div className="mb-4">
                      <p><span className="font-medium">Role:</span> {formData.role}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 bg-gray-100 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Account Security</h3>
                <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition mb-4">
                  Change Password
                </button>
                <button className="ml-4 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition mb-4">
                  Two-Factor Authentication
                </button>
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Recent Activity</h4>
                  <ul className="text-sm">
                    <li className="p-2 border-b">
                      <span className="text-gray-600">Login</span> - Today, 10:45 AM
                    </li>
                    <li className="p-2 border-b">
                      <span className="text-gray-600">Search performed</span> - Yesterday, 3:20 PM
                    </li>
                    <li className="p-2 border-b">
                      <span className="text-gray-600">File uploaded</span> - Apr 12, 2023, 1:15 PM
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 