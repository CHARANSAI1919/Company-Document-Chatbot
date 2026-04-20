import { useState, useRef } from 'react';
import axios from 'axios';
import { X, UploadCloud, File, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function UploadModal({ onClose, onSuccess, apiUrl }) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles) => {
    const validFiles = newFiles.filter(f => 
      f.type === "application/pdf" || 
      f.name.endsWith('.pdf') || 
      f.name.endsWith('.docx')
    );
    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (idx) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setProgress(0);
    setResults(null);

    const formData = new FormData();
    files.forEach(file => {
      formData.append("files", file);
    });

    try {
      // Basic progress simulation for UI since true progress needs axios config
      const interval = setInterval(() => {
        setProgress(p => (p < 90 ? p + 10 : p));
      }, 300);

      const res = await axios.post(`${apiUrl}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      clearInterval(interval);
      setProgress(100);
      setResults(res.data.results);
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold">Upload Documents</h2>
            <p className="text-sm text-slate-400 mt-1">Add PDF or DOCX files to your knowledge base.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {results ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-2">Upload Results</h3>
              {results.map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                  {r.status === "Uploaded" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.filename}</p>
                    <p className={`text-xs ${r.status === "Uploaded" ? "text-emerald-400/80" : "text-amber-400/80"}`}>
                      {r.status} {r.chunks ? `(${r.chunks} chunks)` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div 
                className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-12 px-6 transition-colors text-center cursor-pointer
                  ${dragActive ? "border-blue-500 bg-blue-500/10" : "border-slate-700 bg-slate-800/50 hover:bg-slate-800"}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud className={`w-10 h-10 mb-4 ${dragActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <p className="text-base font-medium">Drag and drop your files here</p>
                <p className="text-sm text-slate-500 mt-1">or click to browse from your computer</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleChange} 
                  className="hidden" 
                  multiple 
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                />
              </div>

              {files.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h3 className="text-sm font-medium text-slate-400 mb-3">Selected Files ({files.length})</h3>
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-800/80 rounded-lg border border-slate-700">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <File className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="text-sm truncate">{f.name}</span>
                      </div>
                      <button onClick={() => removeFile(i)} className="text-slate-500 hover:text-red-400 p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {uploading && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Uploading and processing...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300 ease-out" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
          {results ? (
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors border border-slate-700"
            >
              Done
            </button>
          ) : (
            <>
              <button 
                onClick={onClose}
                disabled={uploading}
                className="px-6 py-2 bg-transparent hover:bg-slate-800 text-slate-300 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpload}
                disabled={files.length === 0 || uploading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing
                  </>
                ) : 'Upload'}
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
