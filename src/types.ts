export type Difficulty = 'Nhận biết' | 'Thông hiểu' | 'Vận dụng';

export interface Question {
  id: string;
  subjectId: string;
  content: string;
  type: 'multiple-choice';
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: Difficulty;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  questionsCount: number;
}

export interface UserProfile {
  fullName: string;
  className: string;
  schoolName: string;
}

export interface QuizSession {
  id: string;
  subjectId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // in seconds
  date: string;
}

export interface Progress {
  totalAttempts: number;
  averageScore: number;
  streakDays: number;
  weakTopics: string[];
}

export interface AppSettings {
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  autoSave: boolean;
  apiKey?: string;
  model: string;
}

export interface AppData {
  profile: UserProfile | null;
  subjects: Subject[];
  questions: Question[];
  sessions: QuizSession[];
  progress: Progress;
  settings: AppSettings;
}

// === Exam Types (3-part exam) ===

export interface MCQuestion {
  id: string;
  content: string;
  options: string[];
  correctAnswer: number; // index 0-3
  explanation: string;
}

export interface TrueFalseStatement {
  statement: string;
  isTrue: boolean;
}

export interface TrueFalseQuestion {
  id: string;
  content: string; // stem / context
  statements: TrueFalseStatement[]; // exactly 4
  explanation: string;
}

export interface EssayQuestion {
  id: string;
  content: string; // prompt
  modelAnswer: string; // reference answer
  gradingCriteria: string; // what to look for
}

export interface ExamData {
  multipleChoice: MCQuestion[]; // 24 questions
  trueFalse: TrueFalseQuestion[]; // 2 questions (each with 4 statements)
  essay: EssayQuestion[]; // 2 questions
  grade: string; // e.g. "10", "11", "12"
}

export interface ExamAnswers {
  mc: Record<string, number>; // questionId -> selected option index
  tf: Record<string, Record<number, boolean>>; // questionId -> statementIndex -> true/false
  essay: Record<string, string>; // questionId -> text answer
}

export interface EssayGradeResult {
  score: number; // 0 - 1
  feedback: string;
}

export interface ExamResult {
  examData: ExamData;
  answers: ExamAnswers;
  mcScore: number; // out of 6
  mcCorrectCount: number;
  tfScore: number; // out of 2
  tfCorrectCount: number; // out of 8 statements
  essayScores: EssayGradeResult[]; // 2 items
  essayScore: number; // out of 2
  totalScore: number; // out of 10
  timeSpent: number; // seconds
  date: string;
}
