import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Pill, 
  Stethoscope,
  Clock,
  MapPin,
  Phone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
  isTyping?: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  message: string;
  category: 'medicine' | 'appointment' | 'general';
}

export default function MedicalChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hello! I'm your medical assistant. I can help you with:\n\n🔹 **Medicine Information** - Ask about available medicines, prices, and stock\n🔹 **Doctor Appointments** - Get recommendations for specialists\n🔹 **General Health Guidance** - Basic health information and advice\n\nHow can I help you today?",
      sender: 'bot',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    {
      id: '1',
      label: 'Find Medicine',
      icon: <Pill className="h-4 w-4" />,
      message: "What medicines are available for headache?",
      category: 'medicine'
    },
    {
      id: '2',
      label: 'Book Doctor',
      icon: <Stethoscope className="h-4 w-4" />,
      message: "I need to see a doctor for my symptoms",
      category: 'appointment'
    },
    {
      id: '3',
      label: 'Check Stock',
      icon: <MapPin className="h-4 w-4" />,
      message: "Which pharmacies have medicines in stock?",
      category: 'medicine'
    },
    {
      id: '4',
      label: 'Emergency Help',
      icon: <Phone className="h-4 w-4" />,
      message: "I have severe symptoms and need immediate help",
      category: 'general'
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: 'typing',
      content: '',
      sender: 'bot',
      timestamp: new Date().toISOString(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await fetch('http://localhost/heal-u/backend/api/chatbot.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message })
      });

      const data = await response.json();

      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));

      if (data.success !== false && data.message) {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: formatBotResponse(data.message),
          sender: 'bot',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (error) {
      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
      
      console.error('Chatbot error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble connecting right now. Please try again later or contact your healthcare provider directly for urgent matters.",
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to connect to medical assistant');
    } finally {
      setIsLoading(false);
    }
  };

  const formatBotResponse = (response: string): string => {
    // Format the response with better markdown and structure
    return response
      .replace(/\*\*(.*?)\*\*/g, '**$1**') // Keep bold formatting
      .replace(/\*(.*?)\*/g, '*$1*') // Keep italic formatting
      .replace(/- (.*?)$/gm, '• $1') // Better bullet points
      .replace(/\n\n+/g, '\n\n') // Remove excessive line breaks
      .trim();
  };

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.message);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) {
    return (
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="bg-gradient-medical hover:opacity-90 rounded-full h-14 w-14 shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        <Badge className="absolute -top-2 -right-2 bg-green-500 text-white animate-pulse">
          Online
        </Badge>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50 w-96 max-w-[90vw]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-2xl border-0">
        <CardHeader className="bg-gradient-medical text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-heading flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Medical Assistant
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              ×
            </Button>
          </div>
          <p className="text-sm text-white/90">
            Get help with medicines and appointments
          </p>
        </CardHeader>

        <CardContent className="p-0">
          {/* Messages Area */}
          <ScrollArea className="h-96 p-4">
            <div className="space-y-3">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        message.sender === 'user'
                          ? 'bg-gradient-medical text-white ml-auto'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {message.isTyping ? (
                        <div className="flex items-center gap-1">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      ) : (
                        <>
                          <div className="whitespace-pre-wrap text-sm">
                            {message.content}
                          </div>
                          <div className={`text-xs mt-1 ${
                            message.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'
                          }`}>
                            {formatTimestamp(message.timestamp)}
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2">
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action)}
                    className="text-xs h-8 flex items-center gap-1"
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about medicines or appointments..."
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(inputMessage)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={() => sendMessage(inputMessage)}
                disabled={!inputMessage.trim() || isLoading}
                size="sm"
                className="bg-gradient-medical hover:opacity-90"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              <Clock className="h-3 w-3 inline mr-1" />
              Response time: ~2-3 seconds
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
