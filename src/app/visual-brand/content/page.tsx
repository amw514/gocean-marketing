"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  FiPlus,
  FiDownload,
  FiChevronRight,
  FiChevronLeft,
  FiFolder,
  FiX,
  FiCopy,
} from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { exportToPdf, exportToTxt } from "@/lib/export";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  id?: number;
}

interface Project {
  id: string;
  name: string;
  messages: Message[];
  report: string;
}

export default function Content() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [projects, activeProject]);

  const createNewProject = () => {
    if (!newProjectName.trim()) return;

    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName,
      messages: [
        {
          role: "assistant",
          content: "Welcome! Please paste your visual brand identity report to get started.",
        },
      ],
      report: "",
    };

    setProjects((prev) => [...prev, newProject]);
    setActiveProject(newProject.id);
    setNewProjectName("");
    setShowNewProjectInput(false);
  };

  const getCurrentProject = () => {
    return projects.find((p) => p.id === activeProject);
  };

  const handlePromptGeneration = () => {
    const currentProject = getCurrentProject();
    if (!currentProject?.report) {
      setInput("Please provide the brand identity report first.");
      return;
    }
    
    setInput(
      "Based on the above information. Create a detailed prompt that is below 6,000 characters. Make the prompt as short/concise while parsing out the most important details in the imagery. The goal is to make marketing images for a campaign focused on: "
    );
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const currentProject = getCurrentProject();
    if (!currentProject) return;

    // If this is the first message (report submission)
    if (!currentProject.report) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProject
            ? { ...p, report: input }
            : p
        )
      );
    }

    const newMessage = { role: "user" as const, content: input };
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === activeProject) {
          return {
            ...p,
            messages: [...p.messages, newMessage],
          };
        }
        return p;
      })
    );
    setInput("");

    try {
      const response = await fetch("/api/visual-brand/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...getCurrentProject()?.messages || [], newMessage],
          report: currentProject.report,
          projectContext: currentProject.name,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      // Create a temporary message for streaming
      const tempMessage = {
        role: "assistant" as const,
        content: "",
        id: Date.now(),
      };
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === activeProject) {
            return {
              ...p,
              messages: [...p.messages, tempMessage],
            };
          }
          return p;
        })
      );

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(5));
              if (data.content) {
                accumulatedContent += data.content;
                setProjects((prev) =>
                  prev.map((p) => {
                    if (p.id === activeProject) {
                      return {
                        ...p,
                        messages: p.messages.map((m) =>
                          m.id === tempMessage.id
                            ? { ...m, content: accumulatedContent }
                            : m
                        ),
                      };
                    }
                    return p;
                  })
                );
              }
            } catch (e) {
              console.error("Error parsing chunk:", e);
            }
          }
        }
      }

    } catch (error) {
      console.error("Error:", error);
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === activeProject) {
            return {
              ...p,
              messages: [
                ...p.messages,
                {
                  role: "assistant",
                  content: "I apologize, but I encountered an error. Please try again.",
                },
              ],
            };
          }
          return p;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (activeProject === projectId) {
      setActiveProject(null);
    }
  };

  const sendToDiscord = (content: string) => {
    // Discord channel URL with /imagine command
    const discordUrl = `https://discord.com/channels/1231401244371980359/1345692532788695170`;
    window.open(discordUrl, '_blank');
    
    // Copy /imagine command to clipboard for easy pasting
    navigator.clipboard.writeText(`${content}`);
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div
        className={cn(
          "bg-gray-800 transition-all duration-300 border-r border-gray-700",
          isSidebarOpen ? "w-64" : "w-16"
        )}
      >
        <div className="p-4">
          {isSidebarOpen && (
            <h1 className="text-2xl font-bold text-white mb-6">
              Visual Content Generator
            </h1>
          )}
          <Button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full mb-4 bg-gray-700 hover:bg-gray-600"
          >
            {isSidebarOpen ? <FiChevronLeft /> : <FiChevronRight />}
          </Button>

          {isSidebarOpen && (
            <Button
              onClick={() => setShowNewProjectInput(true)}
              className="w-full mb-4 bg-red-600 hover:bg-red-700"
            >
              <FiPlus className="mr-2" /> New Project
            </Button>
          )}

          {showNewProjectInput && isSidebarOpen && (
            <div className="mb-4 flex gap-2">
              <Input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project name..."
                className="bg-gray-700 border-gray-600"
                onKeyDown={(e) => {
                  if (e.key === "Enter") createNewProject();
                }}
              />
              <Button
                onClick={createNewProject}
                className="bg-green-600 hover:bg-green-700"
              >
                <FiPlus />
              </Button>
            </div>
          )}

          <div className="space-y-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className={cn(
                  "flex items-center justify-between p-2 rounded cursor-pointer",
                  activeProject === project.id
                    ? "bg-red-600"
                    : "hover:bg-gray-700"
                )}
                onClick={() => setActiveProject(project.id)}
              >
                <div className="flex items-center">
                  <FiFolder className="mr-2" />
                  {isSidebarOpen && project.name}
                </div>
                {isSidebarOpen && activeProject === project.id && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(project.id);
                    }}
                  >
                    <FiX />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        {activeProject ? (
          <>
            {/* Chat Interface */}
            <div className="bg-gray-800 rounded-lg p-4 h-[650px] flex flex-col border border-gray-700">
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 mb-4">
                {getCurrentProject()?.messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-3 rounded-lg relative group",
                      message.role === "user"
                        ? "bg-red-600 ml-auto"
                        : "bg-gray-700",
                      "max-w-[80%]"
                    )}
                  >
                    <ReactMarkdown className="text-white prose prose-invert prose-sm max-w-none">
                      {message.content}
                    </ReactMarkdown>
                    {message.role === "assistant" && (
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigator.clipboard.writeText(message.content)}
                          className="hover:text-gray-300"
                          title="Copy to clipboard"
                        >
                          <FiCopy className="text-white" />
                        </button>
                        <button
                          onClick={() => sendToDiscord(message.content)}
                          className="hover:text-gray-300"
                          title="Send to Discord"
                        >
                          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Prompt Suggestions and Input */}
              <div className="space-y-4">
                {getCurrentProject()?.report && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handlePromptGeneration}
                      className="px-3 py-2 rounded-full text-sm text-white bg-green-600 hover:bg-green-700 transition-colors"
                    >
                      Generate Marketing Prompt
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      getCurrentProject()?.report
                        ? "Type your campaign focus..."
                        : "Paste your visual brand identity report..."
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
                    Send
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex justify-between">
              <div className="flex gap-4">
                <Button
                  onClick={() =>
                    exportToPdf(
                      getCurrentProject()?.messages || [],
                      getCurrentProject()?.name || "Project"
                    )
                  }
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <FiDownload className="mr-2" /> Export PDF
                </Button>
                <Button
                  onClick={() =>
                    exportToTxt(
                      getCurrentProject()?.messages || [],
                      getCurrentProject()?.name || "Project"
                    )
                  }
                  className="bg-green-600 hover:bg-green-700"
                >
                  <FiDownload className="mr-2" /> Export TXT
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-xl">Select or create a project to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
