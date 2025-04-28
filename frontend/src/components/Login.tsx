import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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

const Login: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
    navigate('/product'); // Redirect to product page after login
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-gray-900 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-[#1a237e] mb-2">HUTECH Search</div>
            <div className="w-16 h-1 bg-[#1976d2] mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900">Đăng nhập</h2>
            <p className="mt-2 text-gray-600">Vui lòng đăng nhập với tài khoản admin</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1976d2] focus:border-[#1976d2]"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1976d2] focus:border-[#1976d2]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#1976d2] focus:ring-[#1976d2] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <a href="#" className="text-sm text-[#1976d2] hover:text-[#1565c0]">
                Quên mật khẩu?
              </a>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1976d2] hover:bg-[#1565c0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1976d2]"
            >
              Đăng nhập
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="font-medium text-[#1976d2] hover:text-[#1565c0]">
                Đăng ký
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login; 