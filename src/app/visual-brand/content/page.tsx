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
                      "p-3 rounded-lg",
                      message.role === "user"
                        ? "bg-red-600 ml-auto"
                        : "bg-gray-700",
                      "max-w-[80%]"
                    )}
                  >
                    <ReactMarkdown className="text-white prose prose-invert prose-sm max-w-none">
                      {message.content}
                    </ReactMarkdown>
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
