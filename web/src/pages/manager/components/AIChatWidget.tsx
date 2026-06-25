import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Loader2 } from 'lucide-react';
import { aiService, ChatMessage } from '../../../services/ai.service';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await aiService.getChatHistory(1, 50);
        if (res.data?.data) {
          // Backend returns newest first, so reverse it for UI (oldest at top)
          const sorted: any[] = [...res.data.data].reverse();
          
          const mappedMessages: ChatMessage[] = [];
          for (const item of sorted) {
            mappedMessages.push({
              _id: item._id + '_user',
              role: 'user',
              content: item.message,
              createdAt: item.createdAt,
            });
            mappedMessages.push({
              _id: item._id + '_bot',
              role: 'model',
              content: item.response,
              data: item.responseData,
              createdAt: item.createdAt,
            });
          }
          
          setMessages(mappedMessages);
          if (sorted.length > 0) {
            setConversationId(sorted[sorted.length - 1].conversationId);
          }
        }
      } catch (err) {
        console.error('Failed to fetch chat history', err);
      }
    };
    if (isOpen && messages.length === 0) {
      fetchHistory();
    }
  }, [isOpen]);

  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || message;
    if (!textToSend.trim() || loading) return;

    const userMessage = textToSend.trim();
    setMessage('');

    const tempId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      {
        _id: tempId,
        role: 'user',
        content: userMessage,
        createdAt: new Date().toISOString(),
      },
    ]);

    try {
      setLoading(true);
      const res = await aiService.chatQuery(userMessage, conversationId);

      if (res.data.conversationId && !conversationId) {
        setConversationId(res.data.conversationId);
      }

      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now().toString() + 'bot',
          role: 'model',
          content: res.data.answer,
          data: res.data.data,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi gửi tin nhắn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ═══ Floating Button ═══ */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-[52px] h-[52px] rounded-full bg-[#060606] flex items-center justify-center z-40 transition-all duration-200 hover:scale-105 ${
          isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
        }`}
        style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
      >
        <Sparkles size={22} className="text-[#d7ee46]" />
      </button>

      {/* ═══ Chat Drawer ═══ */}
      <div
        className={`fixed top-0 right-0 h-full w-[380px] bg-white z-50 transform transition-transform duration-[280ms] flex flex-col border-l border-[#e5e7eb] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.32, 0, 0.67, 0)',
          boxShadow: isOpen ? '-8px 0 24px rgba(0,0,0,0.1)' : 'none',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e7eb] bg-[#f5f5f3]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#060606] flex items-center justify-center">
              <Sparkles size={14} className="text-[#d7ee46]" />
            </div>
            <div>
              <h3 className="font-bold text-[#1a1a1a] text-[14px]">Trợ lý AI</h3>
              <p className="text-[11px] text-[#6b7280]">Phân tích dữ liệu hệ thống</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-7 h-7 rounded-full hover:bg-[#e5e7eb] flex items-center justify-center text-[#6b7280] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f5f5f3]">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <div className="w-12 h-12 rounded-full bg-[#060606] flex items-center justify-center mb-4">
                <Sparkles size={20} className="text-[#d7ee46]" />
              </div>
              <p className="text-[14px] text-[#1a1a1a] font-bold mb-6">
                Hôm nay bạn muốn xem gì?
              </p>
              <div className="flex flex-col gap-2 w-full px-2">
                {[
                  "Lượt xe vào ra hôm nay thế nào?",
                  "Thống kê doanh thu tuần này",
                  "Có tòa nhà nào đang quá tải không?",
                  "Phân tích giờ cao điểm hôm qua"
                ].map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(sug)}
                    className="text-[13px] bg-white border border-[#e5e7eb] hover:border-[#d7ee46] hover:bg-[#fcfdf5] text-[#1a1a1a] py-3 px-4 rounded-xl transition-all text-left shadow-sm flex items-center justify-between group"
                  >
                    <span className="font-medium text-[#4b5563] group-hover:text-[#1a1a1a] transition-colors">{sug}</span>
                    <Send size={14} className="text-[#9ca3af] group-hover:text-[#889b1c] opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[92%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed overflow-x-auto prose prose-sm prose-p:leading-relaxed prose-pre:bg-[#1a1a1a] prose-pre:text-[#f8f8f8] ${
                    msg.role === 'user'
                      ? 'bg-[#060606] text-white rounded-br-sm prose-invert'
                      : 'bg-white border border-[#e5e7eb] text-[#1a1a1a] rounded-bl-sm shadow-sm'
                  }`}
                >
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // 1. Markdown GFM (Mở rộng)
                      table: ({node, ...props}) => <table className="w-full border-collapse border border-[#e5e7eb] my-3" {...props} />,
                      th: ({node, ...props}) => <th className="border border-[#e5e7eb] bg-[#f5f5f3] px-3 py-2 text-left font-bold text-[#1a1a1a]" {...props} />,
                      td: ({node, ...props}) => <td className="border border-[#e5e7eb] px-3 py-2 text-left" {...props} />,
                      
                      // 2. Markdown Nguyên Thủy (Gốc)
                      p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                      li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                      a: ({node, ...props}) => <a className="text-[#889b1c] hover:text-[#d7ee46] underline decoration-[#e5e7eb] hover:decoration-[#d7ee46] underline-offset-2 transition-colors font-medium" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[#d7ee46] pl-3 italic opacity-80 my-3" {...props} />,
                      code: ({node, inline, ...props}: any) => 
                        inline 
                          ? <code className="bg-black/5 dark:bg-white/10 rounded-[4px] px-1.5 py-0.5 text-[12px] font-mono text-[#ea580c]" {...props} />
                          : <code className="block bg-[#1a1a1a] text-[#f8f8f8] rounded-lg p-3 text-[12px] overflow-x-auto my-3 font-mono shadow-sm" {...props} />,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                  <div
                    className={`text-[10px] mt-1.5 flex ${
                      msg.role === 'user' ? 'justify-end text-[#9ca3af]' : 'justify-start text-[#9ca3af]'
                    }`}
                  >
                    {formatTime(msg.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-[#e5e7eb] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-[#d7ee46]" />
                <span className="text-[12px] text-[#6b7280]">AI đang suy nghĩ...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input & Suggestions */}
        <div className="bg-white border-t border-[#e5e7eb] flex flex-col">
          {/* Quick Suggestions (Horizontal Scroll) */}
          <div className="px-3 pt-3 pb-1 overflow-x-auto flex gap-2 scrollbar-hide" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            {[
              "Lượt xe hôm nay?",
              "Doanh thu tuần này",
              "Bãi đỗ nào quá tải?",
              "Giờ cao điểm hôm qua"
            ].map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(sug)}
                disabled={loading}
                className="shrink-0 text-[11px] font-medium bg-[#f5f5f3] hover:bg-[#e5e7eb] text-[#4b5563] hover:text-[#1a1a1a] px-3 py-1.5 rounded-full transition-colors border border-transparent hover:border-[#d7ee46] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sug}
              </button>
            ))}
          </div>

          <div className="p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hỏi gì đó... Ví dụ: Lượt xe hôm nay thế nào?"
              className="flex-1 px-3 py-2.5 bg-[#f5f5f3] border border-[#e5e7eb] rounded-[10px] text-[13px] text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#d7ee46] transition-all"
            />
            <button
              type="submit"
              disabled={!message.trim() || loading}
              className="w-9 h-9 rounded-[10px] bg-[#d7ee46] text-[#060606] flex items-center justify-center hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 transition-opacity duration-200"
          style={{ backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
