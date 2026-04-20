import { useState } from 'react';
import { Upload, FileText, Trash2, X, PlusCircle, LayoutPanelLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ 
  documents, 
  onUploadClick, 
  onDelete,
  selectedDoc,
  setSelectedDoc,
  comparisonDoc,
  setComparisonDoc
}) {
  const [compareMode, setCompareMode] = useState(false);

  const handleDocClick = (doc) => {
    if (compareMode) {
      if (selectedDoc?.id === doc.id) {
        setSelectedDoc(comparisonDoc);
        setComparisonDoc(null);
        setCompareMode(false);
      } else if (comparisonDoc?.id === doc.id) {
        setComparisonDoc(null);
      } else if (!selectedDoc) {
        setSelectedDoc(doc);
      } else {
        setComparisonDoc(doc);
      }
    } else {
      setSelectedDoc(selectedDoc?.id === doc.id ? null : doc);
      setComparisonDoc(null);
    }
  };

  const isSelected = (doc) => selectedDoc?.id === doc.id;
  const isCompared = (doc) => comparisonDoc?.id === doc.id;

  return (
    <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-2">
          <LayoutPanelLeft className="w-5 h-5 text-blue-400" />
          DocuChat AI
        </h2>
      </div>

      <div className="p-4">
        <button
          onClick={onUploadClick}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2.5 px-4 font-medium flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]"
        >
          <Upload className="w-4 h-4" />
          Upload Documents
        </button>
      </div>

      <div className="px-4 pb-2 flex justify-between items-center">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Library</h3>
        <button 
          onClick={() => {
            setCompareMode(!compareMode);
            if (!compareMode) setComparisonDoc(null);
          }}
          className={`text-xs px-2 py-1 rounded transition-colors ${compareMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400 hover:text-slate-300'}`}
        >
          Compare
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        <AnimatePresence>
          {documents.map((doc) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className={`group flex items-center p-2.5 rounded-lg cursor-pointer transition-all ${
                isSelected(doc) ? 'bg-blue-600/20 text-blue-400 outline outline-1 outline-blue-500/50' : 
                isCompared(doc) ? 'bg-emerald-600/20 text-emerald-400 outline outline-1 outline-emerald-500/50' : 
                'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div 
                className="flex-1 flex items-center gap-3 overflow-hidden"
                onClick={() => handleDocClick(doc)}
              >
                <div className={`p-1.5 rounded-md ${
                  isSelected(doc) ? 'bg-blue-600/30' : 
                  isCompared(doc) ? 'bg-emerald-600/30' : 
                  'bg-slate-800'
                }`}>
                  <FileText className="w-4 h-4 shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{doc.filename}</p>
                  <p className="text-xs opacity-60 mt-0.5">{doc.chunks} chunks</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(doc.id);
                }}
                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
          {documents.length === 0 && (
            <div className="text-center p-6 text-slate-500">
              <p className="text-sm">No documents found.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
