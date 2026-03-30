import React from 'react';
import { cn } from '../lib/utils';

interface HeaderProps {
  onOpenSettings: () => void;
  onNavigate: (view: 'home' | 'dashboard' | 'tutor' | 'onboarding') => void;
  currentView: string;
  hasProfile: boolean;
}

export default function Header({ onOpenSettings, onNavigate, currentView, hasProfile }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100 px-4 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => onNavigate('home')}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-graduation-cap text-xl"></i>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-slate-800">Informatics Mastery</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Ôn tập Tin học THPT</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onNavigate('home')}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              currentView === 'home' ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            Trang chủ
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              currentView === 'dashboard' ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            Tiến độ
          </button>
          <button
            onClick={() => onNavigate('tutor')}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              currentView === 'tutor' ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            Gia sư AI
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors relative"
            title="Cài đặt API Key"
          >
            <i className="fa-solid fa-gear"></i>
            {!localStorage.getItem('informatics_settings') && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
          
          <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>
          
          <div 
            className="hidden sm:flex items-center gap-3 pl-2 cursor-pointer hover:bg-slate-50 p-1 rounded-xl transition-colors"
            onClick={() => onNavigate('onboarding')}
            title="Chỉnh sửa hồ sơ"
          >
            <div className="text-right">
              <p className="text-xs font-bold text-slate-800">Học sinh</p>
              <p className="text-[10px] text-slate-500">Tin học 10-12</p>
            </div>
            <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-200">
              <i className="fa-solid fa-user"></i>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
