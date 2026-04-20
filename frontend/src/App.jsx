import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import UploadModal from './components/UploadModal';

const API_URL = "http://localhost:8000";

function App() {
  const [documents, setDocuments] = useState([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null); // For single doc search/compare
  const [comparisonDoc, setComparisonDoc] = useState(null); // Second doc for compare
  
  // Fetch documents on load
  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${API_URL}/documents`);
      setDocuments(res.data);
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/document/${id}`);
      fetchDocuments();
      if (selectedDoc && selectedDoc.id === id) setSelectedDoc(null);
      if (comparisonDoc && comparisonDoc.id === id) setComparisonDoc(null);
    } catch (err) {
      console.error("Error deleting document:", err);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar sidebar */}
      <Sidebar 
        documents={documents} 
        onUploadClick={() => setIsUploadOpen(true)}
        onDelete={handleDelete}
        selectedDoc={selectedDoc}
        setSelectedDoc={setSelectedDoc}
        comparisonDoc={comparisonDoc}
        setComparisonDoc={setComparisonDoc}
      />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-slate-800 flex items-center px-6 shrink-0 bg-slate-900/50 backdrop-blur">
          <h1 className="font-semibold text-lg flex-1">
            {selectedDoc ? `Chat: ${selectedDoc.filename}` : "Global Document Search"}
            {comparisonDoc && ` vs ${comparisonDoc.filename}`}
          </h1>
        </header>

        <main className="flex-1 overflow-hidden relative">
          <ChatWindow 
            selectedDoc={selectedDoc} 
            comparisonDoc={comparisonDoc}
            apiUrl={API_URL}
          />
        </main>
      </div>

      {isUploadOpen && (
        <UploadModal 
          onClose={() => setIsUploadOpen(false)} 
          onSuccess={fetchDocuments}
          apiUrl={API_URL}
        />
      )}
    </div>
  );
}

export default App;
