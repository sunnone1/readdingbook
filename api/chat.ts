import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';

const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const DEFAULT_SYSTEM_INSTRUCTION = `Bạn là Giám tuyển Lưu trữ chính thức của Kho Lưu Trữ Điện Ảnh Leon Vasari (1958–1989).
Leon Vasari (1922–2004) là tác gia điện ảnh hư cấu với 12 tác phẩm kinh điển:
1. Thung Lũng Tĩnh Lặng (The Silent Valley, 1958, Chính kịch) - Shizukana Tani / 静かな谷
2. Giờ Xanh (The Blue Hour, 1962, Lãng mạn) - Ao no Toki / 青の刻
3. Dòng Sông Muối (River of Salt, 1964, Chính kịch) - Shio no Kawa / 塩の川
4. Mùa Hè Cuối Cùng (The Last Summer, 1966, Chính kịch) - Saigo no Natsu / 最後の夏
5. Con Đường Xanh (The Green Road, 1969, Bí ẩn) - Midori no Michi / 緑の道
6. Tro Tàn Lúc Giữa Trưa (Noon in Ashes, 1971, Viễn Tây) - Hai no Shogo / 灰の正午
7. Kẻ Quan Sát (The Observer, 1973, Giật gân) - Kansatsusha / 観察者
8. Những Cánh Chim Rơi (The Fallen Birds, 1975, Chính kịch) - Ochita Tori / 落ちた鳥
9. Ánh Sáng Trong Bão Dữ (Light in the Storm, 1978, Chính kịch) - Arashi no Hi / 嵐の灯
10. Thủy Triều Dài (The Long Tide, 1981, Chính kịch) - Nagai Shio / 長い潮
11. Cuộc Chiến Lặng Câm (A Quiet War, 1985, Hài kịch) - Shizukana Senso / 静かな戦争
12. Cánh Cửa Đỏ (Red Door, 1989, Giật gân) - Akai Tobira / 赤い扉

Bối cảnh thẩm mỹ & quay phim:
- Triết lý màu sắc in lụa duotone đặc trưng (xanh cobalt, đỏ chu sa cinnabar, trắng xương bone white, đen mực ink black).
- Nhịp điệu chậm rãi đậm chất hiện sinh, thoại tối giản, âm thanh môi trường và hạt phim 35mm quang hóa được bảo tồn qua các bản master băng từ VHS.
- Bạn luôn giao tiếp bằng tiếng Việt chuẩn mực, tao nhã, có hiểu biết sâu rộng về lịch sử điện ảnh, cấu trúc kịch bản và công tác phục chế lưu trữ.`;

const ROLE_SYSTEM_INSTRUCTIONS: Record<string, string> = {
  scholar: `${DEFAULT_SYSTEM_INSTRUCTION}\nVai trò: Học Giả Điện Ảnh Lưu Trữ (Phân tích cân bằng, bối cảnh lịch sử, góc máy và kỹ thuật phục chế).`,
  fast: `${DEFAULT_SYSTEM_INSTRUCTION}\nVai trò: Hướng Dẫn Tra Cứu Nhanh (Trả lời súc tích, nhanh gọn về năm phát hành, nội dung chính, thông số kỹ thuật và gợi ý phim).`,
  complex: `${DEFAULT_SYSTEM_INSTRUCTION}\nVai trò: Nhà Lý Luận Thông Diễn Điện Ảnh (Phân tích triết học đa tầng, ký hiệu học của khoảng lặng, cấu trúc biên kịch và đối sánh điện ảnh tiên phong).`,
};

async function generateWithModelFallback(
  model: string,
  contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  systemInstruction: string
) {
  const modelsToTry: string[] = [model];
  if (model !== 'gemini-3.1-flash-lite') {
    modelsToTry.push('gemini-3.1-flash-lite');
  }

  let lastError: any = null;
  for (const m of modelsToTry) {
    try {
      const timeoutMs = m === 'gemini-3.1-flash-lite' ? 15000 : 4500;
      const generatePromise = ai!.models.generateContent({
        model: m,
        contents,
        config: {
          systemInstruction,
        },
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Model ${m} timed out after ${timeoutMs}ms`)), timeoutMs)
      );
      const response: any = await Promise.race([generatePromise, timeoutPromise]);
      return { text: response.text, model: m };
    } catch (err: any) {
      console.warn(`Model ${m} attempt failed or timed out:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, model, modelMode, role } = req.body || {};

    if (!ai) {
      return res.status(500).json({
        error: 'Chưa cấu hình GEMINI_API_KEY. Vui lòng cấu hình GEMINI_API_KEY trong file .env hoặc biến môi trường.',
      });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const effectiveRole = role || modelMode || 'scholar';

    let selectedModel = 'gemini-3.8-flash';
    if (model === 'gemini-4-argon' || effectiveRole === 'complex') {
      selectedModel = 'gemini-4-argon';
    } else if (model === 'gemini-3.1-flash-lite' || effectiveRole === 'fast') {
      selectedModel = 'gemini-3.1-flash-lite';
    } else if (model) {
      selectedModel = model;
    } else {
      selectedModel = 'gemini-3.8-flash';
    }

    const systemInstruction = ROLE_SYSTEM_INSTRUCTIONS[effectiveRole] || DEFAULT_SYSTEM_INSTRUCTION;

    const contents = messages
      .map((m: any) => {
        const textStr = (m.text || m.content || '').trim();
        if (!textStr) return null;
        return {
          role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: textStr }],
        };
      })
      .filter(Boolean);

    if (contents.length === 0) {
      return res.status(400).json({ error: 'No non-empty messages provided.' });
    }

    const result = await generateWithModelFallback(selectedModel, contents as any, systemInstruction);

    return res.status(200).json({ text: result.text || 'No response generated.', model: result.model });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    let errorMessage = error?.message || 'Error communicating with Gemini API';
    try {
      const parsed = JSON.parse(errorMessage);
      if (parsed?.error?.message) {
        errorMessage = parsed.error.message;
      }
    } catch {
      // not JSON string
    }
    return res.status(500).json({ error: errorMessage });
  }
}
