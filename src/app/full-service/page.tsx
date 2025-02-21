"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FiPlus, FiDownload, FiChevronRight, FiChevronLeft, FiFolder, FiX } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { exportToPdf, exportToTxt } from '@/lib/export';
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  step?: number;
}

interface Project {
  id: string;
  name: string;
  messages: Message[];
  currentStep: number;
  currentPromptId: number;
}

const STEPS = [
  {
    number: 1,
    title: "Market Research",
    description: "Analyze market trends, competitors and opportunities"
  },
  {
    number: 2,
    title: "Niche Development",
    description: "Define and validate your specific market position"
  },
  {
    number: 3,
    title: "Avatar Research",
    description: "Create detailed ideal customer profiles and personas"
  },
  {
    number: 4,
    title: "Offer Creation",
    description: "Design compelling products or services for your audience"
  },
  {
    number: 5,
    title: "Execution & Growth",
    description: "Launch, monitor and scale your business strategy"
  }
];

export default function FullService() {
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
          content: "Welcome! Let's start with Market Research. What niche are you interested in exploring?",
          step: 1
        }
      ],
      currentStep: 1,
      currentPromptId: 1
    };

    setProjects(prev => [...prev, newProject]);
    setActiveProject(newProject.id);
    setNewProjectName("");
    setShowNewProjectInput(false);
  };

  const getCurrentProject = () => {
    return projects.find(p => p.id === activeProject);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !activeProject) return;

    const currentProject = getCurrentProject();
    if (!currentProject) return;

    setIsLoading(true);
    const newUserMessage: Message = { 
      role: "user", 
      content: input,
      step: currentProject.currentStep 
    };

    // Update project messages
    setProjects(prev => prev.map(p => {
      if (p.id === activeProject) {
        return {
          ...p,
          messages: [...p.messages, newUserMessage]
        };
      }
      return p;
    }));

    setInput("");

    try {
      const response = await fetch("/api/full-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...currentProject.messages, newUserMessage],
          step: currentProject.currentStep,
          currentPromptId: currentProject.currentPromptId,
          projectContext: currentProject.name
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      if (data.isStepComplete) {
        moveToNextStep();
      } else {
        setProjects(prev => prev.map(p => {
          if (p.id === activeProject) {
            return {
              ...p,
              messages: [...p.messages, { 
                role: "assistant", 
                content: data.message,
                step: p.currentStep 
              }],
              currentPromptId: data.nextPromptId
            };
          }
          return p;
        }));
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const moveToNextStep = () => {
    const currentProject = getCurrentProject();
    if (!currentProject || currentProject.currentStep >= 5) return;

    setProjects(prev => prev.map(p => {
      if (p.id === activeProject) {
        const nextStep = p.currentStep + 1;
        return {
          ...p,
          currentStep: nextStep,
          messages: [...p.messages, {
            role: "assistant",
            content: `Moving to ${STEPS[nextStep - 1].title}. ${STEPS[nextStep - 1].description}`,
            step: nextStep
          }]
        };
      }
      return p;
    }));
  };

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (activeProject === projectId) {
      setActiveProject(null);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className={cn(
        "bg-gray-800 transition-all duration-300 border-r border-gray-700",
        isSidebarOpen ? "w-64" : "w-16"
      )}>
        <div className="p-4">
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
              <Button onClick={createNewProject} className="bg-green-600 hover:bg-green-700">
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
                  activeProject === project.id ? "bg-red-600" : "hover:bg-gray-700"
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
        <h1 className="text-3xl font-bold text-white mb-6">Full Service</h1>

        {activeProject ? (
          <>
            {/* Steps Progress */}
            <div className="mb-6">
              <div className="flex justify-between mb-4">
                {STEPS.map((step) => {
                  const currentProject = getCurrentProject();
                  return (
                    <div
                      key={step.number}
                      className={cn(
                        "flex flex-col items-center w-1/5 relative",
                        (currentProject?.currentStep || 0) === step.number
                          ? "text-red-400"
                          : (currentProject?.currentStep || 0) > step.number
                          ? "text-green-400"
                          : "text-gray-400"
                      )}
                    >
                      <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center mb-2">
                        {step.number}
                      </div>
                      <div className="text-center text-sm">
                        <div className="font-semibold">{step.title}</div>
                        <div className="text-xs opacity-75">{step.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chat Interface */}
            <div className="bg-gray-800 rounded-lg p-4 h-[500px] flex flex-col border border-gray-700">
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 mb-4">
                {getCurrentProject()?.messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-3 rounded-lg",
                      message.role === "user" ? "bg-red-600 ml-auto" : "bg-gray-700",
                      "max-w-[80%]"
                    )}
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
                  placeholder="Type your message..."
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

            {/* Action Buttons */}
            <div className="mt-4 flex justify-between">
              <div className="flex gap-4">
                <Button
                  onClick={() => exportToPdf(getCurrentProject()?.messages || [], getCurrentProject()?.name || 'Project')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <FiDownload className="mr-2" /> Export PDF
                </Button>
                <Button
                  onClick={() => exportToTxt(getCurrentProject()?.messages || [], getCurrentProject()?.name || 'Project')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <FiDownload className="mr-2" /> Export TXT
                </Button>
              </div>
              <Button
                onClick={moveToNextStep}
                disabled={getCurrentProject()?.currentStep === 5}
                className="bg-red-600 hover:bg-red-700"
              >
                Next Step
              </Button>
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
