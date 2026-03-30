import React, { useState, useEffect, useCallback } from 'react';
import { ExamData, ExamAnswers, ExamResult, EssayGradeResult } from '../types';
import { generateExam, gradeEssay } from '../services/examAI';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';
import { cn } from '../lib/utils';

interface ExamViewProps {
  apiKey: string;
  model: string;
  grade: string;
  onFinish: (result: ExamResult) => void;
  onCancel: () => void;
}

type ExamSection = 'mc' | 'tf' | 'essay';

export default function ExamView({ apiKey, model, grade, onFinish, onCancel }: ExamViewProps) {
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grading, setGrading] = useState(false);
  
  const [answers, setAnswers] = useState<ExamAnswers>({ mc: {}, tf: {}, essay: {} });
  const [activeSection, setActiveSection] = useState<ExamSection>('mc');
  const [currentMCIndex, setCurrentMCIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes
  const [startTime] = useState(Date.now());
  const [isFinished, setIsFinished] = useState(false);

  // Generate exam on mount
  useEffect(() => {
    generateExam(apiKey, model, grade)
      .then(data => {
        setExamData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Không thể tạo đề thi. Vui lòng thử lại.');
        setLoading(false);
      });
  }, [apiKey, model, grade]);

  // Timer
  useEffect(() => {
    if (loading || isFinished || !examData) return;
    if (timeLeft <= 0) {
      Swal.fire('Hết giờ!', 'Bài làm sẽ được tự động nộp và chấm điểm.', 'info').then(() => {
        handleSubmit();
      });
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading, isFinished, examData]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // MC handlers
  const handleMCAnswer = (qId: string, optIdx: number) => {
    setAnswers(prev => ({ ...prev, mc: { ...prev.mc, [qId]: optIdx } }));
  };

  // TF handlers
  const handleTFAnswer = (qId: string, stmtIdx: number, value: boolean) => {
    setAnswers(prev => ({
      ...prev,
      tf: {
        ...prev.tf,
        [qId]: { ...(prev.tf[qId] || {}), [stmtIdx]: value }
      }
    }));
  };

  // Essay handlers
  const handleEssayAnswer = (qId: string, text: string) => {
    setAnswers(prev => ({ ...prev, essay: { ...prev.essay, [qId]: text } }));
  };

  // Grading & Submit
  const handleSubmit = useCallback(async () => {
    if (isFinished || !examData) return;
    setIsFinished(true);
    setGrading(true);

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    // Grade MC: each correct = 0.25
    let mcCorrectCount = 0;
    examData.multipleChoice.forEach(q => {
      if (answers.mc[q.id] === q.correctAnswer) mcCorrectCount++;
    });
    const mcScore = mcCorrectCount * 0.25;

    // Grade TF: each correct statement = 0.25
    let tfCorrectCount = 0;
    examData.trueFalse.forEach(q => {
      q.statements.forEach((stmt, idx) => {
        const userAnswer = answers.tf[q.id]?.[idx];
        if (userAnswer === stmt.isTrue) tfCorrectCount++;
      });
    });
    const tfScore = tfCorrectCount * 0.25;

    // Grade Essay via AI
    let essayScores: EssayGradeResult[] = [];
    let essayScore = 0;
    
    try {
      for (const q of examData.essay) {
        const studentAnswer = answers.essay[q.id] || '';
        const result = await gradeEssay(apiKey, model, q, studentAnswer);
        essayScores.push(result);
        essayScore += result.score;
      }
    } catch {
      // Fallback: give 0 for essay if AI fails
      essayScores = examData.essay.map(() => ({ score: 0, feedback: 'Không thể chấm tự luận (lỗi AI).' }));
    }

    const totalScore = Math.round((mcScore + tfScore + essayScore) * 100) / 100;

    const result: ExamResult = {
      examData,
      answers,
      mcScore,
      mcCorrectCount,
      tfScore,
      tfCorrectCount,
      essayScores,
      essayScore,
      totalScore,
      timeSpent,
      date: new Date().toISOString(),
    };

    setGrading(false);
    onFinish(result);
  }, [isFinished, examData, answers, apiKey, model, startTime, onFinish]);

  const confirmSubmit = () => {
    const mcAnswered = Object.keys(answers.mc).length;
    const tfAnswered = Object.keys(answers.tf).length;
    const essayAnswered = Object.values(answers.essay).filter(v => (v as string).trim()).length;

    Swal.fire({
      title: 'Nộp bài thi?',
      html: `
        <div style="text-align: left; font-size: 14px;">
          <p>📝 Trắc nghiệm: <b>${mcAnswered}/24</b> câu đã trả lời</p>
          <p>✅ Đúng/Sai: <b>${tfAnswered}/2</b> câu đã trả lời</p>
          <p>📄 Tự luận: <b>${essayAnswered}/2</b> câu đã trả lời</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Nộp bài',
      cancelButtonText: 'Làm tiếp',
      confirmButtonColor: '#10b981',
    }).then(res => {
      if (res.isConfirmed) handleSubmit();
    });
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center text-white text-3xl shadow-xl"
        >
          <i className="fa-solid fa-wand-magic-sparkles"></i>
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">AI đang tạo đề thi...</h2>
        <p className="text-slate-500">Đề thi Tin học lớp {grade} - 45 phút - Sách Kết nối tri thức</p>
        <div className="mt-8 flex justify-center gap-2">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-blue-400"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error || !examData) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24">
        <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-red-100 flex items-center justify-center text-red-500 text-3xl">
          <i className="fa-solid fa-circle-exclamation"></i>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Không thể tạo đề thi</h2>
        <p className="text-slate-500 mb-8">{error}</p>
        <button onClick={onCancel} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:scale-105 transition-all">
          Quay lại
        </button>
      </div>
    );
  }

  // --- GRADING STATE ---
  if (grading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-3xl shadow-xl"
        >
          <i className="fa-solid fa-check-double"></i>
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Đang chấm bài...</h2>
        <p className="text-slate-500">AI đang chấm phần tự luận của bạn</p>
      </div>
    );
  }

  // Section tabs
  const sections: { key: ExamSection; label: string; icon: string; count: string }[] = [
    { key: 'mc', label: 'Trắc nghiệm', icon: 'fa-solid fa-list-check', count: '24 câu • 6đ' },
    { key: 'tf', label: 'Đúng / Sai', icon: 'fa-solid fa-check-double', count: '2 câu • 2đ' },
    { key: 'essay', label: 'Tự luận', icon: 'fa-solid fa-pen-fancy', count: '2 câu • 2đ' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Exam Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-orange-500 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg">
            <i className="fa-solid fa-file-signature"></i>
          </div>
          <div>
            <h2 className="font-bold text-slate-800">Đề thi Tin học {grade}</h2>
            <p className="text-xs text-slate-500 font-medium">45 phút • 10 điểm • SGK Kết nối tri thức</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold border",
            timeLeft <= 300 ? "bg-red-50 text-red-600 border-red-100 animate-pulse" : "bg-orange-50 text-orange-600 border-orange-100"
          )}>
            <i className="fa-regular fa-clock"></i>
            <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-red-500 transition-colors" title="Hủy bài thi">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {sections.map(sec => (
          <button
            key={sec.key}
            onClick={() => setActiveSection(sec.key)}
            className={cn(
              "flex items-center gap-3 px-5 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap",
              activeSection === sec.key
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "bg-white text-slate-500 border border-slate-100 hover:border-blue-200 hover:text-blue-600"
            )}
          >
            <i className={sec.icon}></i>
            <span>{sec.label}</span>
            <span className={cn(
              "text-[10px] px-2 py-0.5 rounded-full font-bold",
              activeSection === sec.key ? "bg-white/20" : "bg-slate-100"
            )}>{sec.count}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* === PHẦN 1: TRẮC NGHIỆM === */}
        {activeSection === 'mc' && (
          <motion.div key="mc" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-500">Câu {currentMCIndex + 1} / 24</span>
                  <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">0.25đ</span>
                </div>
              </div>

              {examData.multipleChoice[currentMCIndex] && (
                <div>
                  <h3 className="text-lg font-bold text-slate-800 leading-relaxed mb-6">
                    <span className="text-blue-500 mr-2">Câu {currentMCIndex + 1}.</span>
                    {examData.multipleChoice[currentMCIndex].content}
                  </h3>

                  <div className="grid grid-cols-1 gap-3">
                    {examData.multipleChoice[currentMCIndex].options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleMCAnswer(examData.multipleChoice[currentMCIndex].id, idx)}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98]",
                          answers.mc[examData.multipleChoice[currentMCIndex].id] === idx
                            ? "bg-blue-50 border-blue-500 text-blue-700 shadow-md shadow-blue-50"
                            : "bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0",
                          answers.mc[examData.multipleChoice[currentMCIndex].id] === idx
                            ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"
                        )}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="font-medium">{opt}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-50">
                    <button
                      onClick={() => setCurrentMCIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentMCIndex === 0}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-all"
                    >
                      <i className="fa-solid fa-chevron-left"></i> Quay lại
                    </button>
                    {currentMCIndex < 23 ? (
                      <button
                        onClick={() => setCurrentMCIndex(prev => prev + 1)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 hover:scale-105 transition-all"
                      >
                        Tiếp theo <i className="fa-solid fa-chevron-right"></i>
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveSection('tf')}
                        className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-100 hover:scale-105 transition-all"
                      >
                        Sang phần Đúng/Sai <i className="fa-solid fa-arrow-right"></i>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* MC Navigator */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {examData.multipleChoice.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentMCIndex(idx)}
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all",
                    currentMCIndex === idx ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110" :
                    answers.mc[q.id] !== undefined ? "bg-blue-50 text-blue-600 border border-blue-100" :
                    "bg-white text-slate-400 border border-slate-100 hover:border-slate-300"
                  )}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* === PHẦN 2: ĐÚNG/SAI === */}
        {activeSection === 'tf' && (
          <motion.div key="tf" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="space-y-8">
              {examData.trueFalse.map((q, qIdx) => (
                <div key={q.id} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-bold text-slate-500">Câu {qIdx + 1}</span>
                    <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">4 ý × 0.25đ</span>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl mb-6 border border-slate-100">
                    <p className="text-slate-700 leading-relaxed font-medium">{q.content}</p>
                  </div>

                  <div className="space-y-3">
                    {q.statements.map((stmt, sIdx) => (
                      <div key={sIdx} className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-white">
                        <span className="text-sm text-slate-700 flex-1">
                          <span className="font-bold text-slate-500 mr-2">{String.fromCharCode(97 + sIdx)})</span>
                          {stmt.statement}
                        </span>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleTFAnswer(q.id, sIdx, true)}
                            className={cn(
                              "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                              answers.tf[q.id]?.[sIdx] === true
                                ? "bg-green-500 text-white shadow-md"
                                : "bg-slate-100 text-slate-500 hover:bg-green-50 hover:text-green-600"
                            )}
                          >
                            Đúng
                          </button>
                          <button
                            onClick={() => handleTFAnswer(q.id, sIdx, false)}
                            className={cn(
                              "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                              answers.tf[q.id]?.[sIdx] === false
                                ? "bg-red-500 text-white shadow-md"
                                : "bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600"
                            )}
                          >
                            Sai
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-between">
                <button
                  onClick={() => setActiveSection('mc')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                >
                  <i className="fa-solid fa-chevron-left"></i> Phần Trắc nghiệm
                </button>
                <button
                  onClick={() => setActiveSection('essay')}
                  className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-100 hover:scale-105 transition-all"
                >
                  Sang phần Tự luận <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* === PHẦN 3: TỰ LUẬN === */}
        {activeSection === 'essay' && (
          <motion.div key="essay" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="space-y-8">
              {examData.essay.map((q, qIdx) => (
                <div key={q.id} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-bold text-slate-500">Câu {qIdx + 1}</span>
                    <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-bold">1 điểm</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 leading-relaxed mb-6">{q.content}</h3>

                  <textarea
                    value={answers.essay[q.id] || ''}
                    onChange={e => handleEssayAnswer(q.id, e.target.value)}
                    placeholder="Nhập câu trả lời của bạn..."
                    rows={6}
                    className="w-full p-5 rounded-2xl border-2 border-slate-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none resize-y text-sm text-slate-700 placeholder-slate-400 transition-all"
                  />
                  <p className="text-xs text-slate-400 mt-2 text-right">
                    {(answers.essay[q.id] || '').length} ký tự
                  </p>
                </div>
              ))}

              <div className="flex justify-between items-center">
                <button
                  onClick={() => setActiveSection('tf')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                >
                  <i className="fa-solid fa-chevron-left"></i> Phần Đúng/Sai
                </button>
                <button
                  onClick={confirmSubmit}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-green-200 hover:scale-105 transition-all"
                >
                  <i className="fa-solid fa-paper-plane"></i> Nộp bài
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
