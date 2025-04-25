import * as React from 'react';
import { Link } from 'react-router-dom';

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

  return (
    <div className="min-h-screen bg-[#FFEAEA]">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-[#005BAA]">HUTECH</h1>
              <nav className="flex space-x-6">
                <Link to="/" className="text-gray-700 hover:text-[#005BAA] text-xl">Home</Link>
                <Link to="/product" className="text-gray-700 hover:text-[#005BAA] font-bold text-xl">Product</Link>
                <Link to="/search-forms" className="text-gray-700 hover:text-[#005BAA] text-xl">Search Forms</Link>
                <a href="#" className="text-gray-700 hover:text-[#005BAA] text-xl">Integrations</a>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-semibold mb-4 tracking-tight">Upload a file</h1>
          <p className="text-2xl text-gray-800">Choose a file to upload and it will be processed for semantic search</p>
        </div>

        {/* Upload Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-white"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="mb-4">
              <img src="/images/image-5.png" alt="Upload" className="mx-auto w-32 h-32 object-contain" />
            </div>
            <p className="text-2xl font-medium mb-4">Drag and drop a file here or</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#D4C9C9] text-[#434343] border border-[#D49797] rounded-full px-8 py-3 text-lg hover:bg-gray-200 transition-colors"
            >
              Choose File
            </button>
          </div>
        </div>

        {/* File Type Cards - First Row */}
        <div className="grid grid-cols-3 gap-8 mb-8">
          <div className="bg-[#FAFAFA] border border-[#E6E6E6] rounded-xl p-8">
            <div className="flex items-center space-x-4">
              <img src="/images/wordpress-icon.png" alt="WordPress" className="w-16 h-16 rounded-full" />
              <span className="text-xl font-medium">WordPress</span>
            </div>
          </div>
          <div className="bg-[#FAFAFA] border border-[#E6E6E6] rounded-xl p-8">
            <div className="flex items-center space-x-4">
              <img src="/images/excel-icon.png" alt="Excel" className="w-16 h-16 rounded-full" />
              <span className="text-xl font-medium">Excel</span>
            </div>
          </div>
          <div className="bg-[#FAFAFA] border border-[#E6E6E6] rounded-xl p-8">
            <div className="flex items-center space-x-4">
              <img src="/images/document-icon.png" alt="Document" className="w-16 h-16 rounded-full" />
              <span className="text-xl font-medium">Document</span>
            </div>
          </div>
        </div>

        {/* File Type Cards - Second Row */}
        <div className="grid grid-cols-3 gap-8">
          <div className="bg-[#FAFAFA] border border-[#E6E6E6] rounded-xl p-8">
            <div className="flex items-center space-x-4">
              <img src="/images/pdf-icon.png" alt="PDF" className="w-16 h-16 rounded-full" />
              <span className="text-xl font-medium">PDF</span>
            </div>
          </div>
          <div className="bg-[#FAFAFA] border border-[#E6E6E6] rounded-xl p-8">
            <div className="flex items-center space-x-4">
              <img src="/images/powerpoint-icon.png" alt="PowerPoint" className="w-16 h-16 rounded-full" />
              <span className="text-xl font-medium">PowerPoint</span>
            </div>
          </div>
          <div className="bg-[#FAFAFA] border border-[#E6E6E6] rounded-xl p-8">
            <div className="flex items-center space-x-4">
              <img src="/images/exe-icon.png" alt="Exe" className="w-16 h-16 rounded-full" />
              <span className="text-xl font-medium">Exe</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <img 
              src="/images/hutech-logo.svg" 
              alt="HUTECH Logo" 
              className="h-12"
            />
            <div className="flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-[#005BAA]">About</a>
              <a href="#" className="text-gray-600 hover:text-[#005BAA]">Contact</a>
              <a href="#" className="text-gray-600 hover:text-[#005BAA]">Help</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Product; 