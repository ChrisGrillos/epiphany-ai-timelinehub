import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Send, Loader2, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DocumentNavigatorPanel({ onClose }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your Document Navigator. I can help you find research papers, case studies, apps, and timeline entries. What are you looking for?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const initConversation = async () => {
      try {
        const conv = await base44.agents.createConversation({
          agent_name: "documentNavigator",
          metadata: {
            name: "Document Search Session",
            description: "User searching for documents"
          }
        });
        setConversationId(conv.id);
      } catch (error) {
        console.error("Conversation init error:", error);
      }
    };
    initConversation();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !conversationId) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const conversation = { id: conversationId, messages: [...messages, userMessage] };
      const response = await base44.agents.addMessage(conversation, userMessage);
      
      const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
        setMessages(data.messages);
      });

      setTimeout(() => unsubscribe(), 30000);
    } catch (error) {
      console.error("Message error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col h-full max-h-96">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-slate-900 text-sm">Document Navigator</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${msg.role === "user" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-900"}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 px-3 py-2 rounded-lg">
                <Loader2 className="w-4 h-4 text-slate-600 animate-spin" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-100">
        <div className="flex gap-2">
          <Input
            placeholder="Search or ask..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="text-sm rounded-full"
            disabled={loading}
          />
          <Button type="submit" size="icon" className="rounded-full bg-indigo-600 hover:bg-indigo-500 text-white" disabled={loading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}