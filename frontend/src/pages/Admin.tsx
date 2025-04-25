
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface Document {
  id: string;
  filename: string;
  uploadDate: string;
  status: 'processed' | 'processing' | 'error';
  size: number;
}

const Admin = () => {
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await axios.get('/api/documents');
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/documents/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries(['documents']),
  });

  const reprocessMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.post(`/api/documents/${id}/reprocess`);
    },
    onSuccess: () => queryClient.invalidateQueries(['documents']),
  });

  const statusStyle = {
    processed: 'bg-green-100 text-green-800',
    processing: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-10 transition-colors">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Uploaded Forms</h1>

        {isLoading ? (
          <p className="text-gray-500 dark:text-gray-400 text-center">Loading documents...</p>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600 text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left">File Name</th>
                  <th className="px-4 py-3 text-left">Upload Date</th>
                  <th className="px-4 py-3 text-left">Size</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{doc.filename}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{new Date(doc.uploadDate).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{(doc.size / 1024).toFixed(2)} KB</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle[doc.status]}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button
                        onClick={() => reprocessMutation.mutate(doc.id)}
                        className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                      >
                        Reprocess
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(doc.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default Admin;
