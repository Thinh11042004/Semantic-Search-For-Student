import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Handle file upload here
      console.log("File dropped:", e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      // Handle file upload here
      console.log("File selected:", e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 text-gray-800">
      <Navbar />
      {/* Main content */}
      <main className="flex flex-col items-center px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">Upload a file</h1>
        <p className="text-gray-600 mb-8">
          Choose a file to upload and it will be processed for semantic search
        </p>

        {/* Upload Area */}
        <div
          className={`w-full max-w-2xl h-64 bg-gray-200 rounded-lg border-2 border-dashed border-gray-400 flex flex-col items-center justify-center p-6 mb-12 ${
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
              Drag and drop your file here<br />
              or
            </p>
            <label className="cursor-pointer bg-[#005BAA] text-white px-6 py-2 rounded-md hover:bg-[#004080] transition-colors">
              Choose File
              <input
                type="file"
                className="hidden"
                onChange={handleChange}
                accept=".doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx,.exe,.txt"
              />
            </label>
          </div>
        </div>

        {/* File Types Grid */}
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
 