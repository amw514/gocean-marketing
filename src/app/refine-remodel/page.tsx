"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {  FiExternalLink, FiFile, FiUpload } from "react-icons/fi";
import { extractTextFromPDF } from "@/lib/pdf";
import ReactMarkdown from "react-markdown";
import { exportToPdf } from '@/lib/export';

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface FileState {
  file: File | null;
  name: string;
  size: string;
}

const DATA_CENTER_URL = "https://drive.google.com/drive/folders/1n2hbQ0dWZiIj-PsbsAv2pWbk0BilOdKg?usp=drive_link&pli=1"; // Replace with actual URL

export default function RefineRemodel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pdfContent, setPdfContent] = useState<string>("");
  const [isPdfUploaded, setIsPdfUploaded] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileState, setFileState] = useState<FileState | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      await handleFile(file);
    }
  };

  const handleFile = async (file: File) => {
    setFileState({
      file,
      name: file.name,
      size: formatFileSize(file.size),
    });

    try {
      setIsLoading(true);
      const text = await extractTextFromPDF(file);

      if (!text) {
        setMessages([
          {
            role: "assistant",
            content: "I couldn't read that PDF. You can:\n\n1. Paste the document content directly here\n2. Describe the updates needed, and I'll help you refine it",
          },
        ]);
        return;
      }

      setPdfContent(text);
      setIsPdfUploaded(true);
      setMessages([
        {
          role: "assistant",
          content: `Document loaded! Please write in detail:\n\n1. Your real-time experiences and findings\n2. Any new information discovered\n3. Updates needed based on current business data`,
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const newUserMessage = { role: "user" as const, content: input };
    setMessages(prev => [...prev, newUserMessage]);
    setInput("");

    try {
      const response = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfContent: pdfContent || "",
          newInformation: input,
          previousMessages: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      setMessages(prev => [
        ...prev,
        { 
          role: "assistant", 
          content: data.updatedContent 
        }
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I encountered an error. Please try again."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModifyAgain = () => {
    setMessages(prev => [...prev, {
      role: "assistant",
      content: "What would you like to modify in the document? Please describe the changes needed."
    }]);
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Refine & Remodel</h1>

        {/* Document Source Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Data Center Link */}
          <a
            href={DATA_CENTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
          >
            <FiExternalLink className="w-5 h-5 text-red-400" />
            <span className="text-white">Access Data Center</span>
          </a>

          {/* PDF Upload Area */}
          <div
            className={`flex items-center justify-center p-4 border-2 border-dashed rounded-lg transition-all
              ${dragActive ? "border-red-500 bg-red-500/10" : "border-gray-600 hover:border-red-500"}
              ${fileState ? "bg-gray-800" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".pdf"
              id="pdf-upload"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <label
              htmlFor="pdf-upload"
              className="flex items-center gap-2 cursor-pointer text-white hover:text-red-400"
            >
              {fileState ? (
                <>
                  <FiFile className="w-5 h-5" />
                  <span className="truncate max-w-[200px]">{fileState.name}</span>
                </>
              ) : (
                <>
                  <FiUpload className="w-5 h-5" />
                  <span>Upload PDF</span>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-gray-800 rounded-lg p-4 h-[600px] flex flex-col border border-gray-700">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  message.role === "user" ? "bg-red-600 ml-auto" : "bg-gray-700"
                } max-w-[80%]`}
              >
                <ReactMarkdown className="text-white prose prose-invert prose-sm max-w-none">
                  {message.content}
                </ReactMarkdown>
              </div>
            ))}
            {isLoading && (
              <div className="bg-gray-700 p-3 rounded-lg max-w-[80%]">
                <p className="text-white">Processing...</p>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isPdfUploaded
                  ? "Describe your updates and findings..."
                  : "Paste your document content or describe needed updates..."
              }
              className="bg-gray-700 text-white border-gray-600 focus:border-red-500"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? "Processing..." : "Send"}
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        {messages.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-center gap-4">
              <Button
                onClick={handleModifyAgain}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 flex-1"
              >
                Update Again
              </Button>
            </div>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => exportToPdf(messages, `${fileState?.name || 'Document'}-Updated`)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 flex-1"
              >
                Export Final PDF
              </Button>
            </div>
          </div>
        )}

        {/* Status Message */}
        {messages.length > 0 && !isLoading && (
          <p className="text-center text-gray-400 mt-4">
            Choose to update the document again or export the final version as PDF
          </p>
        )}
      </div>
    </div>
  );
}
