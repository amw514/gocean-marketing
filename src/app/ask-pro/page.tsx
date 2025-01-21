"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { extractTextFromPDF } from '@/lib/pdf';
import ReactMarkdown from 'react-markdown';

const expertRoles = [
  "Brand Strategist",
  "Marketing Director",
  "Business Consultant",
  "UX/UI Designer",
  "Web Developer",
  "Content Strategist",
  "Data Analyst",
  "Sales Director",
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AskPro() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pdfContent, setPdfContent] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isPdfUploaded, setIsPdfUploaded] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const text = await extractTextFromPDF(file);
        setPdfContent(text);
        setIsPdfUploaded(true);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'PDF uploaded successfully! How can I help you with this document?'
        }]);
      } catch (error) {
        console.error('Error reading PDF:', error);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Sorry, I had trouble reading that PDF. Please try again.'
        }]);
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !selectedRole) return;

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
          expertRole: selectedRole,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Ask a Pro</h1>

        <div className="space-y-6 mb-6">
          {/* Expert Role Selection */}
          <div className="mb-4">
            <Select onValueChange={setSelectedRole}>
              <SelectTrigger className="bg-gray-800 text-white">
                <SelectValue placeholder="Choose an expert role" />
              </SelectTrigger>
              <SelectContent>
                {expertRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    Act as a {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* PDF Upload */}
          <div className="mb-4">
            <Input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="bg-gray-800 text-white"
            />
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-gray-900 rounded-lg p-4 h-[500px] flex flex-col">
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
                <ReactMarkdown 
                  className="text-white prose prose-invert prose-sm max-w-none"
                  components={{
                    p: ({...props}) => <p className="mb-2" {...props} />,
                    ul: ({...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                    ol: ({...props}) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                    li: ({...props}) => <li className="mb-1" {...props} />,
                    strong: ({...props}) => <strong className="font-bold" {...props} />,
                    em: ({...props}) => <em className="italic" {...props} />,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
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
              placeholder={isPdfUploaded ? "Ask about your PDF..." : "Please upload a PDF first"}
              className="bg-gray-800 text-white"
              disabled={!isPdfUploaded || isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button
              onClick={sendMessage}
              disabled={!isPdfUploaded || isLoading || !selectedRole}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
