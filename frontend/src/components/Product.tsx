import * as React from 'react';

// Icon components
const WordPressIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-12 h-12">
    <circle cx="12" cy="12" r="10" fill="#21759B" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 19.5c-5.2 0-9.5-4.3-9.5-9.5S6.8 2.5 12 2.5s9.5 4.3 9.5 9.5-4.3 9.5-9.5 9.5z" fill="#ffffff" />
    <path d="M3.5 12c0 3.4 2 6.4 4.9 7.8L4 7.3c-1.5 1.4-2.5 3.4-2.5 5.7zm14.5-0.4c0-1.1-0.4-1.8-0.7-2.4-0.4-0.7-0.8-1.3-0.8-2 0-0.8 0.6-1.5 1.4-1.5l0.1 0c-1.4-1.3-3.3-2.1-5.4-2.1-2.8 0-5.2 1.4-6.6 3.6l0.5 0c0.8 0 2-0.1 2-0.1 0.4 0 0.4 0.6 0 0.6 0 0-0.4 0.1-0.8 0.1l2.6 7.7 1.6-4.7-1.1-3c-0.4 0-0.8-0.1-0.8-0.1-0.4 0-0.3-0.6 0-0.6 0 0 1.2 0.1 2 0.1 0.8 0 2-0.1 2-0.1 0.4 0 0.4 0.6 0 0.6 0 0-0.4 0.1-0.8 0.1l2.6 7.7 0.7-2.4c0.3-1 0.5-1.7 0.5-2.3z" fill="#ffffff" />
    <path d="M12.1 13.1l-2.2 6.4c0.7 0.2 1.4 0.3 2.1 0.3 0.9 0 1.7-0.1 2.5-0.4l-0.1-0.1-2.3-6.2zm6.3-4.2l0.1 0.9c0.1 0.9-0.2 2-0.7 3.3l-2.2 6.4c2.2-1.3 3.7-3.7 3.7-6.5 0-1.5-0.4-2.9-1.1-4.1z" fill="#ffffff" />
  </svg>
);

const ExcelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-12 h-12">
    <path d="M4 3h13l4 4v14a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" fill="#21A366" />
    <path d="M17 3v4h4" fill="#107C41" />
    <rect x="7" y="9" width="10" height="2" fill="#ffffff" />
    <rect x="7" y="13" width="10" height="2" fill="#ffffff" />
    <rect x="7" y="17" width="10" height="2" fill="#ffffff" />
  </svg>
);

const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-12 h-12">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill="#4285F4" />
    <path d="M14 2v6h6" fill="#AECBFA" />
    <path d="M16 13H8v-2h8v2zm0 4H8v-2h8v2z" fill="#ffffff" />
  </svg>
);

const PDFIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-12 h-12">
    <path d="M20 2H8a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2z" fill="#FF5722" />
    <path d="M4 6v14a2 2 0 002 2h14" stroke="#FF5722" strokeWidth="2" />
    <path d="M10.5 11.5h-.8v2.4h.8c.8 0 1.3-.5 1.3-1.2s-.5-1.2-1.3-1.2zM14.7 11.5h1.4v.9h-1.4v.8h1.6v.9h-2.5v-3.8h2.6v.9h-1.7v.3z" fill="#ffffff" />
    <path d="M10.5 10.6c1.2 0 2.2.7 2.2 2.1 0 1.4-.9 2.1-2.2 2.1h-1.7v-4.2h1.7zM9.7 14.8h.8c1.2 0 2.2-.7 2.2-2.1 0-1.4-1-2.1-2.2-2.1h-1.7v4.2h.9z" fill="#ffffff" />
    <path d="M9 9h2.3c1.5 0 2.7 1 2.7 2.9 0 1.9-1.2 2.9-2.7 2.9H9V9z" fill="#ffffff" />
  </svg>
);

const PowerPointIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-12 h-12">
    <path d="M4 3h13l4 4v14a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" fill="#D24726" />
    <path d="M17 3v4h4" fill="#A53005" />
    <circle cx="12" cy="14" r="3" fill="#ffffff" />
    <path d="M10 11h3.5a1.5 1.5 0 010 3H10v-3z" fill="#ffffff" />
  </svg>
);

const ExeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-12 h-12">
    <path d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6z" fill="#5C6BC0" />
    <path d="M7 9h2v6H7V9zM15 9h2v6h-2V9zM11 9h2v6h-2V9z" fill="#ffffff" />
  </svg>
);

const Product: React.FC = () => {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setSelectedFile(event.dataTransfer.files[0]);
    }
  };

  const fileTypes = [
    { name: "WordPress", icon: <WordPressIcon /> },
    { name: "Excel", icon: <ExcelIcon /> },
    { name: "Document", icon: <DocumentIcon /> },
    { name: "PDF", icon: <PDFIcon /> },
    { name: "PowerPoint", icon: <PowerPointIcon /> },
    { name: "Exe", icon: <ExeIcon /> }
  ];

  return (
    <div className="flex flex-col items-center bg-[#fafbfc] text-gray-900">
      {/* Header */}
      <div className="w-full flex flex-col items-center pt-12 pb-4">
        <h1 className="text-4xl font-bold mb-2 text-center">Upload & Process Your Files</h1>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl">
          Upload your documents for intelligent processing and semantic search capabilities.
        </p>
      </div>

      {/* Upload Section */}
      <div className="w-full max-w-2xl mx-auto mb-12">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-white shadow-md hover:shadow-lg transition-shadow"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="mb-4">
            <svg className="mx-auto w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-xl font-medium mb-4">Drag and drop a file here or</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#1976d2] text-white px-8 py-3 rounded hover:bg-[#1565c0] transition-colors font-medium"
          >
            Choose File
          </button>
          {selectedFile && (
            <p className="mt-4 text-gray-700">Selected: {selectedFile.name}</p>
          )}
        </div>
      </div>

      {/* File Type Grid */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 pb-20 px-4">
        {fileTypes.map((fileType) => (
          <div
            key={fileType.name}
            className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-8 flex flex-col items-start"
          >
            <div className="bg-purple-100 rounded-xl p-3 mb-4 flex items-center justify-center">
              {fileType.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{fileType.name}</h3>
            <p className="text-gray-600">Process and analyze your {fileType.name} files with our intelligent tools.</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Product; 