import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { callGeminiAI, PROMPTS } from '../services/gemini';
import { marked } from 'marked';
import Swal from 'sweetalert2';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AITutorProps {
  apiKey?: string;
  model: string;
}

export default function AITutor({ apiKey, model }: AITutorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: 'Chào bạn! Mình là Gia sư AI chuyên về môn Tin học. Bạn cần giải đáp thắc mắc gì về chương trình Kết nối tri thức không?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!apiKey) {
      Swal.fire({
        title: 'Yêu cầu API Key',
        text: 'Vui lòng cấu hình Gemini API Key trong phần Cài đặt để trò chuyện với Gia sư AI.',
        icon: 'info',
        confirmButtonText: 'Đã hiểu'
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const prompt = PROMPTS.TUTOR_CHAT(history, input);
      const result = await callGeminiAI(prompt, apiKey, model);

      if (result) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: result,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error: any) {
      Swal.fire('Lỗi', 'Không thể kết nối với AI: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      {/* Chat Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-blue-500 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl">
            <i className="fa-solid fa-robot"></i>
          </div>
          <div>
            <h3 className="font-bold text-lg">Gia sư AI Tin học</h3>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-80">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Đang trực tuyến • {model}
            </div>
          </div>
        </div>
        <button 
          onClick={() => setMessages([messages[0]])}
          className="text-white/60 hover:text-white transition-colors"
          title="Xóa lịch sử trò chuyện"
        >
          <i className="fa-solid fa-trash-can"></i>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
              "flex gap-4 max-w-[85%]",
              message.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center text-sm shrink-0 shadow-sm",
              message.role === 'user' ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
            )}>
              <i className={message.role === 'user' ? "fa-solid fa-user" : "fa-solid fa-robot"}></i>
            </div>
            
            <div className={cn(
              "p-4 rounded-3xl text-sm leading-relaxed shadow-sm",
              message.role === 'user' 
                ? "bg-blue-50 text-blue-900 rounded-tr-none border border-blue-100" 
                : "bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100"
            )}>
              <div 
                className="prose prose-slate prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: marked.parse(message.content) }}
              />
              <div className={cn(
                "text-[9px] font-bold uppercase tracking-wider mt-2 opacity-40",
                message.role === 'user' ? "text-right" : "text-left"
              )}>
                {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </motion.div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4 max-w-[85%] mr-auto">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
              <i className="fa-solid fa-robot"></i>
            </div>
            <div className="p-4 bg-slate-50 rounded-3xl rounded-tl-none border border-slate-100 flex gap-1">
              <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-6 border-t border-slate-100 bg-slate-50/50">
        <div className="relative flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi AI về bài học, bài tập hoặc lý thuyết Tin học..."
            className="flex-grow pl-6 pr-14 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-100 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-3 font-medium uppercase tracking-widest">
          AI có thể đưa ra câu trả lời không chính xác, vui lòng kiểm tra lại kiến thức trong SGK.
        </p>
      </form>
    </div>
  );
}
