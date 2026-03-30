import { callGeminiAI } from './gemini';
import { ExamData, MCQuestion, TrueFalseQuestion, EssayQuestion, EssayGradeResult } from '../types';

const GRADE_TOPICS: Record<string, string> = {
  '10': `Tin học 10 - Kết nối tri thức:
- Thông tin và dữ liệu (biểu diễn thông tin, hệ đếm nhị phân, thập phân, thập lục phân)
- Vai trò của thiết bị thông minh và máy tính
- Hệ điều hành và phần mềm ứng dụng
- Sử dụng Internet và mạng xã hội an toàn
- Đạo đức, pháp luật và văn hóa trong môi trường số
- Ứng dụng tin học (xử lý văn bản, bảng tính, trình chiếu)
- Giải quyết vấn đề với sự trợ giúp của máy tính
- Thuật toán và lập trình cơ bản (Python): biến, kiểu dữ liệu, câu lệnh điều kiện, vòng lặp`,

  '11': `Tin học 11 - Kết nối tri thức:
- Hệ điều hành: chức năng, phân loại, quản lý tệp và thư mục
- Phần mềm và ứng dụng
- Kỹ thuật lập trình (Python): hàm, danh sách (list), chuỗi ký tự, xử lý tệp
- Thuật toán sắp xếp và tìm kiếm
- Cơ sở dữ liệu: khái niệm, hệ quản trị CSDL
- Bảng, truy vấn, biểu mẫu, báo cáo trong CSDL quan hệ
- Mô hình quan hệ, khóa chính, khóa ngoại
- An toàn thông tin`,

  '12': `Tin học 12 - Kết nối tri thức:
- Mạng máy tính: phân loại, mô hình, giao thức TCP/IP, OSI
- Internet và các dịch vụ trên Internet (Web, Email, FTP)
- Thiết kế và xây dựng trang web (HTML, CSS cơ bản)
- Trí tuệ nhân tạo (AI): khái niệm, ứng dụng, học máy
- Dữ liệu lớn (Big Data): khái niệm, ứng dụng
- Internet vạn vật (IoT): khái niệm, ứng dụng
- Thực hành tạo trang web
- An ninh mạng và bảo mật thông tin`
};

function buildExamPrompt(grade: string): string {
  const topics = GRADE_TOPICS[grade] || GRADE_TOPICS['10'];
  
  return `Bạn là giáo viên Tin học THPT giỏi, chuyên ra đề thi theo SGK "Kết nối tri thức".

Hãy ra một đề thi Tin học lớp ${grade} với cấu trúc CHÍNH XÁC sau:

## PHẦN 1: TRẮC NGHIỆM (24 câu, mỗi câu 0.25 điểm = 6 điểm)
- 24 câu trắc nghiệm 4 đáp án (A, B, C, D), chỉ 1 đáp án đúng
- Phân bố: 8 câu Nhận biết, 10 câu Thông hiểu, 6 câu Vận dụng
- Bám sát nội dung SGK Kết nối tri thức

## PHẦN 2: ĐÚNG/SAI (2 câu, mỗi câu 4 ý = 0.25đ × 4 ý × 2 câu = 2 điểm)
- 2 câu, mỗi câu có 1 đoạn thông tin/tình huống ngắn
- Mỗi câu có 4 ý (a, b, c, d) - học sinh phải xác định đúng hay sai

## PHẦN 3: TỰ LUẬN (2 câu, mỗi câu 1 điểm = 2 điểm)
- 2 câu tự luận ngắn, yêu cầu trình bày/giải thích
- Có đáp án mẫu và tiêu chí chấm

Nội dung kiến thức bám sát:
${topics}

QUAN TRỌNG: Trả lời ĐÚNG ĐỊNH DẠNG JSON sau, KHÔNG thêm text hay markdown nào khác:

{
  "multipleChoice": [
    {
      "id": "mc1",
      "content": "Nội dung câu hỏi?",
      "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      "correctAnswer": 0,
      "explanation": "Giải thích ngắn gọn"
    }
  ],
  "trueFalse": [
    {
      "id": "tf1",
      "content": "Đoạn thông tin/tình huống...",
      "statements": [
        { "statement": "Ý a) ...", "isTrue": true },
        { "statement": "Ý b) ...", "isTrue": false },
        { "statement": "Ý c) ...", "isTrue": true },
        { "statement": "Ý d) ...", "isTrue": false }
      ],
      "explanation": "Giải thích"
    }
  ],
  "essay": [
    {
      "id": "es1",
      "content": "Câu hỏi tự luận...",
      "modelAnswer": "Đáp án mẫu chi tiết...",
      "gradingCriteria": "Tiêu chí chấm: ..."
    }
  ]
}

Đảm bảo:
- multipleChoice có ĐÚNG 24 phần tử, id từ mc1 đến mc24
- trueFalse có ĐÚNG 2 phần tử, id là tf1 và tf2, mỗi phần tử có ĐÚNG 4 statements
- essay có ĐÚNG 2 phần tử, id là es1 và es2
- correctAnswer là index 0-3
- Câu hỏi bám sát nội dung SGK Kết nối tri thức lớp ${grade}
- Không lặp câu hỏi, phân bố đều các chủ đề`;
}

