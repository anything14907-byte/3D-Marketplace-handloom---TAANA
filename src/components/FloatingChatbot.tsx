import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Feather, Loader2, Bot, User, HelpCircle, ShieldCheck } from 'lucide-react';
import { ThreadClusterIcon } from './ThreadClusterIcon';
import { Product, ChatMessage } from '../types';

interface FloatingChatbotProps {
  currentProduct?: Product | null;
}

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({ currentProduct }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content:
        'Namaste! 🙏 I am **Taana Sutra** (ताना सूत्र), your AI handloom companion. Ask me anything about Indian weaving techniques, warp & weft (Taana-Baana), GI certifications, or how to care for your heirloom textiles.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Contextual initial prompt if user navigates to a specific product
  useEffect(() => {
    if (currentProduct && isOpen) {
      // Don't duplicate if already added
      const hasProductPrompt = messages.some((m) => m.content.includes(currentProduct.name));
      if (!hasProductPrompt) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ctx-${Date.now()}`,
            role: 'assistant',
            content: `I see you are admiring the **${currentProduct.name}** hand-woven in ${currentProduct.weavers?.region || 'India'} from ${currentProduct.material}! Would you like to know about its weaving technique, pure zari certification, or styling tips?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    }
  }, [currentProduct?.id, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const payload: any = {
        message: text,
        history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
      };

      if (currentProduct) {
        payload.productContext = {
          name: currentProduct.name,
          material: currentProduct.material,
          region: currentProduct.weavers?.region,
          weaver_name: currentProduct.weavers?.name,
          price: currentProduct.price,
          description: currentProduct.description,
        };
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Chat API returned error');
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Thank you for supporting authentic Indian handloom artisans.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.warn('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: `Authentic Indian handlooms are woven on traditional pit-looms using manual shuttles. In true ${currentProduct ? currentProduct.material : 'handloom weaves'}, slight optical irregularities in the warp & weft are the signature hallmarks of human handcraft, not defects. Feel free to ask about draping, yarn tests, or loom history!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const sampleQuestions = currentProduct
    ? [
        `How was this ${currentProduct.name} woven?`,
        `How to test if this ${currentProduct.material} is authentic?`,
        `Care & storage instructions for this weave`,
      ]
    : [
        'Difference between Ikat and Jamdani?',
        'How to identify authentic handloom vs powerloom?',
        'Why does hand-spun yarn feel more breathable?',
        'Why does a pit loom make softer drape?',
      ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative bg-gradient-to-r from-[#1B2A4A] to-[#253966] text-[#F6F1E7] border-2 border-[#D89B2C] hover:border-[#F5CE7B] p-4 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-3"
          aria-label="Open Taana Sutra Handloom AI Assistant"
          id="open-chatbot-btn"
        >
          <div className="relative">
            <Feather className="w-6 h-6 text-[#D89B2C]" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#D89B2C] rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#D89B2C] rounded-full"></span>
          </div>
          <div className="text-left hidden sm:block pr-2">
            <div className="text-xs font-bold text-[#F6F1E7] flex items-center gap-1">
              <span>Taana Sutra AI</span>
              <ThreadClusterIcon className="w-3 h-3 text-[#D89B2C]" />
            </div>
            <div className="text-[10px] text-[#D89B2C] font-serif">
              {currentProduct ? 'Ask about this weave' : 'Handloom Craft Guide'}
            </div>
          </div>
        </button>
      )}

      {/* Expanded Chatbot Window */}
      {isOpen && (
        <div className="bg-[#FDFBF7] rounded-2xl w-[92vw] sm:w-[420px] h-[540px] max-h-[85vh] border-2 border-[#D89B2C] shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          {/* Chat Header */}
          <div className="bg-[#1B2A4A] text-[#F6F1E7] p-4 border-b border-[#D89B2C]/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#D89B2C] to-[#B87B16] text-[#1B2A4A] flex items-center justify-center font-bold">
                <Feather className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-sm text-[#F6F1E7]">
                    Taana Sutra (ताना सूत्र)
                  </h3>
                  <span className="bg-[#7A2734] text-white text-[9px] px-1.5 py-0.5 rounded font-medium">
                    AI Assistant
                  </span>
                </div>
                <p className="text-[11px] text-[#D89B2C] font-sans">
                  {currentProduct
                    ? `Context: ${currentProduct.name.slice(0, 24)}...`
                    : 'Indian Handloom Heritage & Weaving Expert'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full text-[#F6F1E7]/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close Chat"
              id="close-chatbot-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Product Active Banner if applicable */}
          {currentProduct && (
            <div className="bg-[#142038] text-[11px] px-4 py-2 text-[#F6F1E7]/90 border-b border-[#D89B2C]/20 flex items-center justify-between">
              <span className="truncate">
                Viewing: <strong className="text-[#D89B2C]">{currentProduct.name}</strong>
              </span>
              <span className="text-[#D89B2C] font-mono shrink-0 ml-2">₹{currentProduct.price}</span>
            </div>
          )}

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-craft-grain">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-[#1B2A4A] border border-[#D89B2C]/40 text-[#D89B2C] flex items-center justify-center shrink-0 text-xs">
                    <Feather className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#1B2A4A] text-[#F6F1E7] rounded-tr-none'
                      : 'bg-white text-[#1B2A4A] border border-[#D89B2C]/30 shadow-sm rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      msg.role === 'user' ? 'text-[#F6F1E7]/50' : 'text-[#1B2A4A]/40'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-[#D89B2C] text-[#1B2A4A] flex items-center justify-center shrink-0 text-xs font-bold">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 items-center text-xs text-[#1B2A4A]/60 bg-white p-2.5 rounded-xl border border-[#D89B2C]/30 w-fit">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D89B2C]" />
                <span className="font-serif italic">Weaving an authentic response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-3 py-2 bg-white/80 border-t border-[#D89B2C]/20 flex gap-1.5 overflow-x-auto no-scrollbar">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="shrink-0 text-[11px] bg-[#1B2A4A]/5 hover:bg-[#D89B2C]/20 text-[#1B2A4A] hover:text-[#7A2734] border border-[#D89B2C]/30 px-2.5 py-1 rounded-full transition-colors truncate max-w-[220px]"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-gray-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about weaves, yarn care, draping..."
              className="flex-1 p-2.5 text-xs rounded-xl border border-[#D89B2C]/40 focus:outline-none focus:ring-2 focus:ring-[#D89B2C] text-[#1B2A4A]"
              id="chatbot-input"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="p-2.5 rounded-xl bg-[#1B2A4A] text-[#D89B2C] hover:bg-[#253966] disabled:opacity-40 transition-colors shadow-sm"
              id="chatbot-send-btn"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
