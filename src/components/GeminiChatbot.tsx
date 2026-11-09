import React, { useState, useRef, useEffect } from 'react';
import { FilmItem } from '../archive/films';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  model?: string;
}

export type ChatRole = 'scholar' | 'fast' | 'complex';

interface GeminiChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilm?: FilmItem;
}

const ROLE_CONFIGS: Record<
  ChatRole,
  { label: string; modelName: string; description: string }
> = {
  scholar: {
    label: 'Học Giả Điện Ảnh',
    modelName: 'gemini-3.8-flash',
    description: 'Phân tích cân bằng, nghệ thuật quay phim, bối cảnh lịch sử và lưu trữ.',
  },
  fast: {
    label: 'Tra Cứu Nhanh',
    modelName: 'gemini-3.1-flash-lite',
    description: 'Phản hồi nhanh về năm phát hành, thông số, tóm tắt và tìm kiếm phim.',
  },
  complex: {
    label: 'Thông Diễn Chuyên Sâu',
    modelName: 'gemini-4-argon',
    description: 'Phân tích triết học sâu, ký hiệu học và lý luận điện ảnh tiên phong.',
  },
};

const SUGGESTIONS = [
  'Triết lý màu sắc trong phim Tro Tàn Lúc Giữa Trưa (1971)',
  'So sánh Kẻ Quan Sát với dòng phim tâm lý ngờ vực thập niên 1970',
  'Niên biểu và chủ đề xuyên suốt của 12 tác phẩm lưu trữ',
  'Ý nghĩa của khoảng lặng trong Thung Lũng Tĩnh Lặng (1958)',
];

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  isOpen,
  onClose,
  activeFilm,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Chào mừng bạn đến với Bàn Giám Tuyển Lưu Trữ Leon Vasari. Tôi có thể hỗ trợ bạn phân tích kịch bản, kỹ thuật quay phim, lịch sử phục chế bản phim gốc hoặc các chi tiết niên biểu của 12 tác phẩm kinh điển. Bạn muốn tìm hiểu về tác phẩm nào hôm nay?',
      timestamp: new Date(),
      model: 'gemini-3.8-flash',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<ChatRole>('scholar');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const threadEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (isOpen) {
      threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    setErrorMessage(null);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            text: m.text,
          })),
          role: selectedRole,
          model: ROLE_CONFIGS[selectedRole].modelName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Không thể nhận phản hồi từ Gemini');
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: data.text || 'Không có phản hồi.',
        timestamp: new Date(),
        model: data.model || ROLE_CONFIGS[selectedRole].modelName,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chatbot error:', err);
      setErrorMessage(err.message || 'Lỗi liên lạc với trợ lý giám tuyển lưu trữ.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: 'Đã làm mới cuộc hội thoại. Hãy hỏi tôi bất kỳ điều gì về điện ảnh, kịch bản hoặc lịch sử phục chế của Leon Vasari.',
        timestamp: new Date(),
        model: ROLE_CONFIGS[selectedRole].modelName,
      },
    ]);
    setErrorMessage(null);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-90 bg-black/45 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Leon Vasari Archival Gemini Chatbot"
    >
      <div
        className="w-full sm:max-w-2xl h-[100dvh] sm:h-[88vh] sm:max-h-[760px] bg-[var(--sheet)] border-0 sm:border border-[var(--rule)]/30 shadow-2xl flex flex-col rounded-none sm:rounded-[3px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header Bar */}
        <header className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-[var(--rule)]/20 bg-[var(--paper)]/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--cobalt)] animate-pulse shrink-0" />
            <div>
              <span className="lbl text-[var(--cobalt)] block text-[9.5px] sm:text-[10px]">
                ĐỐI THOẠI LƯU TRỮ
              </span>
              <h2 className="font-sans font-semibold text-sm sm:text-base text-[var(--ink)] tracking-tight">
                Bàn Giám Tuyển Leon Vasari
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearHistory}
              className="box-tag lbl text-[9px] text-[var(--muted)] hover:text-[var(--ink)] bg-transparent hover:bg-black/5 transition-colors cursor-pointer"
              title="Xóa lịch sử hội thoại"
            >
              XÓA
            </button>
            <button
              type="button"
              onClick={onClose}
              className="box-tag lbl text-[var(--ink)] bg-[var(--sheet)] hover:bg-[var(--paper)] transition-colors cursor-pointer"
              data-cursor="btn"
              aria-label="Đóng đối thoại"
            >
              ĐÓNG
            </button>
          </div>
        </header>

        {/* 2. Model & Role Selector */}
        <div className="px-3.5 sm:px-5 py-2 sm:py-2.5 bg-[var(--paper)]/40 border-b border-[var(--rule)]/10 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-0.5">
            <span className="lbl text-[9px] sm:text-[9.5px] text-[var(--muted)] mr-1 shrink-0">
              VAI TRÒ:
            </span>
            {(['scholar', 'fast', 'complex'] as ChatRole[]).map((r) => {
              const cfg = ROLE_CONFIGS[r];
              const isSelected = selectedRole === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRole(r)}
                  className={`px-2.5 py-1 text-[10.5px] font-sans font-medium transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[var(--cobalt)] text-white border-[var(--cobalt)] shadow-xs'
                      : 'bg-transparent text-[var(--muted)] border-transparent hover:border-[var(--rule)]/20 hover:text-[var(--ink)]'
                  }`}
                  title={cfg.description}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>

          {activeFilm && (
            <div className="text-[10px] text-[var(--muted)] font-serif italic">
              Đang xem: {activeFilm.titleVi || activeFilm.title} ({activeFilm.year})
            </div>
          )}
        </div>

        {/* 3. Conversation Thread */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 font-serif text-sm">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                {/* Meta header */}
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="lbl text-[9px] text-[var(--muted)]">
                    {isUser ? 'BẠN' : 'GIÁM TUYỂN VASARI'}
                  </span>
                  <span className="text-[9px] text-[var(--muted)]/60 font-sans">
                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Message bubble */}
                <div
                  className={`max-w-[85%] p-3.5 leading-relaxed rounded-[2px] border ${
                    isUser
                      ? 'bg-[var(--cobalt)] text-white border-[var(--cobalt)] font-sans text-sm'
                      : 'bg-[#FAF8F5] text-[var(--ink)] border-[var(--rule)]/15 font-serif text-[15px]'
                  }`}
                >
                  <p className="whitespace-pre-wrap m-0">{m.text}</p>
                </div>
              </div>
            );
          })}

          {/* Loading indicator */}
          {loading && (
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="lbl text-[9px] text-[var(--cobalt)]">
                  GIÁM TUYỂN ĐANG SOẠN CÂU TRẢ LỜI...
                </span>
              </div>
              <div className="p-3.5 bg-[#FAF8F5] border border-[var(--rule)]/15 rounded-[2px] flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--cobalt)] animate-bounce" />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-[var(--cobalt)] animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-[var(--cobalt)] animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                />
              </div>
            </div>
          )}

          {/* Error message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-sans rounded-[2px]">
              <span className="font-semibold block mb-0.5">Lỗi Truyền Tin Lưu Trữ</span>
              {errorMessage}
            </div>
          )}

          <div ref={threadEndRef} />
        </div>

        {/* 4. Suggested Queries Chips */}
        {messages.length <= 2 && (
          <div className="px-3 sm:px-5 py-2 border-t border-[var(--rule)]/10 bg-[var(--paper)]/30 flex items-center gap-2 overflow-x-auto shrink-0">
            <span className="lbl text-[9px] text-[var(--muted)] shrink-0">GỢI Ý CÂU HỎI:</span>
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(s)}
                className="text-[10.5px] sm:text-[11px] font-sans text-[var(--cobalt)] bg-white/70 hover:bg-white border border-[var(--cobalt)]/20 px-2.5 py-1 whitespace-nowrap transition-colors cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* 5. Input Area */}
        <div className="p-2.5 sm:p-3.5 border-t border-[var(--rule)]/20 bg-[var(--paper)]/60 flex items-center gap-2 shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Hỏi về điện ảnh, kịch bản hoặc mỹ thuật (${ROLE_CONFIGS[selectedRole].label})...`}
            disabled={loading}
            className="flex-1 bg-white border border-[var(--rule)]/30 px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-[var(--ink)] placeholder:text-[var(--muted)]/60 focus:outline-none focus:border-[var(--cobalt)] font-sans"
          />

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="h-[36px] sm:h-[40px] px-3.5 sm:px-5 bg-[var(--cobalt)] text-white font-sans font-semibold text-xs tracking-wider uppercase disabled:opacity-40 hover:bg-[var(--cobalt)]/90 transition-colors cursor-pointer shrink-0"
            data-cursor="btn"
          >
            {loading ? '...' : 'GỬI'}
          </button>
        </div>
      </div>
    </div>
  );
};
