import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const OpenFile = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Lấy thông tin file từ backend
  useEffect(() => {
    fetch(`http://localhost:5000/api/form/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setFile(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching file:', err);
        setLoading(false);
      });
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('Invalid Date:', dateString);
      return 'Ngày không hợp lệ';
    }
    return date.toLocaleDateString();
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex flex-col items-center bg-[#fafbfc] text-gray-900 p-8">
      {/* Header: Tên file và ngày upload */}
      <div className="w-full max-w-5xl mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{file.title}</h2>
          <div className="flex gap-4">
            <a href={file.filePath} download>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                Tải về
              </button>
            </a>
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded-lg"
              onClick={() => navigate('/search-forms')} 
            >
              Trở về
            </button>
          </div>
        </div>
      </div>

      {/* Vùng hiển thị nội dung file */}
      <div className="w-full max-w-5xl">
      {file.content && file.content.endsWith('.pdf') ? (
        <iframe src={file.filePath} width="100%" height="600px" title="PDF Viewer" />
      ) :  file.content  ? (
          <div dangerouslySetInnerHTML={{ __html: file.content }} />
        ) : (
          <p>Không thể hiển thị nội dung file.</p>
        )}
      </div>
    </div>
  );
};

export default OpenFile;
