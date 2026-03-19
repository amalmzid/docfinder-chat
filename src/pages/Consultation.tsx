import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Stethoscope } from "lucide-react";
import { motion } from "framer-motion";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot" | "doctor";
  time: string;
}

const botReplies: Record<string, string> = {
  headache: "Headaches can have many causes. If persistent, I recommend consulting a neurologist. Stay hydrated and rest. Would you like me to find a doctor for you?",
  fever: "For mild fever, rest and drink fluids. If temperature exceeds 103°F (39.4°C) or lasts more than 3 days, please see a doctor immediately.",
  cold: "Common colds usually resolve in 7-10 days. Rest, stay hydrated, and consider over-the-counter remedies. See a doctor if symptoms worsen.",
  appointment: "You can book an appointment from the Appointments page. Would you like me to direct you there?",
  doctor: "We have specialists in cardiology, dermatology, pediatrics, neurology, and orthopedics. Visit the Doctors page to browse and book.",
};

function getBotReply(msg: string): string {
  const lower = msg.toLowerCase();
  for (const [key, reply] of Object.entries(botReplies)) {
    if (lower.includes(key)) return reply;
  }
  return "Thank you for your message. For specific medical advice, I recommend booking a consultation with one of our doctors. How else can I help you?";
}

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Consultation() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I'm the E-MedCare assistant. I can help with basic health questions or connect you with a doctor. How can I help you today?", sender: "bot", time: getTime() },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), text: input, sender: "user", time: getTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const reply: Message = { id: Date.now() + 1, text: getBotReply(input), sender: "bot", time: getTime() };
      setMessages((prev) => [...prev, reply]);
    }, 800);
  };

  return (
    <div className="container py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold mb-2">Consultation</h1>
        <p className="text-muted-foreground">Chat with our AI assistant or connect with a doctor</p>
      </div>

      <Card className="shadow-elevated overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-medical p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Stethoscope className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-primary-foreground">Medical Assistant</h3>
            <Badge variant="secondary" className="text-xs">Online</Badge>
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4 bg-muted/30">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender !== "user" && (
                <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.sender === "user"
                    ? "bg-gradient-medical text-primary-foreground rounded-br-md"
                    : "bg-card border rounded-bl-md"
                }`}
              >
                <p>{msg.text}</p>
                <span className={`text-xs mt-1 block ${msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {msg.time}
                </span>
              </div>
              {msg.sender === "user" && (
                <div className="h-8 w-8 rounded-full bg-gradient-medical flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </motion.div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t flex gap-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button onClick={handleSend} className="bg-gradient-medical hover:opacity-90">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
