import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const OpenFile = () => {
  const { id } = useParams();
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/forms/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setFile(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('❌ Lỗi lấy file:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Đang tải file...</p>;
  }

  if (!file?.filePath || !file.filePath.endsWith('.pdf')) {
    return <p className="text-center text-red-500 mt-10">Không thể hiển thị nội dung file.</p>;
  }

  return (
    <div className="w-full h-screen">
      <iframe
        src={file.filePath}
        title="PDF Viewer"
        width="100%"
        height="100%"
        style={{
          border: 'none',
          background: '#fff',
        }}
      />
    </div>
  );
};

export default OpenFile;
