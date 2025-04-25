import { Link } from 'react-router-dom';

// Add JSX namespace declaration to fix linter errors
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

const HeroSection = () => {
  return (
    <section className="relative min-h-[600px] bg-white overflow-hidden">
      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#005BAA] leading-tight mb-6">
            Hệ thống tìm kiếm ngữ nghĩa cho biểu mẫu sinh viên
          </h1>
          
          {/* Description */}
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Tìm kiếm thông minh và nhanh chóng trong kho tài liệu của trường. 
            Hỗ trợ tìm kiếm theo ngữ nghĩa, giúp bạn dễ dàng tìm thấy thông tin cần thiết.
          </p>
          
          {/* Search Box */}
          <div className="max-w-2xl mx-auto mb-10">
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              <input
                type="text"
                placeholder="Nhập từ khóa tìm kiếm..."
                className="flex-1 px-4 py-3 focus:outline-none"
              />
              <button className="bg-[#005BAA] text-white px-6 py-3 hover:bg-[#004080] transition-colors">
                Tìm kiếm
              </button>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Link to="/search-forms" className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold text-[#005BAA] mb-2">Search Forms</h3>
              <p className="text-gray-600">Tìm kiếm nhanh chóng trong các biểu mẫu</p>
            </Link>
            <Link to="/product" className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold text-[#005BAA] mb-2">Product</h3>
              <p className="text-gray-600">Khám phá các tính năng sản phẩm</p>
            </Link>
            <Link to="/integrations" className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold text-[#005BAA] mb-2">Integrations</h3>
              <p className="text-gray-600">Tích hợp với các hệ thống khác</p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 