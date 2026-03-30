import React from 'react';
import { QuizSession, Progress } from '../types';
import { MOCK_SUBJECTS } from '../data/mockData';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface DashboardProps {
  sessions: QuizSession[];
  progress: Progress;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Dashboard({ sessions, progress, onExport, onImport }: DashboardProps) {
  const chartData = sessions.slice(0, 7).reverse().map(s => ({
    date: new Date(s.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    score: Math.round(s.score)
  }));

  const stats = [
    { label: 'Tổng lượt làm bài', value: progress.totalAttempts, icon: 'fa-solid fa-clipboard-list', color: 'bg-blue-500' },
    { label: 'Điểm trung bình', value: `${Math.round(progress.averageScore)}%`, icon: 'fa-solid fa-star', color: 'bg-orange-500' },
    { label: 'Chuỗi ngày học', value: progress.streakDays, icon: 'fa-solid fa-fire', color: 'bg-red-500' },
    { label: 'Chủ đề đã học', value: new Set(sessions.map(s => s.subjectId)).size, icon: 'fa-solid fa-book', color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Tiến độ học tập</h2>
          <p className="text-slate-500">Theo dõi hành trình chinh phục môn Tin học của bạn</p>
        </div>
        <div className="flex gap-3">
          <label className="px-6 py-2.5 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-2 shadow-sm">
            <i className="fa-solid fa-file-import"></i>
            Nhập dữ liệu
            <input type="file" accept=".json" onChange={onImport} className="hidden" />
          </label>
          <button 
            onClick={onExport}
            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-file-export"></i>
            Xuất dữ liệu
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg", stat.color)}>
              <i className={stat.icon}></i>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800">{stat.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Card */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
            <i className="fa-solid fa-chart-area text-blue-500"></i>
            Biểu đồ điểm số (7 bài gần nhất)
          </h3>
          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                <i className="fa-solid fa-chart-simple text-5xl opacity-20"></i>
                <p className="font-medium">Chưa có dữ liệu bài làm để hiển thị biểu đồ</p>
              </div>
            )}
          </div>
        </div>

        {/* Weak Topics Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
            <i className="fa-solid fa-triangle-exclamation text-orange-500"></i>
            Chủ đề cần lưu ý
          </h3>
          <div className="space-y-4">
            {progress.weakTopics.length > 0 ? (
              progress.weakTopics.map((topic, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                  <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs">
                    <i className="fa-solid fa-book-open"></i>
                  </div>
                  <span className="text-sm font-bold text-orange-700">{topic}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                <i className="fa-solid fa-circle-check text-5xl text-green-500 opacity-20 mb-4 block"></i>
                <p className="text-sm font-medium">Tuyệt vời! Bạn đang học rất tốt tất cả các chủ đề.</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 p-6 bg-blue-600 rounded-2xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold mb-2">Lời khuyên từ AI</h4>
              <p className="text-xs opacity-90 leading-relaxed">
                Dựa trên kết quả của bạn, AI gợi ý bạn nên dành thêm 15 phút mỗi ngày để ôn tập về "Hệ điều hành" và "Mạng máy tính".
              </p>
            </div>
            <i className="fa-solid fa-robot absolute -bottom-4 -right-4 text-7xl opacity-10"></i>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
          <i className="fa-solid fa-history text-blue-500"></i>
          Lịch sử làm bài
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Chủ đề</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Ngày làm</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Điểm số</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Thời gian</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Kết quả</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sessions.length > 0 ? (
                sessions.map((session) => (
                  <tr key={session.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="font-bold text-slate-800 text-sm">
                        {MOCK_SUBJECTS.find(s => s.id === session.subjectId)?.name || 'Chủ đề không xác định'}
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-sm text-slate-500">
                      {new Date(session.date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-4 pr-4">
                      <span className={cn(
                        "font-black text-lg",
                        session.score >= 80 ? "text-green-500" : session.score >= 50 ? "text-orange-500" : "text-red-500"
                      )}>
                        {Math.round(session.score)}%
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-sm text-slate-500">
                      {Math.floor(session.timeSpent / 60)}p {session.timeSpent % 60}s
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[80px]">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              session.score >= 80 ? "bg-green-500" : session.score >= 50 ? "bg-orange-500" : "bg-red-500"
                            )}
                            style={{ width: `${session.score}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">{session.correctAnswers}/{session.totalQuestions}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Chưa có lịch sử làm bài nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
