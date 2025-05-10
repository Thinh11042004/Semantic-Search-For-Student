import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate để điều hướng
import { logActivity } from '../components/activityLogger';

// Các icon cho file DOCX và PDF
const WordIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-10 h-10">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill="#4285F4" />
    <path d="M14 2v6h6" fill="#AECBFA" />
    <path d="M16 13H8v-2h8v2zm0 4H8v-2h8v2z" fill="#ffffff" />
  </svg>
);

const PDFIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-10 h-10">
    <path d="M20 2H8a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2z" fill="#FF5722" />
    <path d="M4 6v14a2 2 0 002 2h14" stroke="#FF5722" strokeWidth="2" />
    <path d="M10.5 11.5h-.8v2.4h.8c.8 0 1.3-.5 1.3-1.2s-.5-1.2-1.3-1.2zM14.7 11.5h1.4v.9h-1.4v.8h1.6v.9h-2.5v-3.8h2.6v.9h-1.7v.3z" fill="#ffffff" />
    <path d="M10.5 10.6c1.2 0 2.2.7 2.2 2.1 0 1.4-.9 2.1-2.2 2.1h-1.7v-4.2h1.7zM9.7 14.8h.8c1.2 0 2.2-.7 2.2-2.1 0-1.4-1-2.1-2.2-2.1h-1.7v4.2h.9z" fill="#ffffff" />
    <path d="M9 9h2.3c1.5 0 2.7 1 2.7 2.9 0 1.9-1.2 2.9-2.7 2.9H9V9z" fill="#ffffff" />
  </svg>
);

interface Form {
  id: number;
  title: string;
  content: string;
  filePath: string;
  created_at: Date;
}

export default function SearchForms() {
  const [searchQuery, setSearchQuery] = useState("");
  const [forms, setForms] = useState<Form[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [debounceId, setDebounceId] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // Load form theo page mặc định
  const loadForms = (pageNum = 1) => {
    setLoading(true);
    fetch(`http://localhost:5000/api/forms/page?page=${pageNum}&limit=8`)
      .then(res => res.json())
      .then(data => {
        setForms(data.forms);
        setTotalPages(data.totalPages);
        setIsSearching(false);
      })
      .catch(err => console.error("Lỗi tải forms:", err))
      .finally(() => setLoading(false));
  };

  // Khi mới vào trang, load page đầu tiên
  useEffect(() => {
    if (!isSearching) {
      loadForms(page);
    }
  }, [page]);

  // Xử lý tìm kiếm khi bấm nút hoặc Enter
  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      loadForms(1);
      return;
    }

    setLoading(true);
    fetch(`http://localhost:5000/api/search?query=${encodeURIComponent(searchQuery)}`)
      .then(res => res.json())
      .then(data => {
        setForms(data.results || []);
        setTotalPages(1);
        setIsSearching(true);

        const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
        if (userId) {
            logActivity(userId, 'search', `Tìm kiếm với từ khóa: ${searchQuery}`);
        }
      })
      .catch(err => console.error("Lỗi tìm kiếm:", err))
      .finally(() => setLoading(false));
  };

  // Xử lý nhấn Enter trong ô tìm kiếm
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Khi người dùng gõ vào input (debounce 0.5 giây)
  useEffect(() => {
    if (debounceId) clearTimeout(debounceId);

    const id = setTimeout(() => {
      if (searchQuery.trim() !== "") {
        handleSearch();
      } else {
        loadForms(1);
      }
    }, 500);

    setDebounceId(id);

    return () => clearTimeout(id);
  }, [searchQuery]);



  return (
    <div className="flex flex-col items-center bg-[#fafbfc] text-gray-900">
      <div className="w-full flex flex-col items-center pt-12 pb-4">
        <h1 className="text-4xl font-bold mb-2 text-center">Intelligent Document Search & Analysis</h1>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl">
          Transform the way you search through documents with our advanced semantic search technology.
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-xl flex items-center bg-white rounded-full shadow-lg px-6 py-3 mb-8 border border-gray-100">
          <input
            type="text"
            placeholder="Search across all your documents..."
            className="flex-1 bg-transparent outline-none text-lg placeholder-gray-400"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSearch}
            className="ml-2 bg-[#1976d2] hover:bg-[#1565c0] transition-colors text-white rounded-full p-2 shadow-md"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>

      {loading && (
        <p className="text-gray-500 mb-4">Đang tải dữ liệu...</p>
      )}

      {/* Results */}
      <div className="w-full max-w-5xl px-4 mb-8">
        {forms.length === 0 && !loading ? (
          <p className="text-center text-gray-500">Không tìm thấy biểu mẫu nào.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {forms.map((form) => {
              let icon;
              const lowerTitle = form.title.toLowerCase();
              if (lowerTitle.endsWith(".docx")) {
                icon = <WordIcon />;
              } else if (lowerTitle.endsWith(".pdf")) {
                icon = <PDFIcon />;
              }

              return (
                <div
                  key={form.id}
                  className="flex gap-4 items-center bg-gray-200 rounded-lg p-4 shadow hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/open-file/${form.id}`)}  // Điều hướng khi nhấn vào file
                >
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg">
                    {icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-lg">{form.title}</span>
                    <p className="text-sm text-gray-500">{new Date(form.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-[#1976d2] text-gray-200 rounded disabled:opacity-50"
        >
          Trang trước
        </button>
        <span>Trang {page} / {totalPages}</span>
        <button
          onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 bg-[#1976d2] text-gray-200 rounded disabled:opacity-50"
        >
          Trang sau
        </button>
      </div>
    </div>
  );
}
