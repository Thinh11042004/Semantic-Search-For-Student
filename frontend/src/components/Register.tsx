import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Footer() {
  return (
    <footer className="w-full bg-[#fff6f6] shadow-inner py-6 mt-12 flex flex-col items-center">
      <div className="text-2xl font-bold text-[#1a237e] mb-2 tracking-wide">HUTECH Search</div>
      <div className="flex gap-6 mb-2">
        <Link to="/about" className="text-gray-500 hover:text-[#1a237e] text-sm">About</Link>
        <Link to="/contact" className="text-gray-500 hover:text-[#1a237e] text-sm">Contact</Link>
        <Link to="/help" className="text-gray-500 hover:text-[#1a237e] text-sm">Help</Link>
      </div>
      <div className="text-gray-400 text-xs">© {new Date().getFullYear()} HUTECH University. All rights reserved.</div>
    </footer>
  );
}

const Register: React.FC = () => {
  const [formData, setFormData] = React.useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual registration logic here
    console.log('Registration attempt with:', formData);
    // Temporarily navigate to login after registration
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-gray-900 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-[#1a237e] mb-2">HUTECH Search</div>
            <div className="w-16 h-1 bg-[#1976d2] mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900">Đăng ký tài khoản</h2>
            <p className="mt-2 text-gray-600">Đăng ký để trải nghiệm dịch vụ tìm kiếm thông minh</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Họ và tên
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1976d2] focus:border-[#1976d2]"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1976d2] focus:border-[#1976d2]"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1976d2] focus:border-[#1976d2]"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Xác nhận mật khẩu
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1976d2] focus:border-[#1976d2]"
              />
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-[#1976d2] focus:ring-[#1976d2] border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                Tôi đồng ý với{' '}
                <a href="#" className="text-[#1976d2] hover:text-[#1565c0]">
                  Điều khoản dịch vụ
                </a>
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1976d2] hover:bg-[#1565c0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1976d2]"
            >
              Đăng ký
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-medium text-[#1976d2] hover:text-[#1565c0]">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Register; 