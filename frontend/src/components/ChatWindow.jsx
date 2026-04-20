import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatWindow({ selectedDoc, comparisonDoc, apiUrl }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef(null);

  // Auto-scroll Down
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      // If comparison mode is active, we don't apply a single filter file constraint,
      // but maybe pass an array. For this simple MVP, if comparisonDoc is set, we search global 
      // but prompt the user. Given the backend setup, we can only filter by one. Let's just search global if compared.
      const filter_file = (selectedDoc && !comparisonDoc) ? selectedDoc.filename : null;

      const res = await axios.post(`${apiUrl}/chat`, {
        query: userMsg,
        filter_file: filter_file
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.answer,
        citations: res.data.citations,
        cached: res.data.cached
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <Bot className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg">How can I help you regarding these documents?</p>
            {comparisonDoc && (
              <p className="text-sm mt-2 text-emerald-400/80">Comparing: {selectedDoc.filename} & {comparisonDoc.filename}</p>
            )}
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-800 border border-slate-700'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-emerald-400" />}
              </div>
              
              <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-blue-600/90 text-white rounded-tr-sm shadow-md' 
                    : msg.isError 
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-slate-800 shadow-md border border-slate-700/50 rounded-tl-sm text-slate-200'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>

                {msg.citations && msg.citations.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {msg.citations.map((c, i) => (
                      <div key={i} className="group relative">
                        <span className="text-xs bg-slate-800/80 text-slate-400 px-2 py-1 rounded cursor-pointer hover:bg-slate-700 hover:text-slate-200 transition-colors border border-slate-700">
                          [{c.citation_number}] {c.file_name}
                        </span>
                        {/* Hover Preview Tooltip */}
                        <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                          <p className="text-xs text-slate-300 leading-relaxed italic">"{c.text_preview}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-4xl mx-auto">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
               <Bot className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-sm">
              <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
            </div>
          </motion.div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <div className="p-4 bg-slate-950/80 backdrop-blur border-t border-slate-800 shrink-0">
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder={selectedDoc || comparisonDoc ? "Ask a question about selected documents..." : "Ask a question across all documents..."}
            className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl py-4 pl-4 pr-14 outline-none transition-colors shadow-inner disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition-colors flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
