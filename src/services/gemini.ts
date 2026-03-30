import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export const MODELS = ['gemini-3-flash-preview', 'gemini-3.1-pro-preview', 'gemini-2.5-flash-preview'];

export async function callGeminiAI(prompt: string, apiKey: string, modelName: string = MODELS[0]): Promise<string | null> {
  if (!apiKey) {
    throw new Error('Vui lòng nhập API Key!');
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    return response.text || '';
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    
    // Check for rate limit (429) or other errors to potentially fallback
    if (error.message?.includes('429') || error.status === 429) {
      const currentIndex = MODELS.indexOf(modelName);
      if (currentIndex !== -1 && currentIndex < MODELS.length - 1) {
        console.warn(`Rate limit hit for ${modelName}, falling back to ${MODELS[currentIndex + 1]}`);
        return callGeminiAI(prompt, apiKey, MODELS[currentIndex + 1]);
      }
    }
    
    throw error;
  }
}

export const PROMPTS = {
  EXPLAIN_QUESTION: (question: string, answer: string, explanation: string) => `
    Bạn là một giáo viên Tin học THPT. Hãy giải thích chi tiết câu hỏi sau đây cho học sinh:
    Câu hỏi: ${question}
    Đáp án đúng: ${answer}
    Giải thích ngắn gọn: ${explanation}
    
    Hãy cung cấp một lời giải thích sâu hơn, dễ hiểu và có ví dụ minh họa nếu cần thiết. 
    Sử dụng định dạng Markdown.
  `,
  TUTOR_CHAT: (history: { role: string, content: string }[], message: string) => `
    Bạn là một trợ lý học tập AI chuyên về môn Tin học THPT (Sách Kết nối tri thức). 
    Hãy trả lời câu hỏi của học sinh một cách thân thiện, chính xác và dễ hiểu.
    
    Lịch sử trò chuyện:
    ${history.map(h => `${h.role === 'user' ? 'Học sinh' : 'AI'}: ${h.content}`).join('\n')}
    
    Câu hỏi mới: ${message}
  `
};