function buildGradeEssayPrompt(question: string, modelAnswer: string, gradingCriteria: string, studentAnswer: string): string {
  return `Bạn là giáo viên Tin học THPT đang chấm bài thi tự luận.

Câu hỏi: ${question}

Đáp án mẫu: ${modelAnswer}

Tiêu chí chấm: ${gradingCriteria}

Bài làm của học sinh: ${studentAnswer}

Hãy chấm điểm bài làm trên thang 0 đến 1 điểm (có thể cho 0, 0.25, 0.5, 0.75, hoặc 1).

Trả lời ĐÚNG ĐỊNH DẠNG JSON, không thêm gì khác:
{
  "score": 0.5,
  "feedback": "Nhận xét chi tiết về bài làm..."
}`;
}

export async function generateExam(apiKey: string, model: string, grade: string): Promise<ExamData> {
  const prompt = buildExamPrompt(grade);
  const result = await callGeminiAI(prompt, apiKey, model);
  
  if (!result) {
    throw new Error('AI không trả về kết quả. Vui lòng thử lại.');
  }

  // Extract JSON from response (handle potential markdown wrapping)
  let jsonStr = result.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }
  // Also try to find raw JSON object
  const braceStart = jsonStr.indexOf('{');
  const braceEnd = jsonStr.lastIndexOf('}');
  if (braceStart !== -1 && braceEnd !== -1) {
    jsonStr = jsonStr.substring(braceStart, braceEnd + 1);
  }

  try {
    const data = JSON.parse(jsonStr);
    
    // Validate structure
    if (!data.multipleChoice || !Array.isArray(data.multipleChoice) || data.multipleChoice.length < 20) {
      throw new Error('Dữ liệu phần trắc nghiệm không hợp lệ');
    }
    if (!data.trueFalse || !Array.isArray(data.trueFalse) || data.trueFalse.length < 2) {
      throw new Error('Dữ liệu phần đúng/sai không hợp lệ');
    }
    if (!data.essay || !Array.isArray(data.essay) || data.essay.length < 2) {
      throw new Error('Dữ liệu phần tự luận không hợp lệ');
    }

    return {
      multipleChoice: data.multipleChoice.slice(0, 24) as MCQuestion[],
      trueFalse: data.trueFalse.slice(0, 2) as TrueFalseQuestion[],
      essay: data.essay.slice(0, 2) as EssayQuestion[],
      grade,
    };
  } catch (e: any) {
    if (e.message.includes('Dữ liệu')) throw e;
    throw new Error('Không thể phân tích đề thi từ AI. Vui lòng thử lại.');
  }
}

export async function gradeEssay(
  apiKey: string, 
  model: string, 
  question: EssayQuestion, 
  studentAnswer: string
): Promise<EssayGradeResult> {
  if (!studentAnswer.trim()) {
    return { score: 0, feedback: 'Học sinh không trả lời câu hỏi này.' };
  }

  const prompt = buildGradeEssayPrompt(
    question.content, 
    question.modelAnswer, 
    question.gradingCriteria, 
    studentAnswer
  );
  
  const result = await callGeminiAI(prompt, apiKey, model);
  
  if (!result) {
    return { score: 0, feedback: 'Không thể chấm bài tự luận. AI không phản hồi.' };
  }

  let jsonStr = result.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }
  const braceStart = jsonStr.indexOf('{');
  const braceEnd = jsonStr.lastIndexOf('}');
  if (braceStart !== -1 && braceEnd !== -1) {
    jsonStr = jsonStr.substring(braceStart, braceEnd + 1);
  }

  try {
    const data = JSON.parse(jsonStr);
    return {
      score: Math.min(1, Math.max(0, Number(data.score) || 0)),
      feedback: data.feedback || 'Không có nhận xét.',
    };
  } catch {
    return { score: 0, feedback: 'Không thể phân tích kết quả chấm bài từ AI.' };
  }
}
