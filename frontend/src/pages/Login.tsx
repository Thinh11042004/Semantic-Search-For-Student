import { useState, type FC, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Add JSX namespace declaration to fix linter errors
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

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

const Login: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await login(email, password);
        navigate('/product', { state: { user: data.user } });
      } else {
        setError(data.message || 'Email hoặc mật khẩu không đúng');
      }

    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      setError('Lỗi server. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
};

  return (
    <div className="min-h-screen bg-[#fafbfc] text-gray-900 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-[#1a237e] mb-2">HUTECH Search</div>
            <div className="w-16 h-1 bg-[#1976d2] mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900">Đăng nhập</h2>
            <p className="mt-2 text-gray-600">Vui lòng đăng nhập với tài khoản của bạn</p>
          </div>

          {location.state?.message && (
            <div className="mb-4 text-green-600 text-sm text-center">
              {location.state.message}
            </div>
          )}
          
          {error && (
            <div className="mb-4 text-red-600 text-sm text-center">
              {error}
            </div>
          )}

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
                disabled={isLoading}
                className="bg-white mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1976d2] focus:border-[#1976d2] disabled:opacity-50"
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
                disabled={isLoading}
                className="bg-white mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1976d2] focus:border-[#1976d2] disabled:opacity-50"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="h-4 w-4 text-[#1976d2] focus:ring-[#1976d2] border-gray-300 rounded disabled:opacity-50"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <Link to="/forgot-password" className="text-sm text-[#1976d2] hover:text-[#1565c0]">
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1976d2] hover:bg-[#1565c0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1976d2] ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
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
