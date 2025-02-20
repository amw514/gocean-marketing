"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FiUpload, FiFile, FiX, FiDownload } from "react-icons/fi";

import { extractTextFromPDF } from "@/lib/pdf";
import ReactMarkdown from "react-markdown";
import { exportToPdf, exportToTxt } from '@/lib/export';

const expertRoles = [
  "Act as a Brand manager and...",
  "Act as a Brand strategist and...",
  "Act as a Business analyst and...",
  "Act as a Business coach and...",
  "Act as a Business consultant and...",
  "Act as a Content marketer and...",
  "Act as a Content strategist and...",
  "Act as a Copywriter and...",
  "Act as a Creative director and...",
  "Act as a Customer service representative and...",
  "Act as a Data analyst and...",
  "Act as a Data scientist and...",
  "Act as a Graphic designer and...",
  "Act as a Growth hacker and...",
  "Act as a Lead generation specialist and...",
  "Act as a Market analyst and...",
  "Act as a Marketing automation specialist and...",
  "Act as a Mobile app developer and...",
  "Act as a Product manager and...",
  "Act as a Product marketing manager and...",
  "Act as a Product owner and...",
  "Act as a Project manager and...",
  "Act as a Public speaker and...",
  "Act as a Sales manager and...",
  "Act as a Sales representative and...",
  "Act as a Search engine marketer and...",
  "Act as a Social media copywriter and...",
  "Act as a Social media manager and...",
  "Act as a Social media strategist and...",
  "Act as a User experience designer and...",
  "Act as a User researcher and...",
  "Act as a UX researcher and...",
  "Act as a video editor and...",
  "Act as a visual designer and...",
  "Act as a web analyst and...",
  "Act as a web copywriter and...",
  "Act as a web designer and...",
  "Act as a Back-end web developer and...",
  "Act as a Brand activation specialist and...",
  "Act as a Brand ambassador and...",
  "Act as a Brand analyst and...",
  "Act as a Brand copy editor and...",
  "Act as a Brand copywriter and...",
  "Act as a Brand designer and...",
  "Act as a Brand identity consultant and...",
  "Act as a Brand identity designer and...",
  "Act as a Brand marketing consultant and...",
  "Act as a Brand reputation manager and...",
  "Act as a Brand voice strategist and...",
  "Act as a Business development manager and...",
  "Act as a Business writer and...",
  "Act as a Chatbot copywriter and...",
  "Act as a Chatbot developer and...",
  "Act as a Community builder and...",
  "Act as a Community manager and...",
  "Act as a content creator and...",
  "Act as a content editor and...",
  "Act as a Content marketing manager and...",
  "Act as a Content marketing specialist (B2B) and...",
  "Act as a Content producer and...",
  "Act as a content specialist and...",
  "Act as a Content writer and...",
  "Act as a Conversion copywriter and...",
  "Act as a Conversion optimization expert and...",
  "Act as a Conversion rate optimization analyst and...",
  "Act as a Conversion rate optimization specialist and...",
  "Act as a conversion rate optimizer and...",
  "Act as a Copy editor and...",
  "Act as a CRM specialist and...",
  "Act as a Customer experience designer and...",
  "Act as a customer experience manager and...",
  "Act as a Customer experience specialist and...",
  "Act as a Customer retention specialist and...",
  "Act as a Customer success manager and...",
  "Act as a Digital ad manager and...",
  "Act as a Digital advertising specialist and...",
  "Act as a Digital content producer and...",
  "Act as a Digital content strategist and...",
  "Act as a Digital marketer and...",
  "Act as a Digital marketing analyst and...",
  "Act as a Digital marketing coach and...",
  "Act as a Digital marketing consultant and...",
  "Act as a Digital marketing coordinator and...",
  "Act as a Digital marketing director and...",
  "Act as a Digital marketing evangelist and...",
  "Act as a Digital marketing executive and...",
  "Act as a Digital marketing instructor and...",
  "Act as a Digital marketing manager and...",
  "Act as a Digital marketing mentor and...",
  "Act as a digital marketing specialist and...",
  "Act as a Digital marketing strategist and...",
  "Act as a Digital marketing trainer and...",
  "Act as a Digital media buyer and...",
  "Act as a Digital PR specialist and...",
  "Act as a Digital product manager and...",
  "Act as a Digital sales representative and...",
  "Act as a Digital strategist and...",
  "Act as a Display advertising specialist and...",
  "Act as a E-commerce consultant and...",
  "Act as a E-commerce marketing specialist and...",
  "Act as a Email marketing specialist and...",
  "Act as a financial advisor and...",
  "Act as a Front-end web developer and...",
  "Act as a Full-stack developer and...",
  "Act as a Game developer and...",
  "Act as a Google Analytics specialist and...",
  "Act as a Growth analyst and...",
  "Act as a Growth marketer and...",
  "Act as a Growth marketing consultant and...",
  "Act as a human resources manager and...",
  "Act as a Human resources specialist and...",
  "Act as a Landing page designer and...",
  "Act as a Market research analyst and...",
  "Act as a Market researcher (business) and...",
  "Act as a Market researcher (consumer) and...",
  "Act as a market researcher and...",
  "Act as a marketing analyst and strategist and...",
  "Act as a Marketing automation expert and...",
  "Act as a marketing coordinator and...",
  "Act as a Marketing data analyst and...",
  "Act as a marketing manager and...",
  "Act as a Marketing writer and...",
  "Act as a media buyer and...",
  "Act as a media planner and...",
  "Act as a Mobile app designer and...",
  "Act as a Mobile app developer (Android) and...",
  "Act as a Mobile app developer (iOS) and...",
  "Act as a Mobile app marketer and...",
  "Act as a mobile marketing specialist and...",
  "Act as a Motion graphics designer and...",
  "Act as a Online marketing specialist and...",
  "Act as a Paid search specialist and...",
  "Act as a Podcast host and...",
  "Act as a Podcast producer and...",
  "Act as a PPC analyst and...",
  "Act as a PPC copywriter and...",
  "Act as a PPC specialist and...",
  "Act as a PR manager and...",
  "Act as a Product design manager and...",
  "Act as a Product designer and...",
  "Act as a product strategist and...",
  "Act as a Public relations specialist and...",
  "Act as a Sales funnel specialist and...",
  "Act as a sales trainer and...",
  "Act as a Sales writer and...",
  "Act as a search analyst and...",
  "Act as a Search engine optimization specialist and...",
  "Act as a search engine optimizer and...",
  "Act as a search engine specialist and...",
  "Act as a SEM specialist and...",
  "Act as a SEO analyst and...",
  "Act as a SEO copywriter and...",
  "Act as a Social media advertiser and...",
  "Act as a Social media advertising manager and...",
  "Act as a Social media advertising specialist (paid) and...",
  "Act as a Social media analyst and...",
  "Act as a Social media analytics specialist and...",
  "Act as a Social media content creator and...",
  "Act as a Social media crisis manager and...",
  "Act as a Social media customer service representative and...",
  "Act as a Social media engagement manager and...",
  "Act as a Social media engagement specialist and...",
  "Act as a Social media influencer and...",
  "Act as a Social media listening specialist and...",
  "Act as a Social media manager (paid) and...",
  "Act as a social media marketer and...",
  "Act as a Social media producer and...",
  "Act as a Social media strategist (organic) and...",
  "Act as a Social media strategist (paid) and...",
  "Act as a software engineer and...",
  "Act as a supply chain manager and...",
  "Act as a Talent acquisition manager and...",
  "Act as a Technical writer and...",
  "Act as a UI designer and...",
  "Act as a UI/UX designer and...",
  "Act as a User acquisition specialist and...",
  "Act as a User experience analyst and...",
  "Act as a User experience consultant and...",
  "Act as a User experience researcher and...",
  "Act as a User interface designer and...",
  "Act as a UX writer and...",
  "Act as a UX/UI designer and...",
  "Act as a Video marketer and...",
  "Act as a Video producer and...",
  "Act as a Visual content creator and...",
  "Act as a Web analytics expert and...",
  "Act as a web content editor and...",
  "Act as a Web content strategist and...",
  "Act as a web content writer and...",
  "Act as a Web conversion specialist and...",
  "Act as a web developer and designer and...",
  "Act as a Web development consultant and...",
  "Act as a Web development project manager and...",
  "Act as a Web development team leader and...",
  "Act as a Web hosting specialist and...",
  "Act as a web marketing specialist and...",
  "Act as a web producer and...",
  "Act as a web strategist and...",
  "Act as a web writer and...",
  "Act as a Website administrator and...",
  "Act as a Website conversion specialist and...",
  "Act as a Website optimization specialist and...",
  "Act as an A/B testing specialist and...",
  "Act as an Ad copywriter and...",
  "Act as an Affiliate marketer and...",
  "Act as an Analytics consultant and...",
  "Act as a E-commerce specialist and...",
  "Act as an Email automation specialist and...",
  "Act as an Email copywriter and...",
  "Act as an Email marketer and...",
  "Act as an Event planner and...",
  "Act as an Influencer and...",
  "Act as an Influencer marketer and...",
  "Act as an Influencer outreach specialist and...",
  "Act as an Online advertising manager and...",
  "Act as an Online advertising specialist and...",
  "Act as an Online community manager and...",
  "Act as an Online course creator and...",
  "Act as an Online marketing manager and...",
  "Act as an Online reputation manager and...",
  "Act as an SEO copywriter and...",
  "Act as an SEO expert and...",
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface FileState {
  file: File | null;
  name: string;
  size: string;
}

export default function AskPro() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pdfContent, setPdfContent] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isPdfUploaded, setIsPdfUploaded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRoles, setFilteredRoles] = useState(expertRoles);
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

      if (!text) {
        setMessages([
          {
            role: "assistant",
            content: "I couldn't read that PDF. You can:\n\n1. Paste the content directly here\n2. Ask your questions, and I'll guide you",
          },
        ]);
        return;
      }

      setPdfContent(text);
      setIsPdfUploaded(true);
      setMessages([
        {
          role: "assistant",
          content: `PDF processed! How can I help you analyze this content?\n\n1. What insights are you looking for?\n2. What's your goal with this analysis?`,
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !selectedRole) return;

    setIsLoading(true);
    const newUserMessage = { role: "user" as const, content: input };
    setMessages(prev => [...prev, newUserMessage]);
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, newUserMessage],
          pdfContent: pdfContent || "",
          expertRole: selectedRole,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: data.message }
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I encountered an error. Please try again or rephrase your question."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = expertRoles.filter((role) =>
      role.toLowerCase().includes(query)
    );
    setFilteredRoles(filtered);
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Ask a Pro</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Expert Role Selection - Compact & Styled */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-4 py-3 text-left bg-red-600 hover:bg-red-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 flex justify-between items-center transition-colors"
            >
              <span>{selectedRole || "Select a role..."}</span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  isDropdownOpen ? "transform rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
                <div className="p-2 border-b border-gray-700">
                  <input
                    type="text"
                    placeholder="Search roles..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredRoles.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        setSelectedRole(role);
                        setIsDropdownOpen(false);
                        setSearchQuery("");
                        setFilteredRoles(expertRoles);
                      }}
                      className={`w-full px-4 py-2 text-left text-white hover:bg-red-600/50 transition-colors ${
                        selectedRole === role ? "bg-red-600" : ""
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* PDF Upload - Compact & Styled */}
          <div
            className={`relative border-2 border-dashed rounded-lg transition-all h-[50px] flex items-center
              ${
                dragActive
                  ? "border-red-500 bg-red-500/10"
                  : "border-gray-600 hover:border-red-500"
              }
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
              id="pdf-upload"
              aria-label="Upload PDF file"
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
                  <span>Upload PDF</span>
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
                <ReactMarkdown
                  className="text-white prose prose-invert prose-sm max-w-none"
                  components={{
                    p: ({ ...props }) => <p className="mb-2" {...props} />,
                    ul: ({ ...props }) => (
                      <ul className="list-disc ml-4 mb-2" {...props} />
                    ),
                    ol: ({ ...props }) => (
                      <ol className="list-decimal ml-4 mb-2" {...props} />
                    ),
                    li: ({ children, ...props }) => (
                      <li className="mb-1" {...props}>
                        {children}
                      </li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-bold">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic">{children}</em>
                    ),
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
              placeholder={
                isPdfUploaded
                  ? "Ask about your PDF..."
                  : "Ask a question or paste your text here..."
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
              disabled={isLoading || !selectedRole || !input.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>

        {/* Export Buttons - Moved under chat */}
        {messages.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => exportToPdf(messages, `${fileState?.name || 'Chat'}-Analysis`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg shadow flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              Export PDF
            </Button>
            <Button
              onClick={() => exportToTxt(messages, `${fileState?.name || 'Chat'}-Analysis`)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 rounded-lg shadow flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              Export TXT
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
