import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SearchHistoryItem {
  id: number;
  query: string;
  date: string;
  results: number;
  contentType: string;
}

interface UploadHistoryItem {
  id: number;
  filename: string;
  date: string;
  size: string;
  status: string;
}

const SearchHistory: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'searches' | 'uploads'>('searches');
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    // Nếu là user ➔ chỉ lấy search history
    if (user.role === 'user') {
      fetch('http://localhost:5000/api/history/searches', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(res => res.json())
        .then(data => {
          setSearchHistory(data.history || []);
        })
        .catch(err => console.error('Lỗi lấy lịch sử tìm kiếm:', err))
        .finally(() => setLoading(false));
    }

    // Nếu là admin ➔ lấy cả search history và upload history
    if (user.role === 'admin') {
      Promise.all([
        fetch('http://localhost:5000/api/history/searches', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }).then(res => res.json()),
        fetch('http://localhost:5000/api/history/uploads', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }).then(res => res.json())
      ])
        .then(([searchData, uploadData]) => {
          setSearchHistory(searchData.history || []);
          setUploadHistory(uploadData.history || []);
        })
        .catch(err => console.error('Lỗi tải dữ liệu:', err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Đang tải lịch sử...</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <h1 className="text-3xl font-bold text-white">Your History</h1>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="flex border-b mb-6">
            <button
              className={`px-6 py-3 font-medium text-lg ${
                activeTab === 'searches'
                  ? 'bg-[#cfd2d4] text-blue-500 border-b-2 border-blue-600'
                  : 'bg-[#cfd2d4] text-blue-500 border-b-2 border-blue-600'
              }`}
              onClick={() => setActiveTab('searches')}
            >
              Search History
            </button>
            {user?.role === 'admin' && (
              <button
                className={`px-6 py-3 font-medium text-lg ${
                  activeTab === 'uploads'
                    ? 'bg-[#cfd2d4] text-blue-500 border-b-2 border-blue-600'
                    : 'bg-[#cfd2d4] text-blue-500 border-b-2 border-blue-600'
                }`}
                onClick={() => setActiveTab('uploads')}
              >
                Upload History
              </button>
            )}
          </div>

          {/* Search History Table */}
          {activeTab === 'searches' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Searches</h2>
              {searchHistory.length === 0 ? (
                <p className="text-gray-500">Không có lịch sử tìm kiếm.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left">Query</th>
                        <th className="px-6 py-3 text-left">Date</th>
                        <th className="px-6 py-3 text-left">Results</th>
                        <th className="px-6 py-3 text-left">Content Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchHistory.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">{item.query}</td>
                          <td className="px-6 py-4">{formatDate(item.date)}</td>
                          <td className="px-6 py-4">{item.results}</td>
                          <td className="px-6 py-4">{item.contentType}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Upload History Table - chỉ admin mới thấy */}
          {activeTab === 'uploads' && user?.role === 'admin' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Upload History</h2>
              {uploadHistory.length === 0 ? (
                <p className="text-gray-500">Không có lịch sử upload.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left">Filename</th>
                        <th className="px-6 py-3 text-left">Date</th>
                        <th className="px-6 py-3 text-left">Size</th>
                        <th className="px-6 py-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadHistory.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">{item.filename}</td>
                          <td className="px-6 py-4">{formatDate(item.date)}</td>
                          <td className="px-6 py-4">{item.size}</td>
                          <td className="px-6 py-4">{item.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchHistory;
