import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';
import { 
  Subject, 
  Question, 
  UserProfile, 
  QuizSession, 
  Progress, 
  AppSettings, 
  AppData,
  ExamResult 
} from './types';
import { MOCK_SUBJECTS, MOCK_QUESTIONS } from './data/mockData';
import Header from './components/Header';
import ProfileForm from './components/ProfileForm';
import SubjectList from './components/SubjectList';
import QuizView from './components/QuizView';
import ResultView from './components/ResultView';
import Dashboard from './components/Dashboard';
import AITutor from './components/AITutor';
import ExamView from './components/ExamView';
import ExamResultView from './components/ExamResultView';
import SettingsModal from './components/SettingsModal';
import { MODELS } from './services/gemini';
import { exportToWord, exportToPDF } from './services/exportData';
import { generateTopicQuestions, getCachedQuestions, clearCachedQuestions } from './services/topicQuizAI';

const INITIAL_SETTINGS: AppSettings = {
  theme: 'light',
  soundEnabled: true,
  autoSave: true,
  model: MODELS[0],
};

const INITIAL_PROGRESS: Progress = {
  totalAttempts: 0,
  averageScore: 0,
  streakDays: 0,
  weakTopics: [],
};

export default function App() {
  // --- State ---
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<QuizSession[]>([]);
  const [progress, setProgress] = useState<Progress>(INITIAL_PROGRESS);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'quiz' | 'result' | 'dashboard' | 'tutor' | 'onboarding' | 'exam' | 'examResult'>('home');
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [lastSession, setLastSession] = useState<QuizSession | null>(null);
  const [lastExamResult, setLastExamResult] = useState<ExamResult | null>(null);
  const [aiQuestions, setAiQuestions] = useState<Question[]>([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // --- Load Data ---
  useEffect(() => {
    const savedProfile = localStorage.getItem('informatics_profile');
    const savedSessions = localStorage.getItem('informatics_sessions');
    const savedSettings = localStorage.getItem('informatics_settings');
    const savedProgress = localStorage.getItem('informatics_progress');

    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else {
      setCurrentView('onboarding');
    }
    if (savedSessions) setSessions(JSON.parse(savedSessions));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedProgress) setProgress(JSON.parse(savedProgress));

    setIsLoaded(true);
  }, []);

  // --- Save Data ---
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('informatics_profile', JSON.stringify(profile));
    localStorage.setItem('informatics_sessions', JSON.stringify(sessions));
    localStorage.setItem('informatics_settings', JSON.stringify(settings));
    localStorage.setItem('informatics_progress', JSON.stringify(progress));
  }, [profile, sessions, settings, progress, isLoaded]);

  // --- Computed ---
  const filteredSubjects = useMemo(() => {
    if (!profile) return [];
    const gradeMatch = profile.className.match(/\d+/);
    if (!gradeMatch) return MOCK_SUBJECTS;
    const grade = gradeMatch[0];
    
    return MOCK_SUBJECTS.filter(s => {
      // Show general exams for everyone
      if (s.id.includes('thi-')) return true;
      // Show subjects matching the grade (e.g., "th10" matches grade "10")
      return s.id.includes(`th${grade}`);
    });
  }, [profile]);

  // --- Handlers ---
  const handleStartQuiz = async (subject: Subject) => {
    if (!profile) {
      Swal.fire({
        title: 'Thông báo',
        text: 'Vui lòng cập nhật thông tin cá nhân trước khi làm bài!',
        icon: 'warning',
        confirmButtonText: 'Đồng ý'
      });
      return;
    }

    // For exam subjects, use mock questions directly
    if (subject.id.includes('thi-')) {
      setActiveSubject(subject);
      setAiQuestions(MOCK_QUESTIONS.filter(q => q.subjectId === subject.id));
      setCurrentView('quiz');
      return;
    }

    // For topic quizzes, require API key
    if (!settings.apiKey) {
      Swal.fire({
        title: 'Yêu cầu API Key',
        text: 'Vui lòng cấu hình Gemini API Key trong Cài đặt để sử dụng tính năng ôn tập AI.',
        icon: 'info',
        confirmButtonText: 'Đã hiểu'
      });
      return;
    }

    // Check cache first
    const cached = getCachedQuestions(subject.id);
    if (cached) {
      setActiveSubject(subject);
      setAiQuestions(cached);
      setCurrentView('quiz');
      return;
    }

    // Generate questions via AI
    setActiveSubject(subject);
    setIsGeneratingQuiz(true);
    setCurrentView('quiz');

    try {
      const questions = await generateTopicQuestions(settings.apiKey, settings.model, subject);
      setAiQuestions(questions);
    } catch (err: any) {
      console.error('Failed to generate quiz:', err);
      Swal.fire({
        title: 'Lỗi tạo câu hỏi',
        text: err.message || 'Không thể tạo câu hỏi. Vui lòng thử lại.',
        icon: 'error',
        confirmButtonText: 'Quay lại'
      }).then(() => {
        setCurrentView('home');
      });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleRegenerateQuiz = async () => {
    if (!activeSubject || !settings.apiKey) return;
    
    const result = await Swal.fire({
      title: 'Tạo đề mới?',
      text: 'Hệ thống sẽ tạo 50 câu hỏi hoàn toàn mới cho chủ đề này.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Tạo đề mới',
      cancelButtonText: 'Hủy'
    });

    if (!result.isConfirmed) return;

    clearCachedQuestions(activeSubject.id);
    setIsGeneratingQuiz(true);

    try {
      const questions = await generateTopicQuestions(settings.apiKey, settings.model, activeSubject);
      setAiQuestions(questions);
    } catch (err: any) {
      Swal.fire('Lỗi', err.message || 'Không thể tạo câu hỏi mới.', 'error');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleFinishQuiz = (session: QuizSession) => {
    const newSessions = [session, ...sessions];
    setSessions(newSessions);
    setLastSession(session);
    
    // Update Progress
    const totalAttempts = newSessions.length;
    const averageScore = newSessions.reduce((acc, s) => acc + s.score, 0) / totalAttempts;
    
    // Simple weak topics logic: topics with score < 50%
    const weakTopics = Array.from(new Set(
      newSessions
        .filter(s => s.score < 50)
        .map(s => MOCK_SUBJECTS.find(sub => sub.id === s.subjectId)?.name || '')
        .filter(name => name !== '')
    ));

    setProgress({
      ...progress,
      totalAttempts,
      averageScore,
      weakTopics
    });

    setCurrentView('result');
  };

  const handleStartExam = () => {
    if (!profile) {
      Swal.fire({ title: 'Thông báo', text: 'Vui lòng cập nhật thông tin cá nhân trước!', icon: 'warning', confirmButtonText: 'Đồng ý' });
      return;
    }
    if (!settings.apiKey) {
      Swal.fire({ title: 'Yêu cầu API Key', text: 'Vui lòng cấu hình Gemini API Key trong Cài đặt để sử dụng tính năng thi thử.', icon: 'info', confirmButtonText: 'Đã hiểu' });
      return;
    }
    setCurrentView('exam');
  };

  const handleFinishExam = (result: ExamResult) => {
    setLastExamResult(result);
    // Also save as a quiz session for history
    const session: QuizSession = {
      id: Math.random().toString(36).substr(2, 9),
      subjectId: 'thi-thu-ai',
      score: result.totalScore * 10, // convert to percentage
      totalQuestions: 28,
      correctAnswers: result.mcCorrectCount + result.tfCorrectCount,
      timeSpent: result.timeSpent,
      date: result.date,
    };
    const newSessions = [session, ...sessions];
    setSessions(newSessions);
    setCurrentView('examResult');
  };

  const getAppData = (): AppData => ({
    profile,
    subjects: MOCK_SUBJECTS,
    questions: MOCK_QUESTIONS,
    sessions,
    progress,
    settings
  });

  const handleExportData = () => {
    const data = getAppData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `informatics_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    Swal.fire('Thành công', 'Đã xuất dữ liệu JSON thành công!', 'success');
  };

  const handleExportWord = () => {
    try {
      exportToWord(getAppData());
      Swal.fire('Thành công', 'Đã xuất file Word thành công!', 'success');
    } catch (err) {
      Swal.fire('Lỗi', 'Không thể xuất file Word. Vui lòng thử lại.', 'error');
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportToPDF(getAppData());
      Swal.fire('Thành công', 'Đã mở hộp thoại in PDF. Chọn "Save as PDF" để lưu file.', 'success');
    } catch (err) {
      console.error('PDF export error:', err);
      Swal.fire('Lỗi', 'Không thể xuất file PDF. Vui lòng thử lại.', 'error');
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data: AppData = JSON.parse(e.target?.result as string);
        if (data.profile) setProfile(data.profile);
        if (data.sessions) setSessions(data.sessions);
        if (data.settings) setSettings(data.settings);
        if (data.progress) setProgress(data.progress);
        Swal.fire('Thành công', 'Đã nhập dữ liệu thành công!', 'success');
      } catch (err) {
        Swal.fire('Lỗi', 'Định dạng file không hợp lệ!', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    setCurrentView('home');
  };

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Đang tải...</div>;

  return (
    <div className={`min-h-screen ${settings.theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'} transition-colors duration-300`}>
      <Header 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        onNavigate={setCurrentView}
        currentView={currentView}
        hasProfile={!!profile}
      />

      <main className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <AnimatePresence mode="wait">
          {currentView === 'onboarding' && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 text-center">
                <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-6 shadow-lg shadow-blue-200">
                  <i className="fa-solid fa-user-graduate"></i>
                </div>
                <h2 className="text-3xl font-bold mb-2 text-slate-800">Thiết lập hồ sơ</h2>
                <p className="text-slate-500 mb-8">Vui lòng cung cấp thông tin để chúng tôi chuẩn bị đề thi phù hợp với lớp của bạn.</p>
                <ProfileForm onSave={handleSaveProfile} initialData={profile} />
              </div>
            </motion.div>
          )}

          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {profile && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-blue-600 to-orange-500 p-8 rounded-3xl text-white shadow-lg">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Chào {profile.fullName}! 👋</h1>
                    <p className="opacity-90">Hôm nay bạn muốn ôn tập chủ đề nào?</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-center bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl">
                      <div className="text-2xl font-bold">{progress.totalAttempts}</div>
                      <div className="text-xs uppercase tracking-wider opacity-80">Lượt làm bài</div>
                    </div>
                    <div className="text-center bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl">
                      <div className="text-2xl font-bold">{Math.round(progress.averageScore)}%</div>
                      <div className="text-xs uppercase tracking-wider opacity-80">Điểm trung bình</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Exam CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={handleStartExam}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 rounded-3xl text-white shadow-lg cursor-pointer hover:scale-[1.02] transition-all relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-10 -mt-10 group-hover:scale-125 transition-transform"></div>
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shrink-0">
                    <i className="fa-solid fa-file-signature"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">Thi thử 45 phút</h3>
                    <p className="text-sm opacity-90">AI tự ra đề thi 3 phần: Trắc nghiệm (24 câu) + Đúng/Sai (2 câu) + Tự luận (2 câu) • Tổng 10 điểm</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all shrink-0">
                    <i className="fa-solid fa-arrow-right text-lg"></i>
                  </div>
                </div>
              </motion.div>

              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Chủ đề học tập</h2>
                  <span className="text-sm text-slate-500">{filteredSubjects.length} chủ đề phù hợp với lớp {profile?.className}</span>
                </div>
                <SubjectList subjects={filteredSubjects} onStart={handleStartQuiz} />
              </section>
            </motion.div>
          )}

          {currentView === 'quiz' && activeSubject && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {isGeneratingQuiz ? (
                <div className="flex flex-col items-center justify-center py-24 gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <i className="fa-solid fa-robot text-blue-600 text-2xl animate-pulse"></i>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">AI đang tạo câu hỏi...</h3>
                    <p className="text-slate-500 text-sm">Đang soạn 50 câu hỏi trắc nghiệm bám sát SGK Kết nối tri thức</p>
                    <p className="text-slate-400 text-xs mt-2">Chủ đề: {activeSubject.name}</p>
                    <p className="text-blue-500 text-xs mt-4 font-medium">⏳ Quá trình này có thể mất 15-30 giây...</p>
                  </div>
                  <button
                    onClick={() => { setCurrentView('home'); setIsGeneratingQuiz(false); }}
                    className="mt-4 px-6 py-2.5 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    <i className="fa-solid fa-xmark mr-2"></i>Hủy
                  </button>
                </div>
              ) : aiQuestions.length > 0 ? (
                <QuizView 
                  subject={activeSubject} 
                  questions={aiQuestions}
                  onFinish={handleFinishQuiz}
                  onCancel={() => setCurrentView('home')}
                  onRegenerate={!activeSubject.id.includes('thi-') ? handleRegenerateQuiz : undefined}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <i className="fa-solid fa-triangle-exclamation text-4xl text-orange-400"></i>
                  <p className="text-slate-500">Không có câu hỏi nào. Vui lòng thử lại.</p>
                  <button
                    onClick={() => setCurrentView('home')}
                    className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
                  >
                    Quay lại
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {currentView === 'result' && lastSession && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ResultView 
                session={lastSession} 
                subject={MOCK_SUBJECTS.find(s => s.id === lastSession.subjectId)!}
                questions={aiQuestions}
                onRetry={() => handleStartQuiz(MOCK_SUBJECTS.find(s => s.id === lastSession.subjectId)!)}
                onHome={() => setCurrentView('home')}
                onTutor={() => setCurrentView('tutor')}
                apiKey={settings.apiKey}
              />
            </motion.div>
          )}

          {currentView === 'exam' && (
            <motion.div
              key="exam"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <ExamView
                apiKey={settings.apiKey || ''}
                model={settings.model}
                grade={(() => {
                  const match = profile?.className.match(/\d+/);
                  return match ? match[0] : '10';
                })()}
                onFinish={handleFinishExam}
                onCancel={() => setCurrentView('home')}
              />
            </motion.div>
          )}

          {currentView === 'examResult' && lastExamResult && (
            <motion.div
              key="examResult"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ExamResultView
                result={lastExamResult}
                onRetry={handleStartExam}
                onHome={() => setCurrentView('home')}
              />
            </motion.div>
          )}

          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Dashboard 
                sessions={sessions} 
                progress={progress} 
                onExport={handleExportData}
                onExportWord={handleExportWord}
                onExportPDF={handleExportPDF}
                onImport={handleImportData}
              />
            </motion.div>
          )}

          {currentView === 'tutor' && (
            <motion.div
              key="tutor"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <AITutor apiKey={settings.apiKey} model={settings.model} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        onSave={setSettings}
      />

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around py-3 md:hidden z-40">
        <button 
          onClick={() => setCurrentView('home')}
          className={`flex flex-col items-center gap-1 ${currentView === 'home' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <i className="fa-solid fa-house text-lg"></i>
          <span className="text-[10px] font-medium">Trang chủ</span>
        </button>
        <button 
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center gap-1 ${currentView === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <i className="fa-solid fa-chart-line text-lg"></i>
          <span className="text-[10px] font-medium">Tiến độ</span>
        </button>
        <button 
          onClick={() => setCurrentView('tutor')}
          className={`flex flex-col items-center gap-1 ${currentView === 'tutor' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <i className="fa-solid fa-robot text-lg"></i>
          <span className="text-[10px] font-medium">Gia sư AI</span>
        </button>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="flex flex-col items-center gap-1 text-slate-400"
        >
          <i className="fa-solid fa-gear text-lg"></i>
          <span className="text-[10px] font-medium">Cài đặt</span>
        </button>
      </nav>
    </div>
  );
}
