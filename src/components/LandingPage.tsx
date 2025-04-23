import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleGetStartClick = () => {
    setShowModal(true);
  };

  const handleLoginClick = () => {
    setShowModal(false);
    navigate('/login');
  };

  const handleRegisterClick = () => {
    setShowModal(false);
    navigate('/get-started');
  };

  return (
    <div className="min-h-screen bg-[#FFF1F1]">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <span className="text-2xl font-bold text-primary">Home</span>
          <div className="flex space-x-6">
            <a href="#" className="text-lg text-primary hover:opacity-75">Product</a>
            <a href="#" className="text-lg text-primary hover:opacity-75">Search Forms</a>
            <a href="#" className="text-lg text-primary hover:opacity-75">Integrations</a>
          </div>
        </div>
        <button 
          onClick={handleGetStartClick}
          className="bg-black text-white px-6 py-3 rounded-lg hover:opacity-90"
        >
          Get Start
        </button>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 flex justify-between items-center">
        <div className="max-w-xl">
          <h1 className="text-6xl font-bold leading-tight tracking-tight mb-6 text-primary flex items-center gap-2">
            <span className="text-5xl">🔍</span> Welcome to
            <br />
            Semantic Search
          </h1>
          <p className="text-2xl text-gray-700 leading-relaxed mb-12">
            Smarter search. Deeper understanding.
            <br />
            Our AI-powered search engine goes beyond keywords to understand the meaning behind your queries — delivering accurate and relevant results from your documents.
          </p>
          <button 
            onClick={handleGetStartClick}
            className="bg-black text-white px-6 py-3 rounded-lg hover:opacity-90"
          >
            Get Start
          </button>
        </div>
        <div className="flex-shrink-0">
          <img 
            src="/images/hero-illustration.svg" 
            alt="Hero Illustration" 
            className="w-[400px] h-[400px] object-contain"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-3 gap-8">
          {/* Feature Card 1 */}
          <div className="bg-white border border-[#E6E6E6] rounded-xl p-8 hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-medium mb-6 text-primary">Natural Language</h3>
            <div className="flex items-center space-x-4">
              <p className="text-base font-medium text-gray-600">
                Search using everyday language and questions
              </p>
            </div>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-white border border-[#E6E6E6] rounded-xl p-8 hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-medium mb-6 text-primary">Save Results</h3>
            <div className="flex items-center space-x-4">
              <p className="text-base font-medium text-gray-600">
                Bookmark and organize your favorite findings
              </p>
            </div>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-white border border-[#E6E6E6] rounded-xl p-8 hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-medium mb-6 text-primary">Search History</h3>
            <div className="flex items-center space-x-4">
              <p className="text-base font-medium text-gray-600">
                Easily access your past searches and results
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Illustrations */}
      <div className="container mx-auto px-4 flex justify-between items-center">
        <img 
          src="/images/hutech-logo.svg" 
          alt="HUTECH Logo" 
          className="h-16 object-contain"
        />
        <img 
          src="/images/bottom-illustration.svg" 
          alt="Bottom Illustration" 
          className="w-[400px] h-[400px] object-contain"
        />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6 text-center">Welcome!</h2>
            <div className="space-y-4">
              <button
                onClick={handleLoginClick}
                className="w-full bg-[#005BAA] text-white py-3 rounded-lg hover:bg-[#004080] transition-colors"
              >
                Already have an account? Login
              </button>
              <button
                onClick={handleRegisterClick}
                className="w-full border border-[#005BAA] text-[#005BAA] py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Create new account
              </button>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 text-gray-500 hover:text-gray-700 text-sm w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage; 