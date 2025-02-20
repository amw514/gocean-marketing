"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FiUpload, FiFile, FiX } from "react-icons/fi";
import { extractTextFromPDF } from "@/lib/pdf";
import ReactMarkdown from "react-markdown";

interface FileState {
  file: File | null;
  name: string;
  size: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function RefineRemodel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pdfContent, setPdfContent] = useState<string>("");
  const [isPdfUploaded, setIsPdfUploaded] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileState, setFileState] = useState<FileState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      if (!text || text.trim().length === 0) {
        setMessages([
          {
            role: "assistant",
            content: "I couldn't read the text from this PDF. You can paste the document content here, and I'll help you refine and improve it. What changes would you like to make?",
          },
        ]);
        return;
      }

      setPdfContent(text);
      setIsPdfUploaded(true);
      setMessages([
        {
          role: "assistant",
          content: `PDF "${file.name}" loaded successfully! To help improve this document:\n\n1. Share your new findings or experiences\n2. Describe any updates needed\n3. I'll help integrate these changes into the document`,
        },
      ]);
    } catch (error) {
      console.error("Error processing PDF:", error);
      setMessages([
        {
          role: "assistant",
          content: "Having trouble with the PDF? No problem! You can:\n\n1. Copy and paste your document content here\n2. Tell me what you'd like to improve\n3. I'll help enhance the content based on your input",
        },
      ]);
      setFileState(null);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const newUserMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, newUserMessage],
          pdfContent,
          expertRole: "Act as a document improvement specialist and update the document based on the new information provided. Focus on incorporating real-time experiences and findings to enhance the original content.",
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Refine & Remodel</h1>
        
        {/* PDF Upload Area */}
        <div className="mb-6">
          <div
            className={`relative border-2 border-dashed rounded-lg transition-all h-[50px] flex items-center
              ${dragActive ? "border-red-500 bg-red-500/10" : "border-gray-600 hover:border-red-500"}
              ${fileState ? "bg-gray-800" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              aria-label="Upload PDF file"
              id="pdf-upload"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />

            {!fileState ? (
              <div className="flex items-center justify-center w-full">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center text-white hover:text-red-400"
                >
                  <FiUpload className="h-4 w-4 mr-2" />
                  <span>Upload PDF to Update</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full px-4">
                <div className="flex items-center space-x-2 overflow-hidden">
                  <FiFile className="h-4 w-4 text-red-400 flex-shrink-0" />
                  <span className="text-sm text-white truncate">
                    {fileState.name}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Remove uploaded file"
                  onClick={() => {
                    setFileState(null);
                    setPdfContent("");
                    setIsPdfUploaded(false);
                    setMessages([]);
                  }}
                  className="p-1 hover:text-red-400 text-white"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-gray-800 rounded-lg p-4 h-[600px] flex flex-col border border-gray-700">
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

          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isPdfUploaded
                  ? "Describe your new findings and experiences to update the document..."
                  : "Please upload a PDF first"
              }
              className="bg-gray-700 text-white border-gray-600 focus:border-red-500"
              disabled={!isPdfUploaded || isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button
              onClick={sendMessage}
              disabled={!isPdfUploaded || isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? "Processing..." : "Update"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
