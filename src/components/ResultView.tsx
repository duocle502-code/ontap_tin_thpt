import React, { useState } from 'react';
import { QuizSession, Subject, Question } from '../types';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { callGeminiAI, PROMPTS } from '../services/gemini';
import { marked } from 'marked';
import Swal from 'sweetalert2';

interface ResultViewProps {
  session: QuizSession;
  subject: Subject;
  questions: Question[];
  onRetry: () => void;
  onHome: () => void;
  onTutor: () => void;
  apiKey?: string;
}

export default function ResultView({ session, subject, questions, onRetry, onHome, onTutor, apiKey }: ResultViewProps) {
  const [explainingId, setExplainingId] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  
  const handleExplain = async (question: Question) => {
    if (!apiKey) {
      Swal.fire({
        title: 'Yêu cầu API Key',
        text: 'Vui lòng cấu hình Gemini API Key trong phần Cài đặt để sử dụng tính năng giải thích bằng AI.',
        icon: 'info',
        confirmButtonText: 'Đã hiểu'
      });
      return;
    }

    setExplainingId(question.id);
    try {
      const prompt = PROMPTS.EXPLAIN_QUESTION(
        question.content, 
        question.options[question.correctAnswer], 
        question.explanation
      );
      const result = await callGeminiAI(prompt, apiKey);
      if (result) {
        setExplanations(prev => ({ ...prev, [question.id]: result }));
      }
    } catch (error: any) {
      Swal.fire('Lỗi', 'Không thể kết nối với AI: ' + error.message, 'error');
    } finally {
      setExplainingId(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Xuất sắc! Bạn đã nắm vững kiến thức.';
    if (score >= 80) return 'Rất tốt! Hãy tiếp tục phát huy nhé.';
    if (score >= 65) return 'Khá tốt! Cần ôn tập thêm một chút nữa.';
    if (score >= 50) return 'Đạt yêu cầu. Hãy cố gắng hơn ở lần sau.';
    return 'Cần cố gắng nhiều hơn! Hãy ôn tập lại lý thuyết.';
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Score Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center mb-12 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-orange-500"></div>
        
        <div className="mb-6">
          <div className={cn("text-7xl font-black mb-2", getScoreColor(session.score))}>
            {Math.round(session.score)}%
          </div>
          <h2 className="text-2xl font-bold text-slate-800">{getScoreMessage(session.score)}</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <div className="bg-slate-50 p-4 rounded-2xl">
            <div className="text-2xl font-bold text-slate-800">{session.correctAnswers}/{session.totalQuestions}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đúng</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl">
            <div className="text-2xl font-bold text-slate-800">{session.totalQuestions - session.correctAnswers}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sai</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl">
            <div className="text-2xl font-bold text-slate-800">{Math.floor(session.timeSpent / 60)}p {session.timeSpent % 60}s</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thời gian</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl">
            <div className="text-2xl font-bold text-slate-800">{new Date(session.date).toLocaleDateString('vi-VN')}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ngày làm</div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <button 
            onClick={onRetry}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 hover:scale-105 transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-rotate-right"></i>
            Làm lại bài
          </button>
          <button 
            onClick={onTutor}
            className="px-8 py-3 bg-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-100 hover:scale-105 transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-robot"></i>
            Hỏi Gia sư AI
          </button>
          <button 
            onClick={onHome}
            className="px-8 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
          >
            Về trang chủ
          </button>
        </div>
      </motion.div>

      {/* Review Section */}
      <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
        <i className="fa-solid fa-magnifying-glass text-blue-500"></i>
        Xem lại đáp án
      </h3>

      <div className="space-y-6">
        {questions.map((q, index) => (
          <div key={q.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                  {index + 1}
                </div>
                <span className={cn(
                  "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest",
                  q.difficulty === 'Nhận biết' ? "bg-green-100 text-green-600" :
                  q.difficulty === 'Thông hiểu' ? "bg-blue-100 text-blue-600" :
                  "bg-orange-100 text-orange-600"
                )}>
                  {q.difficulty}
                </span>
              </div>
              
              <button
                onClick={() => handleExplain(q)}
                disabled={explainingId === q.id}
                className="flex items-center gap-2 text-xs font-bold text-orange-500 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
              >
                {explainingId === q.id ? (
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                ) : (
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                )}
                Giải thích AI
              </button>
            </div>

            <h4 className="font-bold text-slate-800 mb-4 leading-relaxed">{q.content}</h4>

            <div className="grid grid-cols-1 gap-2 mb-4">
              {q.options.map((option, optIdx) => (
                <div 
                  key={optIdx}
                  className={cn(
                    "p-3 rounded-xl text-sm flex items-center gap-3 border",
                    optIdx === q.correctAnswer ? "bg-green-50 border-green-200 text-green-700 font-medium" :
                    "bg-slate-50 border-slate-100 text-slate-500"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0",
                    optIdx === q.correctAnswer ? "bg-green-500 text-white" : "bg-slate-200 text-slate-500"
                  )}>
                    {String.fromCharCode(65 + optIdx)}
                  </div>
                  <span>{option}</span>
                  {optIdx === q.correctAnswer && <i className="fa-solid fa-check ml-auto"></i>}
                </div>
              ))}
            </div>

            {explanations[q.id] ? (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-5 bg-orange-50 rounded-2xl border border-orange-100 text-sm text-slate-700 prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: marked.parse(explanations[q.id]) }}
              />
            ) : (
              <div className="mt-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 text-xs text-slate-600">
                <p className="font-bold text-blue-600 mb-1 flex items-center gap-2">
                  <i className="fa-solid fa-circle-info"></i>
                  Gợi ý:
                </p>
                {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
