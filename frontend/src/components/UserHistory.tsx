import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface DownloadHistoryItem {
  id: number;
  filename: string;
  date: string;
}

const UserHistory: React.FC = () => {
  const { user } = useAuth();
  const [downloadHistory, setDownloadHistory] = useState<DownloadHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);

    fetch('http://localhost:5000/api/history/downloads/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id })
    })
    
    
      .then(res => res.json())
      .then(data => {
        setDownloadHistory(data.downloads || []);
      })
      .catch(err => console.error('Lỗi lấy lịch sử:', err))
      .finally(() => setLoading(false));
  }, [user]);

  const totalPages = Math.ceil(downloadHistory.length / itemsPerPage);
  const currentPageItems = downloadHistory.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) setPage(pageNum);
  };

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Đang tải lịch sử...</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <h1 className="text-3xl font-bold text-white">Download History</h1>
        </div>

        <div className="p-6">
          {downloadHistory.length === 0 ? (
            <p className="text-gray-500">Không có lịch sử tải xuống.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100 text-gray-800 font-semibold">
                    <tr>
                      <th className="px-6 py-3 text-left">Tên tệp</th>
                      <th className="px-6 py-3 text-left">Ngày tải</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPageItems.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-900 font-medium">{item.filename}</td>
                        <td className="px-6 py-4 text-gray-700">{formatDate(item.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-6 flex justify-center gap-2 bg-gray-200 py-2 px-6 rounded-full">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="bg-blue-400 text-white text-sm px-3 py-1 rounded disabled:opacity-50"
                >
                  &lt; prev
                </button>
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => goToPage(idx + 1)}
                    className={`w-8 h-8 rounded-full text-sm font-semibold transition-all duration-200 ${
                      idx + 1 === page
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-800 border border-blue-400'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  className="bg-blue-500 text-white text-sm px-3 py-1 rounded disabled:opacity-50"
                >
                  next &gt;
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserHistory;
