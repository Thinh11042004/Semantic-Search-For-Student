import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/Layout/MainLayout';
import PageContainer from '../components/Layout/PageContainer';

interface UploadLog {
  id: number;
  filename: string;
  upload_date: string;
  status: string;
  user_name: string;
  deleted_by?: string;
  delete_date?: string;
}

const AdminHistory: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<UploadLog[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'delete'>('upload');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch('http://localhost:5000/api/history/admin-logs')
      .then(res => res.json())
      .then(data => {
        setLogs(data.uploads || []);
      })
      .catch(err => console.error('Lỗi lấy lịch sử:', err))
      .finally(() => setLoading(false));
  }, [user]);

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

  const filtered = activeTab === 'upload'
    ? logs.filter(item => item.status === 'upload' || item.status === 'deleted')
    : logs.filter(item => item.status === 'deleted');

  const pageCount = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDeleteSelected = async () => {
    if (!window.confirm('Bạn có chắc muốn xoá các mục đã chọn?')) return;
    if (!user?.id) return;
    try {
      const response = await fetch('http://localhost:5000/api/history/uploads/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, user_id: user.id })
      });
      const result = await response.json();
      if (response.ok) {
        alert('✅ Đã xoá thành công');
        setLogs(prev => prev.map(log =>
          selectedIds.includes(log.id)
            ? { ...log, status: 'deleted', delete_date: new Date().toISOString(), deleted_by: user.name }
            : log
        ));
        setSelectedIds([]);
      } else {
        alert('❌ Xoá thất bại: ' + result.message);
      }
    } catch (err) {
      console.error('Lỗi xoá:', err);
      alert('❌ Lỗi server khi xoá.');
    }
  };

  return (
    <MainLayout>
      <PageContainer>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
            <h1 className="text-3xl font-bold text-white">Upload & Delete History</h1>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center border-b mb-6">
              <div>
                <button
                  className={`px-6 py-3 font-medium text-lg ${
                    activeTab === 'upload' ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-600' : 'bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => {
                    setActiveTab('upload');
                    setCurrentPage(1);
                    setSelectedIds([]);
                  }}
                >
                  Thông tin upload
                </button>
                <button
                  className={`ml-4 px-6 py-3 font-medium text-lg ${
                    activeTab === 'delete' ? 'bg-red-100 text-red-700 border-b-2 border-red-600' : 'bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => {
                    setActiveTab('delete');
                    setCurrentPage(1);
                    setSelectedIds([]);
                  }}
                >
                  Thông tin file bị xoá
                </button>
              </div>
              {selectedIds.length > 0 && activeTab === 'upload' && (
                <button
                  onClick={handleDeleteSelected}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Xoá {selectedIds.length} mục
                </button>
              )}
            </div>

            {loading ? (
              <p className="text-center mt-10 text-gray-500">Đang tải...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100 text-gray-800 font-semibold">
                    <tr>
                      {activeTab === 'upload' && <th className="px-4 py-3 text-left">Chọn</th>}
                      <th className="px-6 py-3 text-left">Tên tệp</th>
                      <th className="px-6 py-3 text-left">Người thực hiện</th>
                      <th className="px-6 py-3 text-left">Ngày upload</th>
                      {activeTab === 'delete' && <th className="px-6 py-3 text-left">Ngày xoá</th>}
                      <th className="px-6 py-3 text-left">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        {activeTab === 'upload' && (
                          <td className="px-4 py-4">
                            {item.status === 'upload' ? (
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(item.id)}
                                onChange={() =>
                                  setSelectedIds(prev =>
                                    prev.includes(item.id)
                                      ? prev.filter(id => id !== item.id)
                                      : [...prev, item.id]
                                  )
                                }
                              />
                            ) : (
                              <span className="text-sm italic text-gray-400">Đã xoá</span>
                            )}
                          </td>
                        )}
                        <td className="px-6 py-4 text-gray-900 font-medium">{item.filename}</td>
                        <td className="px-6 py-4 text-gray-900">{item.user_name}</td>
                        <td className="px-6 py-4 text-gray-900">{formatDate(item.upload_date)}</td>
                        {activeTab === 'delete' && <td className="px-6 py-4 text-gray-900">{formatDate(item.delete_date || '')}</td>}
                        <td className="px-6 py-4 font-semibold capitalize text-blue-700">
                          {activeTab === 'upload'
                            ? (item.status === 'upload' ? 'Upload' : 'Upload ⇒ Delete')
                            : 'Delete'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-center gap-2 mt-6">
                  <button
                    className="px-3 py-1 rounded bg-blue-200 text-blue-800 disabled:opacity-50"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    &lt; Prev
                  </button>
                  {[...Array(pageCount)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                        ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-blue-700 border border-blue-400'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="px-3 py-1 rounded bg-blue-500 text-white disabled:opacity-50"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                    disabled={currentPage === pageCount}
                  >
                    Next &gt;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default AdminHistory;
