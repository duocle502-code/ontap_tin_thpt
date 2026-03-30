import { callGeminiAI } from './gemini';
import { Question, Subject } from '../types';

// ============================================================
// CACHE MANAGEMENT
// ============================================================

const CACHE_PREFIX = 'quiz_cache_';
const CACHE_VERSION = 'v1';

function getCacheKey(subjectId: string): string {
  return `${CACHE_PREFIX}${CACHE_VERSION}_${subjectId}`;
}

export function getCachedQuestions(subjectId: string): Question[] | null {
  try {
    const cached = localStorage.getItem(getCacheKey(subjectId));
    if (!cached) return null;
    const data = JSON.parse(cached);
    if (!Array.isArray(data) || data.length === 0) return null;
    return data as Question[];
  } catch {
    return null;
  }
}

function setCachedQuestions(subjectId: string, questions: Question[]): void {
  try {
    localStorage.setItem(getCacheKey(subjectId), JSON.stringify(questions));
  } catch (e) {
    console.warn('Could not cache questions to localStorage:', e);
  }
}

export function clearCachedQuestions(subjectId: string): void {
  localStorage.removeItem(getCacheKey(subjectId));
}

export function hasCachedQuestions(subjectId: string): boolean {
  return getCachedQuestions(subjectId) !== null;
}

// ============================================================
// AI QUESTION GENERATION
// ============================================================

function buildPrompt(subject: Subject): string {
  return `Bạn là giáo viên Tin học THPT giỏi, chuyên soạn câu hỏi trắc nghiệm theo SGK "Kết nối tri thức".

Hãy soạn CHÍNH XÁC **50 câu hỏi trắc nghiệm** cho chủ đề sau:

**Chủ đề:** ${subject.name}

**Nội dung kiến thức chi tiết:**
${subject.topicDescription}

**YÊU CẦU:**
1. Tổng cộng ĐÚNG 50 câu hỏi trắc nghiệm, mỗi câu 4 đáp án (A, B, C, D), chỉ 1 đáp án đúng
2. Phân bố mức độ:
   - 17 câu mức "Nhận biết" (nhớ, nhận diện kiến thức cơ bản)
   - 17 câu mức "Thông hiểu" (hiểu bản chất, so sánh, giải thích)
   - 16 câu mức "Vận dụng" (áp dụng kiến thức giải quyết bài toán/tình huống)
3. Câu hỏi phải BÁM SÁT nội dung SGK Kết nối tri thức lớp ${subject.grade}
4. Không lặp lại ý tưởng câu hỏi
5. Đáp án sai phải hợp lý (không quá vô nghĩa), dễ gây nhầm lẫn
6. Mỗi câu phải có giải thích ngắn gọn, rõ ràng

**ĐỊNH DẠNG JSON** (KHÔNG thêm text/markdown nào khác):

[
  {
    "id": "q1",
    "content": "Nội dung câu hỏi?",
    "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
    "correctAnswer": 0,
    "explanation": "Giải thích ngắn gọn tại sao đáp án đúng",
    "difficulty": "Nhận biết"
  },
  {
    "id": "q2",
    "content": "...",
    "options": ["...", "...", "...", "..."],
    "correctAnswer": 2,
    "explanation": "...",
    "difficulty": "Thông hiểu"
  }
]

**LƯU Ý QUAN TRỌNG:**
- correctAnswer là index 0-3 (0=A, 1=B, 2=C, 3=D)
- difficulty CHỈ là 1 trong 3 giá trị: "Nhận biết", "Thông hiểu", "Vận dụng"
- id từ "q1" đến "q50"
- Trả về ĐÚNG 50 phần tử trong mảng JSON
- CHỈ trả về JSON array, KHÔNG có text hay markdown bao quanh`;
}

function extractJSON(raw: string): string {
  let str = raw.trim();
  
  // Remove markdown code block if present
  const codeBlockMatch = str.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    str = codeBlockMatch[1].trim();
  }
  
  // Find the JSON array
  const bracketStart = str.indexOf('[');
  const bracketEnd = str.lastIndexOf(']');
  if (bracketStart !== -1 && bracketEnd !== -1 && bracketEnd > bracketStart) {
    str = str.substring(bracketStart, bracketEnd + 1);
  }
  
  return str;
}

function validateAndFixQuestions(raw: any[], subjectId: string): Question[] {
  if (!Array.isArray(raw) || raw.length < 10) {
    throw new Error('AI không trả về đủ câu hỏi. Vui lòng thử lại.');
  }

  const validDifficulties = ['Nhận biết', 'Thông hiểu', 'Vận dụng'];

  return raw.map((q: any, index: number) => {
    // Validate and fix each question
    const correctAnswer = typeof q.correctAnswer === 'number' 
      ? Math.min(3, Math.max(0, q.correctAnswer)) 
      : 0;

    let difficulty = q.difficulty || '';
    if (!validDifficulties.includes(difficulty)) {
      // Auto-assign based on position
      if (index < 17) difficulty = 'Nhận biết';
      else if (index < 34) difficulty = 'Thông hiểu';
      else difficulty = 'Vận dụng';
    }

    return {
      id: q.id || `q${index + 1}`,
      subjectId,
      content: q.content || `Câu hỏi ${index + 1}`,
      type: 'multiple-choice' as const,
      options: Array.isArray(q.options) && q.options.length === 4 
        ? q.options 
        : ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
      correctAnswer,
      explanation: q.explanation || 'Không có giải thích.',
      difficulty: difficulty as Question['difficulty'],
    };
  });
}

// ============================================================
// MAIN EXPORT
// ============================================================

export async function generateTopicQuestions(
  apiKey: string, 
  model: string, 
  subject: Subject
): Promise<Question[]> {
  // 1. Check cache first
  const cached = getCachedQuestions(subject.id);
  if (cached) {
    return cached;
  }

  // 2. Generate via AI
  const prompt = buildPrompt(subject);
  const result = await callGeminiAI(prompt, apiKey, model);

  if (!result) {
    throw new Error('AI không trả về kết quả. Vui lòng thử lại.');
  }

  // 3. Parse response
  const jsonStr = extractJSON(result);
  
  let rawQuestions: any[];
  try {
    rawQuestions = JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to parse AI response:', jsonStr.substring(0, 200));
    throw new Error('Không thể phân tích câu hỏi từ AI. Vui lòng thử lại.');
  }

  // 4. Validate and fix
  const questions = validateAndFixQuestions(rawQuestions, subject.id);

  // 5. Cache the result
  setCachedQuestions(subject.id, questions);

  return questions;
}
