import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Zap, MapPin, Battery, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logomark from '@/assets/a-plus-logomark.png';
interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const quickReplies = [
  { icon: MapPin, text: "Find nearest charger", query: "Where is the nearest charging station?" },
  { icon: Battery, text: "Charger types", query: "What types of chargers do you offer?" },
  { icon: Zap, text: "Charging speed", query: "How fast can I charge my EV?" },
  { icon: HelpCircle, text: "Become partner", query: "How can I become a charging station partner?" },
];

const botResponses: Record<string, string> = {
  "where is the nearest charging station?": "We have 25+ charging stations across Northeast India! The closest ones to Guwahati are at Lokhra, Zoo Road, and GS Road. Use our 'Find Charger' feature or download the A Plus Charge app for real-time availability and navigation!",
  "what types of chargers do you offer?": "We offer three types of chargers:\n\n⚡ **AC Chargers (7.4kW)** - Perfect for residential & overnight charging\n\n🔋 **DC Fast Chargers (30kW)** - Charge up to 80% in ~45 mins\n\n⚡ **DC Rapid Chargers (60kW)** - Ultra-fast charging in ~25 mins\n\nAll compatible with CCS2 and Type 2 connectors!",
  "how fast can i charge my ev?": "Charging speed depends on the charger type:\n\n🏠 **AC Charger**: ~6-8 hours (full charge)\n⚡ **30kW DC**: ~45 mins (0-80%)\n🚀 **60kW DC**: ~25 mins (0-80%)\n\nOur DC fast chargers are perfect for quick top-ups during your journey!",
  "how can i become a charging station partner?": "Great question! We offer two partnership models:\n\n💰 **CAPEX Model**: You invest, we operate. Higher returns!\n\n🤝 **OPEX Model**: Zero investment, revenue sharing.\n\nBenefits include free installation, 24/7 maintenance, and marketing support. Visit our 'Become Partner' page or call us at +91-XXX-XXX-XXXX!",
  "default": "Thanks for reaching out! I'm here to help with:\n\n📍 Finding charging stations\n⚡ Charger types & speeds\n🤝 Partnership opportunities\n📱 App support\n\nHow can I assist you today?"
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! 👋 I'm A Plus Charge Assistant. How can I help you power your EV journey today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const getBotResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase().trim();
    
    for (const [key, response] of Object.entries(botResponses)) {
      if (key !== 'default' && lowerQuery.includes(key.replace('?', '').toLowerCase())) {
        return response;
      }
    }
    
    // Check for keywords
    if (lowerQuery.includes('charger') && lowerQuery.includes('near')) {
      return botResponses["where is the nearest charging station?"];
    }
    if (lowerQuery.includes('type') || lowerQuery.includes('kind')) {
      return botResponses["what types of chargers do you offer?"];
    }
    if (lowerQuery.includes('fast') || lowerQuery.includes('speed') || lowerQuery.includes('time')) {
      return botResponses["how fast can i charge my ev?"];
    }
    if (lowerQuery.includes('partner') || lowerQuery.includes('invest')) {
      return botResponses["how can i become a charging station partner?"];
    }
    
    return botResponses["default"];
  };

  const handleSend = (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot thinking
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(messageText),
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center group ${
          isOpen 
            ? 'bg-slate-800 rotate-0' 
            : 'bg-gradient-to-r from-primary to-cyan-500 hover:scale-110 hover:shadow-[0_0_30px_rgba(38,116,236,0.5)]'
        }`}
        style={{
          animation: isOpen ? undefined : 'pulse 2s infinite'
        }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          </>
        )}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 origin-bottom-right ${
          isOpen 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{
          maxHeight: 'calc(100vh - 160px)'
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-cyan-500 p-4 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-30" />
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm overflow-hidden">
              <img src={logomark} alt="A Plus" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <h3 className="font-bold">A Plus Charge Assistant</h3>
              <p className="text-xs text-white/80 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Online • Typically replies instantly
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[320px] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-white">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} animate-fade-in`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  message.isBot
                    ? 'bg-white shadow-md rounded-tl-sm text-foreground'
                    : 'bg-gradient-to-r from-primary to-cyan-500 text-white rounded-tr-sm'
                }`}
              >
                <p className="whitespace-pre-line">{message.text}</p>
                <p className={`text-[10px] mt-1 ${message.isBot ? 'text-muted-foreground' : 'text-white/70'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white shadow-md rounded-2xl rounded-tl-sm p-3 flex gap-1">
                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleSend(reply.query)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-full text-xs font-medium text-primary transition-colors"
              >
                <reply.icon className="w-3 h-3" />
                {reply.text}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-border bg-white">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <Button
              onClick={() => handleSend()}
              disabled={!inputValue.trim()}
              className="w-10 h-10 rounded-full p-0 bg-gradient-to-r from-primary to-cyan-500 hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(38, 116, 236, 0.4); }
          50% { box-shadow: 0 0 0 12px rgba(38, 116, 236, 0); }
        }
      `}</style>
    </>
  );
};

export default ChatBot;
