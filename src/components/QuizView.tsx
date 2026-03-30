import React, { useState, useEffect, useCallback } from 'react';
import { Subject, Question, QuizSession } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';
import { cn } from '../lib/utils';

interface QuizViewProps {
  subject: Subject;
  questions: Question[];
  onFinish: (session: QuizSession) => void;
  onCancel: () => void;
  onRegenerate?: () => void;
}

export default function QuizView({ subject, questions, onFinish, onCancel, onRegenerate }: QuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(questions.length * 60); // 1 minute per question
  const [isFinished, setIsFinished] = useState(false);
  const [startTime] = useState(Date.now());
  const [navPage, setNavPage] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const QUESTIONS_PER_NAV_PAGE = 25;
  const totalNavPages = Math.ceil(questions.length / QUESTIONS_PER_NAV_PAGE);

  const handleFinish = useCallback(() => {
    if (isFinished) return;
    setIsFinished(true);

    const correctAnswersCount = questions.reduce((acc, q) => {
      return acc + (answers[q.id] === q.correctAnswer ? 1 : 0);
    }, 0);

    const score = (correctAnswersCount / questions.length) * 100;
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    const session: QuizSession = {
      id: Math.random().toString(36).substr(2, 9),
      subjectId: subject.id,
      score,
      totalQuestions: questions.length,
      correctAnswers: correctAnswersCount,
      timeSpent,
      date: new Date().toISOString()
    };

    onFinish(session);
  }, [answers, questions, subject.id, startTime, onFinish, isFinished]);

  useEffect(() => {
    if (timeLeft <= 0) {
      Swal.fire('Hết giờ!', 'Bài làm của bạn sẽ được tự động nộp.', 'info').then(() => {
        handleFinish();
      });
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, handleFinish]);

  // Update nav page when jumping to a question
  useEffect(() => {
    const newPage = Math.floor(currentQuestionIndex / QUESTIONS_PER_NAV_PAGE);
    if (newPage !== navPage) {
      setNavPage(newPage);
    }
  }, [currentQuestionIndex]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optionIndex: number) => {
    setAnswers({ ...answers, [currentQuestion.id]: optionIndex });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const confirmFinish = () => {
    const unansweredCount = questions.length - Object.keys(answers).length;
    Swal.fire({
      title: 'Nộp bài?',
      text: unansweredCount > 0 
        ? `Bạn còn ${unansweredCount} câu chưa trả lời. Bạn chắc chắn muốn nộp bài?`
        : 'Bạn đã hoàn thành tất cả câu hỏi. Nộp bài ngay?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Nộp bài',
      cancelButtonText: 'Làm tiếp'
    }).then((result) => {
      if (result.isConfirmed) {
        handleFinish();
      }
    });
  };

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Quiz Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 text-xl">
            <i className={subject.icon}></i>
          </div>
          <div>
            <h2 className="font-bold text-slate-800 line-clamp-1">{subject.name}</h2>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              Câu hỏi {currentQuestionIndex + 1} / {questions.length}
              <span className="ml-3 text-blue-500">• Đã làm: {answeredCount}/{questions.length}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-600 font-bold text-xs rounded-xl border border-violet-100 hover:bg-violet-100 transition-all"
              title="Tạo 50 câu hỏi hoàn toàn mới"
            >
              <i className="fa-solid fa-rotate"></i>
              Đề mới
            </button>
          )}
          <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-2xl text-orange-600 font-bold border border-orange-100">
            <i className="fa-regular fa-clock"></i>
            <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
          </div>
          <button 
            onClick={onCancel}
            className="text-slate-400 hover:text-red-500 transition-colors"
            title="Hủy bài làm"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
          initial={{ width: 0 }}
          animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 min-h-[400px] flex flex-col"
        >
          <div className="mb-8">
            <span className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 inline-block",
              currentQuestion.difficulty === 'Nhận biết' ? "bg-green-100 text-green-600" :
              currentQuestion.difficulty === 'Thông hiểu' ? "bg-blue-100 text-blue-600" :
              "bg-orange-100 text-orange-600"
            )}>
              {currentQuestion.difficulty}
            </span>
            <h3 className="text-xl font-bold text-slate-800 leading-relaxed">
              {currentQuestion.content}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 flex-grow">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectOption(index)}
                className={cn(
                  "flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all active:scale-[0.98]",
                  answers[currentQuestion.id] === index
                    ? "bg-blue-50 border-blue-500 text-blue-700 shadow-md shadow-blue-50"
                    : "bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0",
                  answers[currentQuestion.id] === index
                    ? "bg-blue-500 text-white"
                    : "bg-slate-100 text-slate-500"
                )}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="font-medium">{option}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-50">
            <button
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-all"
            >
              <i className="fa-solid fa-chevron-left"></i>
              Quay lại
            </button>
            
            <div className="flex gap-4">
              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={confirmFinish}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-green-100 hover:scale-105 transition-all"
                >
                  Nộp bài
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 hover:scale-105 transition-all"
                >
                  Tiếp theo
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Question Navigator — Paginated for 50 questions */}
      <div className="mt-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        {/* Nav page controls */}
        {totalNavPages > 1 && (
          <div className="flex items-center justify-center gap-2 mb-4">
            {Array.from({ length: totalNavPages }, (_, i) => {
              const start = i * QUESTIONS_PER_NAV_PAGE + 1;
              const end = Math.min((i + 1) * QUESTIONS_PER_NAV_PAGE, questions.length);
              return (
                <button
                  key={i}
                  onClick={() => setNavPage(i)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                    navPage === i 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  )}
                >
                  Câu {start}-{end}
                </button>
              );
            })}
          </div>
        )}

        {/* Question buttons */}
        <div className="flex flex-wrap justify-center gap-2">
          {questions
            .slice(navPage * QUESTIONS_PER_NAV_PAGE, (navPage + 1) * QUESTIONS_PER_NAV_PAGE)
            .map((q, index) => {
              const globalIndex = navPage * QUESTIONS_PER_NAV_PAGE + index;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(globalIndex)}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all",
                    currentQuestionIndex === globalIndex ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110" :
                    answers[q.id] !== undefined ? "bg-blue-50 text-blue-600 border border-blue-100" :
                    "bg-white text-slate-400 border border-slate-100 hover:border-slate-300"
                  )}
                >
                  {globalIndex + 1}
                </button>
              );
            })}
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6 mt-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-50 border border-blue-100"></span>
            Đã trả lời ({answeredCount})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-white border border-slate-100"></span>
            Chưa trả lời ({questions.length - answeredCount})
          </span>
        </div>
      </div>
    </div>
  );
}
