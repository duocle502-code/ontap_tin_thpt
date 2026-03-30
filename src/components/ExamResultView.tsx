import React from 'react';
import { ExamResult } from '../types';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { marked } from 'marked';

interface ExamResultViewProps {
  result: ExamResult;
  onRetry: () => void;
  onHome: () => void;
}

export default function ExamResultView({ result, onRetry, onHome }: ExamResultViewProps) {
  const { examData, answers, mcScore, mcCorrectCount, tfScore, tfCorrectCount, essayScores, essayScore, totalScore, timeSpent } = result;

  const getScoreColor = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 80) return 'text-green-500';
    if (pct >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  const getGrade = (score: number) => {
    if (score >= 9) return { label: 'Xuất sắc! 🏆', color: 'from-yellow-400 to-orange-500' };
    if (score >= 8) return { label: 'Giỏi! 🌟', color: 'from-green-400 to-emerald-500' };
    if (score >= 6.5) return { label: 'Khá tốt! 👍', color: 'from-blue-400 to-blue-500' };
    if (score >= 5) return { label: 'Đạt yêu cầu', color: 'from-orange-400 to-orange-500' };
    return { label: 'Cần cố gắng hơn 💪', color: 'from-red-400 to-red-500' };
  };

  const grade = getGrade(totalScore);

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Score Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100 text-center mb-10 relative overflow-hidden"
      >
        <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${grade.color}`}></div>
        
        <div className="mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className={cn("text-7xl font-black mb-2", getScoreColor(totalScore, 10))}
          >
            {totalScore}
            <span className="text-3xl text-slate-400">/10</span>
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-800">{grade.label}</h2>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
            <div className="text-xl font-bold text-blue-600">{mcScore}/6</div>
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Trắc nghiệm</div>
            <div className="text-[10px] text-blue-400">{mcCorrectCount}/24 câu đúng</div>
          </div>
          <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
            <div className="text-xl font-bold text-green-600">{tfScore}/2</div>
            <div className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Đúng/Sai</div>
            <div className="text-[10px] text-green-400">{tfCorrectCount}/8 ý đúng</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
            <div className="text-xl font-bold text-purple-600">{essayScore}/2</div>
            <div className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Tự luận</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="text-xl font-bold text-slate-700">
              {Math.floor(timeSpent / 60)}p {timeSpent % 60}s
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thời gian</div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={onRetry} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 hover:scale-105 transition-all flex items-center gap-2">
            <i className="fa-solid fa-rotate-right"></i> Thi lại
          </button>
          <button onClick={onHome} className="px-8 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all">
            Về trang chủ
          </button>
        </div>
      </motion.div>

      {/* === PHẦN 1: Review MC === */}
      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-sm">
          <i className="fa-solid fa-list-check"></i>
        </div>
        Phần 1: Trắc nghiệm ({mcScore}/6 điểm)
      </h3>
      <div className="space-y-4 mb-10">
        {examData.multipleChoice.map((q, idx) => {
          const userAnswer = answers.mc[q.id];
          const isCorrect = userAnswer === q.correctAnswer;
          return (
            <div key={q.id} className={cn(
              "bg-white p-5 rounded-2xl border shadow-sm",
              isCorrect ? "border-green-100" : userAnswer !== undefined ? "border-red-100" : "border-slate-100"
            )}>
              <div className="flex items-start gap-3 mb-3">
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5",
                  isCorrect ? "bg-green-100 text-green-600" :
                  userAnswer !== undefined ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-400"
                )}>
                  {idx + 1}
                </div>
                <p className="text-sm font-bold text-slate-700 leading-relaxed">{q.content}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-10">
                {q.options.map((opt, optIdx) => (
                  <div
                    key={optIdx}
                    className={cn(
                      "p-2.5 rounded-xl text-xs flex items-center gap-2 border",
                      optIdx === q.correctAnswer ? "bg-green-50 border-green-200 text-green-700 font-medium" :
                      optIdx === userAnswer && optIdx !== q.correctAnswer ? "bg-red-50 border-red-200 text-red-600 line-through" :
                      "bg-slate-50 border-slate-100 text-slate-500"
                    )}
                  >
                    <span className={cn(
                      "w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold shrink-0",
                      optIdx === q.correctAnswer ? "bg-green-500 text-white" :
                      optIdx === userAnswer ? "bg-red-400 text-white" :
                      "bg-slate-200 text-slate-500"
                    )}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{opt}</span>
                    {optIdx === q.correctAnswer && <i className="fa-solid fa-check ml-auto text-green-500"></i>}
                    {optIdx === userAnswer && optIdx !== q.correctAnswer && <i className="fa-solid fa-xmark ml-auto text-red-400"></i>}
                  </div>
                ))}
              </div>

              {q.explanation && (
                <div className="ml-10 mt-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50 text-[11px] text-slate-600">
                  <span className="font-bold text-blue-600"><i className="fa-solid fa-lightbulb mr-1"></i>Giải thích:</span> {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* === PHẦN 2: Review TF === */}
      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-sm">
          <i className="fa-solid fa-check-double"></i>
        </div>
        Phần 2: Đúng/Sai ({tfScore}/2 điểm)
      </h3>
      <div className="space-y-6 mb-10">
        {examData.trueFalse.map((q, qIdx) => (
          <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-bold text-slate-500">Câu {qIdx + 1}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100">
              <p className="text-sm text-slate-700 leading-relaxed">{q.content}</p>
            </div>
            <div className="space-y-2">
              {q.statements.map((stmt, sIdx) => {
                const userAnswer = answers.tf[q.id]?.[sIdx];
                const isCorrect = userAnswer === stmt.isTrue;
                const notAnswered = userAnswer === undefined;
                return (
                  <div key={sIdx} className={cn(
                    "flex items-center justify-between gap-3 p-3 rounded-xl border text-sm",
                    notAnswered ? "border-slate-100 bg-slate-50" :
                    isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                  )}>
                    <span className="flex-1">
                      <span className="font-bold text-slate-500 mr-2">{String.fromCharCode(97 + sIdx)})</span>
                      {stmt.statement}
                    </span>
                    <div className="flex items-center gap-2 shrink-0 text-xs font-bold">
                      {!notAnswered && (
                        <span className={isCorrect ? "text-green-600" : "text-red-500"}>
                          {isCorrect ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-xmark"></i>}
                        </span>
                      )}
                      <span className={cn(
                        "px-2 py-1 rounded-lg",
                        notAnswered ? "bg-slate-200 text-slate-500" :
                        userAnswer ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                      )}>
                        {notAnswered ? '–' : userAnswer ? 'Đúng' : 'Sai'}
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className={cn(
                        "px-2 py-1 rounded-lg",
                        stmt.isTrue ? "bg-green-500 text-white" : "bg-red-500 text-white"
                      )}>
                        {stmt.isTrue ? 'Đúng' : 'Sai'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {q.explanation && (
              <div className="mt-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50 text-[11px] text-slate-600">
                <span className="font-bold text-blue-600"><i className="fa-solid fa-lightbulb mr-1"></i>Giải thích:</span> {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* === PHẦN 3: Review Essay === */}
      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-sm">
          <i className="fa-solid fa-pen-fancy"></i>
        </div>
        Phần 3: Tự luận ({essayScore}/2 điểm)
      </h3>
      <div className="space-y-6">
        {examData.essay.map((q, qIdx) => {
          const gradeResult = essayScores[qIdx];
          const userAnswer = answers.essay[q.id] || '';
          return (
            <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-500">Câu {qIdx + 1}</span>
                  <span className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-full",
                    gradeResult.score >= 0.75 ? "bg-green-100 text-green-600" :
                    gradeResult.score >= 0.5 ? "bg-orange-100 text-orange-600" : "bg-red-100 text-red-600"
                  )}>
                    {gradeResult.score}/1 điểm
                  </span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-800 leading-relaxed mb-4">{q.content}</h4>

              {/* Student Answer */}
              <div className="mb-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Bài làm của bạn:</p>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap">
                  {userAnswer || <span className="italic text-slate-400">Không trả lời</span>}
                </div>
              </div>

              {/* AI Feedback */}
              <div className="mb-4 p-4 rounded-xl bg-orange-50 border border-orange-100">
                <p className="text-[11px] font-bold text-orange-500 uppercase tracking-widest mb-2">
                  <i className="fa-solid fa-robot mr-1"></i>Nhận xét của AI:
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">{gradeResult.feedback}</p>
              </div>

              {/* Model Answer */}
              <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                <p className="text-[11px] font-bold text-green-500 uppercase tracking-widest mb-2">
                  <i className="fa-solid fa-check-circle mr-1"></i>Đáp án mẫu:
                </p>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{q.modelAnswer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
