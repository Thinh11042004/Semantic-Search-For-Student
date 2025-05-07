import React, { useState } from "react";
import { Card, CardContent } from "../components/ui/card";

const fileTypes = [
  { name: "WordPress", icon: "https://img.icons8.com/ios-filled/50/wordpress.png" },
  { name: "Excel", icon: "https://img.icons8.com/ios-filled/50/ms-excel.png" },
  { name: "Document", icon: "https://img.icons8.com/ios-filled/50/document.png" },
  { name: "PDF", icon: "https://img.icons8.com/ios-filled/50/pdf.png" },
  { name: "PowerPoint", icon: "https://img.icons8.com/ios-filled/50/ms-powerpoint.png" },
  { name: "Exe", icon: "https://img.icons8.com/ios-filled/50/installer.png" },
];

export default function Product() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      addFilesToList(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFilesToList(Array.from(e.target.files));
    }
  };

  const addFilesToList = (files: File[]) => {
    const newFiles = files.filter(file => 
      !selectedFiles.some(f => f.name === file.name && f.size === file.size)
    );
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileName: string) => {
    setSelectedFiles(prev => prev.filter(f => f.name !== fileName));
  };

  const handleUploadAll = async () => {
    if (selectedFiles.length === 0) {
      alert("Vui lòng chọn ít nhất một file");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('form', file);  
    });
    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        alert("Upload thành công: " + JSON.stringify(data));
        setSelectedFiles([]);  // Xóa list sau khi upload
      } else {
        alert("Upload thất bại: " + (data.error || "Lỗi không xác định"));
      }
    } catch (error) {
      console.error("Lỗi khi upload:", error);
      alert("Lỗi kết nối server");
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 text-gray-800">
      <main className="flex flex-col items-center px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">Upload & Process Your Files</h1>
        <p className="text-gray-600 mb-4">
          Upload your documents for intelligent processing and semantic search
        </p>

        {/* Khu vực kéo thả */}
        <div
          className={`w-full max-w-2xl h-64 bg-gray-200 rounded-lg border-2 border-dashed border-gray-400 flex flex-col items-center justify-center p-6 mb-4 ${
            dragActive ? "border-[#005BAA] bg-blue-50" : ""
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-2 border-dashed border-[#005BAA] rounded-lg flex items-center justify-center">
              <span className="text-[#005BAA] text-4xl">+</span>
            </div>
            <p className="text-gray-600 text-center">
              Drag and drop your files here<br />or
            </p>
            <label className="cursor-pointer bg-[#005BAA] text-white px-6 py-2 rounded-md hover:bg-[#004080]">
              Choose Files
              <input
                type="file"
                className="hidden"
                onChange={handleChange}
                accept=".doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx,.exe,.txt"
                multiple
              />
            </label>
          </div>
        </div>

        {/* Hiển thị danh sách file đã chọn */}
        {selectedFiles.length > 0 && (
          <div className="w-full max-w-3xl flex flex-col gap-2 mb-6">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-white px-4 py-2 rounded shadow-sm">
                <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                <button 
                  onClick={() => removeFile(file.name)} 
                  className="bg-[#C0C0C0] text-red-500 text-sm rounded px-2"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Nút upload */}
        {selectedFiles.length > 0 && (
          <button
            onClick={handleUploadAll}
            className="mb-8 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Upload tất cả
          </button>
        )}

        {/* Loại file */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 w-full max-w-4xl">
          {fileTypes.map((type) => (
            <Card key={type.name} className="p-6 bg-white hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center gap-4">
                <img src={type.icon} alt={type.name} className="h-12 w-12" />
                <span className="font-medium">{type.name}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
