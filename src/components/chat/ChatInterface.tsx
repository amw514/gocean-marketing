import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  pdfContent: string;
  expertRole: string;
}

export default function ChatInterface({ pdfContent, expertRole }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load cached messages
  useEffect(() => {
    const cachedMessages = localStorage.getItem(`chat-${expertRole}`);
    if (cachedMessages) {
      setMessages(JSON.parse(cachedMessages));
    }
  }, [expertRole]);

  // Save messages to cache
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat-${expertRole}`, JSON.stringify(messages));
    }
  }, [messages, expertRole]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const newUserMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, newUserMessage],
          pdfContent,
          expertRole,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      const assistantMessage = { role: 'assistant' as const, content: data.message };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant' as const, content: 'Sorry, I encountered an error. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-900 rounded-lg p-4">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-600 ml-auto'
                : 'bg-gray-700'
            } max-w-[80%]`}
          >
            <p className="text-white">{message.content}</p>
          </div>
        ))}
        {isLoading && (
          <div className="bg-gray-700 p-3 rounded-lg max-w-[80%]">
            <p className="text-white">Thinking...</p>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="bg-gray-800 text-white"
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <Button
          onClick={sendMessage}
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
} 