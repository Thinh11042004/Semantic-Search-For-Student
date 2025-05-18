import * as React from 'react';
import MainLayout from '../components/Layout/MainLayout';
import PageContainer from '../components/Layout/PageContainer';

const Product: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);           // Danh sách file người dùng đã chọn
  const [uploadProgress, setUploadProgress] = React.useState(0);                  // Giá trị phần trăm tiến trình upload
  const [uploading, setUploading] = React.useState(false);                        // Trạng thái đang upload hay không
  const fileInputRef = React.useRef<HTMLInputElement>(null);                      // Tham chiếu đến input file
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);                  // Tham chiếu đến interval giả lập tiến trình

  // Hiệu ứng giả lập tiến trình khi upload
  React.useEffect(() => {
    if (uploading && uploadProgress < 100) {
      intervalRef.current = setInterval(() => {
        setUploadProgress(prev => {
          if (prev < 95) return prev + 1;
          return prev;
        });
      }, 150);
    } else {
      clearInterval(intervalRef.current!);
    }

    return () => clearInterval(intervalRef.current!);
  }, [uploading]);

  // Khi người dùng chọn file từ input
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setSelectedFiles(prev => {
        const combined = [...prev, ...filesArray];
        if (combined.length > 10) {
          alert("⚠️ Chỉ cho phép chọn tối đa 10 file");
          return prev;
        }
        return combined;
      });
    }
  };

  // Khi người dùng thả file vào khung
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files) {
      const filesArray = Array.from(event.dataTransfer.files);
      setSelectedFiles(prev => {
        const combined = [...prev, ...filesArray];
        if (combined.length > 10) {
          alert("⚠️ Chỉ cho phép chọn tối đa 10 file");
          return prev;
        }
        return combined;
      });
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // Xoá một file khỏi danh sách đã chọn
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Hàm xử lý khi nhấn nút "Upload tất cả"
  const handleUploadAll = async () => {
    if (selectedFiles.length === 0) {
      alert("Vui lòng chọn ít nhất một file");
      return;
    }

    if (selectedFiles.length > 10) {
      alert("⚠️ Chỉ cho phép upload tối đa 10 file mỗi lần");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach(file => formData.append('form', file));
    setUploading(true);
    setUploadProgress(0);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://localhost:5000/api/forms/upload', true);

      // Theo dõi tiến trình upload (nhưng giới hạn dưới 95%)
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          if (percent < 95) setUploadProgress(percent);
        }
      };

      // Khi upload hoàn tất
      xhr.onload = async () => {
        clearInterval(intervalRef.current!);
      
        if (xhr.status === 201) {
          setUploadProgress(100);
      
          // 🧠 Parse response từ server trả về (danh sách forms đã upload)
          const response = JSON.parse(xhr.responseText);
          const user = JSON.parse(localStorage.getItem('user') || '{}');
      
          // 🧾 Ghi log vào bảng upload_logs
          for (const file of response.forms || []) {
            await fetch('http://localhost:5000/api/history/uploads', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                filename: file.title,
                status: 'upload',
                user_id: user.id,
                formId: file.id 
              })
            });
          }
      
          // ✅ Hoàn tất sau khi ghi log
          setTimeout(() => {
            setUploading(false);
            setSelectedFiles([]);
            alert('✅ Upload thành công');
          }, 500);
        } else {
          const response = JSON.parse(xhr.responseText);
          alert('❌ Upload thất bại: ' + (response?.error || 'Không rõ nguyên nhân'));
        }
      };
      
      xhr.onerror = () => {
        setUploading(false);
        alert('❌ Lỗi kết nối server');
      };

      xhr.send(formData);
    } catch (err) {
      setUploading(false);
      console.error('❌ Lỗi upload:', err);
      alert('❌ Lỗi upload');
    }
  };

  return (
    <MainLayout>
      <PageContainer>
        <div className="flex flex-col items-center bg-[#fafbfc] text-gray-900">
          <div className="w-full flex flex-col items-center pt-12 pb-4">
            <h1 className="text-4xl font-bold mb-2 text-center">Upload & Process Your Files</h1>
            <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl">
              Upload your documents for intelligent processing and semantic search capabilities.
            </p>
          </div>

          <div
            className="w-full max-w-2xl min-h-[12rem] max-h-[30rem]
              bg-white border-2 border-dashed rounded-lg 
              p-8 text-center 
              shadow-md hover:shadow-lg transition-shadow 
              flex flex-col gap-8 items-center justify-center"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* Hiển thị danh sách file đã chọn */}
            {selectedFiles.length > 0 && (
              <div className="w-full max-h-48 overflow-y-auto flex flex-col gap-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex justify-between bg-gray-100 px-4 py-2 rounded">
                    <span className="truncate">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="bg-[#C0C0C0] text-red-500 text-sm rounded px-2"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Gợi ý khi chưa chọn file */}
            {selectedFiles.length === 0 && (
              <>
                <div>
                  <svg className="mx-auto w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-xl font-medium mb-4">Drag and drop your files here or</p>
              </>
            )}

            {/* Thanh tiến trình upload */}
            {uploading && (
              <div className="w-full max-w-md my-4">
                <div className="bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-green-600 h-4 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-center mt-1">{uploadProgress}%</p>
              </div>
            )}

            {/* Nút upload */}
            {selectedFiles.length > 0 && (
              <button
                onClick={handleUploadAll}
                disabled={uploading}
                className={`mt-4 px-6 py-2 rounded text-white transition ${
                  uploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {uploading ? 'Đang upload...' : `Upload tất cả (${selectedFiles.length})`}
              </button>
            )}

            {/* Nút chọn file */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              multiple
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#1976d2] text-white px-8 py-3 rounded hover:bg-[#1565c0] transition-colors font-medium"
            >
              Choose Files
            </button>
          </div>
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default Product;
