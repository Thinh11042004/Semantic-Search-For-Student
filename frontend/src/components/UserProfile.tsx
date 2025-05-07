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

  // Khi user thay đổi hoặc lần đầu mount
  useEffect(() => {
    if (user && user.id) {
      fetch(`http://localhost:5000/api/users/${user.id}`)
        .then(res => res.json())
        .then(data => {
          console.log("Data từ backend:", data);
          setFormData({
            name: data.name || "",
            email: data.email || "",
            company: data.company || "Chưa cập nhật",
            role: data.role || "",
            plan: "Basic",
            memberSince: data.created_at ? new Date(data.created_at).toLocaleDateString() : ""
          });
        })
        .catch(err => {
          console.error("Lỗi khi lấy user:", err);
        });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: gửi dữ liệu cập nhật lên backend nếu muốn
    setIsEditing(false);
  };

  // Nếu chưa có user (chưa đăng nhập) hoặc chưa load xong
  if (!user || !user.id) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading user information...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white text-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <h1 className="text-3xl font-bold text-white">User Profile</h1>
        </div>

        <div className="p-6">
          <div className="flex items-start">
            <div className="w-1/3 pr-8">
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <div className="w-32 h-32 mx-auto bg-gray-300 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl text-gray-600">
                    {formData.name ? formData.name.split(' ').map(n => n[0]).join('') : "?"}
                  </span>
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-semibold">{formData.name}</h2>
                  <p className="text-gray-600">{formData.email}</p>
                </div>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Subscription</h3>
                <p><b>Plan:</b> {formData.plan}</p>
                <p><b>Member since:</b> {formData.memberSince}</p>
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
                    {["name", "email", "company", "role"].map((field) => (
                      <div className="mb-4" key={field}>
                        <label className="block text-gray-700 mb-1 capitalize">{field}</label>
                        <input
                          type="text"
                          name={field}
                          value={(formData as any)[field]}
                          onChange={handleChange}
                          className="bg-gray-300 w-full p-2 border rounded"
                        />
                      </div>
                    ))}
                    <button 
                      type="submit" 
                      className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
                    >
                      Save Changes
                    </button>
                  </form>
                ) : (
                  <>
                    <p><b>Full Name:</b> {formData.name}</p>
                    <p><b>Email:</b> {formData.email}</p>
                    <p><b>Company:</b> {formData.company}</p>
                    <p><b>Role:</b> {formData.role}</p>
                  </>
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
