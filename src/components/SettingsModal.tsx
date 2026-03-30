import React, { useState } from 'react';
import { AppSettings } from '../types';
import { MODELS } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';
import { cn } from '../lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export default function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState(settings.model);
  const [theme, setTheme] = useState(settings.theme);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);

  const handleSave = () => {
    onSave({
      ...settings,
      apiKey,
      model,
      theme,
      soundEnabled
    });
    Swal.fire('Thành công', 'Cài đặt đã được lưu!', 'success');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
        >
          <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <i className="fa-solid fa-gear"></i>
              Cài đặt hệ thống
            </h3>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          <div className="p-8 space-y-8">
            {/* API Key Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Gemini API Key</label>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1"
                >
                  Lấy key tại đây
                  <i className="fa-solid fa-arrow-up-right-from-square"></i>
                </a>
              </div>
              <div className="relative">
                <i className="fa-solid fa-key absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Nhập API Key của bạn..."
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <i className={showKey ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                * API Key được lưu trữ an toàn trong LocalStorage của trình duyệt.
              </p>
            </div>

            {/* Model Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Chọn Model AI</label>
              <div className="grid grid-cols-1 gap-2">
                {MODELS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setModel(m)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border-2 text-sm font-medium transition-all",
                      model === m 
                        ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm shadow-blue-50" 
                        : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                    )}
                  >
                    <span>{m}</span>
                    {model === m && <i className="fa-solid fa-circle-check"></i>}
                  </button>
                ))}
              </div>
            </div>

            {/* Other Settings */}
            <div className="space-y-4 pt-4 border-t border-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                    <i className="fa-solid fa-moon"></i>
                  </div>
                  <span className="text-sm font-bold text-slate-700">Chế độ tối (Dark Mode)</span>
                </div>
                <button 
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  className={cn(
                    "w-12 h-6 rounded-full relative transition-colors",
                    theme === 'dark' ? "bg-blue-600" : "bg-slate-200"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                    theme === 'dark' ? "left-7" : "left-1"
                  )}></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                    <i className="fa-solid fa-volume-high"></i>
                  </div>
                  <span className="text-sm font-bold text-slate-700">Âm thanh thông báo</span>
                </div>
                <button 
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={cn(
                    "w-12 h-6 rounded-full relative transition-colors",
                    soundEnabled ? "bg-blue-600" : "bg-slate-200"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                    soundEnabled ? "left-7" : "left-1"
                  )}></div>
                </button>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={onClose}
                className="flex-grow py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="flex-grow py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
