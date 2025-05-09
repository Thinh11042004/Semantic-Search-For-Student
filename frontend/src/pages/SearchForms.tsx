import React, { useEffect, useState } from "react";
import { logActivity } from '../components/activityLogger'

interface Form {
  id: number;
  title: string,
  created_at: Date;
}


const features = [
  {
    title: "Document Search",
    description: "Search through Word, PDF, and text documents with advanced semantic understanding.",
    icon: (
      <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="16" rx="4" strokeWidth="2" />
        <path d="M8 8h8M8 12h4" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: "Spreadsheet Analysis",
    description: "Extract insights from Excel and CSV files with intelligent data processing.",
    icon: (
      <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="5" width="18" height="14" rx="3" strokeWidth="2" />
        <path d="M8 10h8M8 14h8" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: "Presentation Search",
    description: "Find content within PowerPoint presentations and other slide formats.",
    icon: (
      <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="16" rx="4" strokeWidth="2" />
        <path d="M8 8h8v8H8z" strokeWidth="2" />
      </svg>
    ),
  },
];

// File type icons
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

const ExcelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-10 h-10">
    <path d="M4 3h13l4 4v14a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" fill="#21A366" />
    <path d="M17 3v4h4" fill="#107C41" />
    <rect x="7" y="9" width="10" height="2" fill="#ffffff" />
    <rect x="7" y="13" width="10" height="2" fill="#ffffff" />
    <rect x="7" y="17" width="10" height="2" fill="#ffffff" />
  </svg>
);

const PowerPointIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-10 h-10">
    <path d="M4 3h13l4 4v14a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" fill="#D24726" />
    <path d="M17 3v4h4" fill="#A53005" />
    <circle cx="12" cy="14" r="3" fill="#ffffff" />
    <path d="M10 11h3.5a1.5 1.5 0 010 3H10v-3z" fill="#ffffff" />
  </svg>
);

const MarkdownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-10 h-10">
    <path d="M3 3h18a2 2 0 012 2v14a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2z" fill="#7E57C2" />
    <path d="M5 7v10h3V9.5l2 2.5 2-2.5V17h3V7H12l-2 2.5L8 7H5z" fill="#ffffff" />
  </svg>
);

const TextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-10 h-10">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill="#607D8B" />
    <path d="M14 2v6h6" fill="#B0BEC5" />
    <path d="M8 12h8M8 16h8M8 8h2" fill="none" stroke="#ffffff" strokeWidth="1.5" />
  </svg>
);

export default function SearchForms() {
  const [searchQuery, setSearchQuery] = useState("");
  const [forms, setForms] = useState<Form[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [debounceId, setDebounceId] = useState<NodeJS.Timeout | null>(null);

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
      {/* Header */}
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

      {/* Loading spinner */}
      {loading && (
        <p className="text-gray-500 mb-4">Đang tải dữ liệu...</p>
      )}

      {/* Results */}
      <div className="w-full max-w-5xl px-4 mb-8">
        {forms.length === 0 && !loading ? (
          <p className="text-center text-gray-500">Không tìm thấy biểu mẫu nào.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {forms.map(form => {
              let icon;
              const lowerTitle = form.title.toLowerCase();
              if (lowerTitle.endsWith(".doc") || lowerTitle.endsWith(".docx")) {
                icon = <WordIcon />;
              } else if (lowerTitle.endsWith(".pdf")) {
                icon = <PDFIcon />;
              } else if (lowerTitle.endsWith(".xls") || lowerTitle.endsWith(".xlsx") || lowerTitle.endsWith(".csv")) {
                icon = <ExcelIcon />;
              } else {
                icon = <TextIcon />;
              }

              return (
                <div key={form.id} className="flex gap-4 items-center bg-gray-200 rounded-lg p-4 shadow hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg">
                    {icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-lg">{form.title}</span>
                    <p className="text-sm text-gray-500">
                      {new Date(form.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!isSearching && forms.length > 0 && (
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
        )}
      </div>

   {/* Features Grid */}
   <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 pb-20 px-4">
   {features.map((feature, idx) => (
     <div
       key={feature.title}
       className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-8 flex flex-col items-start"
     >
       <div className="bg-purple-100 rounded-xl p-3 mb-4 flex items-center justify-center">
         {feature.icon}
       </div>
       <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
       <p className="text-gray-600">{feature.description}</p>
     </div>
   ))}
 </div>

 {/* Supported File Types Section */}
 <div className="w-full bg-white py-16">
   <div className="max-w-5xl mx-auto px-4">
     <div className="text-center mb-12">
       <h2 className="text-3xl font-bold mb-3">Supported File Types</h2>
       <p className="text-gray-600 max-w-2xl mx-auto">
         We support a wide range of document formats to meet your needs
       </p>
     </div>
     
     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 justify-items-center">
       <div className="flex flex-col items-center">
         <div className="bg-[#f8f9fa] rounded-full p-4 mb-3">
           <WordIcon />
         </div>
         <span className="text-gray-700 font-medium">Word</span>
       </div>
       
       <div className="flex flex-col items-center">
         <div className="bg-[#f8f9fa] rounded-full p-4 mb-3">
           <PDFIcon />
         </div>
         <span className="text-gray-700 font-medium">PDF</span>
       </div>
       
       <div className="flex flex-col items-center">
         <div className="bg-[#f8f9fa] rounded-full p-4 mb-3">
           <ExcelIcon />
         </div>
         <span className="text-gray-700 font-medium">Excel</span>
       </div>
       
       <div className="flex flex-col items-center">
         <div className="bg-[#f8f9fa] rounded-full p-4 mb-3">
           <PowerPointIcon />
         </div>
         <span className="text-gray-700 font-medium">PowerPoint</span>
       </div>
       
       <div className="flex flex-col items-center">
         <div className="bg-[#f8f9fa] rounded-full p-4 mb-3">
           <MarkdownIcon />
         </div>
         <span className="text-gray-700 font-medium">Markdown</span>
       </div>
       
       <div className="flex flex-col items-center">
         <div className="bg-[#f8f9fa] rounded-full p-4 mb-3">
           <TextIcon />
         </div>
         <span className="text-gray-700 font-medium">Text</span>
       </div>
     </div>
   </div>
 </div>
</div>

);
     
} 