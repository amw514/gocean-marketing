"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FiPlus, FiDownload, FiChevronRight, FiChevronLeft, FiFolder, FiX } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { exportToPdf, exportToTxt } from "@/lib/export";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";

interface Project {
  id: string;
  name: string;
  messages: Message[];
  currentStep: number;
  currentPromptId: number;
  completedPrompts: number[];
}

interface Prompt {
  id: number;
  title: string;
  content: string;
}

interface Step {
  number: number;
  title: string;
  description: string;
  prompts: Prompt[];
}

const STEPS: Step[] = [
  {
    number: 1,
    title: "Campaign Seeding",
    description: "Define campaign fundamentals",
    prompts: [
      {
        id: 1,
        title: "Brand Report",
        content: "Please provide your Full Brand Report to ensure campaign alignment with your brand identity."
      },
      {
        id: 2,
        title: "Campaign Offer",
        content: "What is your specific offer for this campaign? Detail your primary offer or incentive (e.g., exclusive package, discounts, unique features)."
      },
      {
        id: 3,
        title: "Target Demographic",
        content: "Who is your exact target demographic for this campaign? Please be specific (e.g., women aged 25-45, newlyweds, individuals celebrating milestones)."
      },
      {
        id: 4,
        title: "Campaign Purpose",
        content: "What is the specific goal of this campaign? (e.g., increase bookings, promote a seasonal offer, brand awareness)"
      }
    ]
  },
  {
    number: 2,
    title: "Headlines Creation",
    description: "Craft compelling ad headlines",
    prompts: [
      {
        id: 1,
        title: "Generate Headlines",
        content: "Let's create 15 Google Ads headlines (up to 50 characters each). Focus on incorporating high-performing keywords, highlighting USPs, and adding urgency."
      }
    ]
  },
  {
    number: 3,
    title: "Ad Descriptions",
    description: "Create engaging ad descriptions",
    prompts: [
      {
        id: 1,
        title: "Generate Descriptions",
        content: "Let's create 5 Google Ads descriptions (up to 90 characters each). Focus on benefits, emotional appeal, and specific features like professional editing or quick turnaround."
      }
    ]
  },
  {
    number: 4,
    title: "Callout Extensions",
    description: "Add compelling callout extensions",
    prompts: [
      {
        id: 1,
        title: "Generate Extensions",
        content: "Let's create 10 Google Ads callout extensions. Focus on tangible benefits and features that address client concerns."
      }
    ]
  },
  {
    number: 5,
    title: "Negative Keywords",
    description: "Define campaign exclusions",
    prompts: [
      {
        id: 1,
        title: "Generate Keywords",
        content: "Let's create a minimum of 60 negative Google Ads keywords to ensure your ads avoid irrelevant, inappropriate, or non-targeting services."
      }
    ]
  },
  {
    number: 6,
    title: "Landing Page Wireframe",
    description: "Design conversion-focused layout",
    prompts: [
      {
        id: 1,
        title: "Generate Wireframe",
        content: "Based on the campaign details, let's create a refined wireframe summary for the landing page."
      }
    ]
  },
  {
    number: 7,
    title: "Landing Page Draft",
    description: "Create complete landing page content",
    prompts: [
      {
        id: 1,
        title: "Full Page Draft",
        content: "Let's create a comprehensive landing page draft optimized for Google Ads conversion, including all sections from hero to footer."
      }
    ]
  }
];

export default function GoogleAds() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
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
          content: "Welcome! Let's start with your Google Ads campaign. Please provide your Full Brand Report to ensure campaign alignment.",
          step: 1
        }
      ],
      currentStep: 1,
      currentPromptId: 1,
      completedPrompts: []
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
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const currentProject = getCurrentProject();
    if (!currentProject) return;

    if (selectedPrompt) {
      setProjects(prev => prev.map(p => {
        if (p.id === activeProject) {
          return {
            ...p,
            completedPrompts: [...p.completedPrompts, selectedPrompt.id]
          };
        }
        return p;
      }));
    }

    const newMessage = { role: "user" as const, content: input };
    setProjects(prev => prev.map(p => {
      if (p.id === activeProject) {
        return {
          ...p,
          messages: [...p.messages, newMessage]
        };
      }
      return p;
    }));
    setInput("");

    try {
      const response = await fetch("/api/new-campaign/google-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...getCurrentProject()?.messages || [], newMessage],
          step: currentProject.currentStep,
          currentPromptId: currentProject.currentPromptId,
          projectContext: currentProject.name
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const tempMessage = { role: "assistant" as const, content: "", id: Date.now() };
      setProjects(prev => prev.map(p => {
        if (p.id === activeProject) {
          return {
            ...p,
            messages: [...p.messages, tempMessage]
          };
        }
        return p;
      }));

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(5));
              if (data.content) {
                accumulatedContent += data.content;
                setProjects(prev => prev.map(p => {
                  if (p.id === activeProject) {
                    return {
                      ...p,
                      messages: p.messages.map(m => 
                        m.id === tempMessage.id 
                          ? { ...m, content: accumulatedContent }
                          : m
                      )
                    };
                  }
                  return p;
                }));
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }

    } catch (error) {
      console.error("Error:", error);
      setProjects(prev => prev.map(p => {
        if (p.id === activeProject) {
          return {
            ...p,
            messages: [...p.messages, {
              role: "assistant",
              content: "I apologize, but I encountered an error. Please try again."
            }]
          };
        }
        return p;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const moveToNextStep = () => {
    const currentProject = getCurrentProject();
    if (!currentProject || currentProject.currentStep >= 7) return;

    setProjects(prev => prev.map(p => {
      if (p.id === activeProject) {
        const nextStep = p.currentStep + 1;
        return {
          ...p,
          currentStep: nextStep,
          currentPromptId: 1,
          completedPrompts: [],
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

  function PromptSuggestions({ prompts, onSelect, completedPrompts }: { 
    prompts: Prompt[], 
    onSelect: (prompt: Prompt) => void,
    completedPrompts: number[]
  }) {
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {prompts.map((prompt) => {
          const isCompleted = completedPrompts.includes(prompt.id);
          const isAvailable = prompt.id <= Math.min(...prompts.map(p => p.id).filter(id => !completedPrompts.includes(id)));
          
          return (
            <button
              key={prompt.id}
              onClick={() => isAvailable && onSelect(prompt)}
              disabled={!isAvailable}
              className={cn(
                "px-3 py-2 rounded-full text-sm text-white transition-colors",
                isCompleted && "bg-green-800 hover:bg-green-900",
                !isCompleted && isAvailable && "bg-green-500 hover:bg-green-700",
                !isCompleted && !isAvailable && "bg-gray-700 opacity-50 cursor-not-allowed"
              )}
            >
              {prompt.title}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className={cn(
        "bg-gray-800 transition-all duration-300 border-r border-gray-700",
        isSidebarOpen ? "w-64" : "w-16"
      )}>
        <div className="p-4">
          {isSidebarOpen && (
            <h1 className="text-2xl font-bold text-white mb-6">Google Ads Campaign</h1>
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
        {activeProject ? (
          <>
            {/* Steps Progress */}
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                {STEPS.map((step) => {
                  const currentProject = getCurrentProject();
                  return (
                    <div
                      key={step.number}
                      className={cn(
                        "flex flex-col items-center w-1/7 relative",
                        (currentProject?.currentStep || 0) === step.number
                          ? "text-red-400"
                          : (currentProject?.currentStep || 0) > step.number
                          ? "text-green-400"
                          : "text-gray-400"
                      )}
                    >
                      <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center mb-1 text-sm">
                        {step.number}
                      </div>
                      <div className="text-center text-xs">
                        <div className="font-semibold">{step.title}</div>
                        <div className="opacity-75 text-[10px]">{step.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chat Interface */}
            <div className="bg-gray-800 rounded-lg p-4 h-[650px] flex flex-col border border-gray-700">
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
              </div>

              {(() => {
                const currentProject = getCurrentProject();
                return currentProject && (
                  <PromptSuggestions
                    prompts={STEPS[(currentProject.currentStep || 1) - 1]?.prompts || []}
                    onSelect={(prompt) => {
                      setSelectedPrompt(prompt);
                      setInput(prompt.content);
                    }}
                    completedPrompts={currentProject.completedPrompts}
                  />
                );
              })()}

              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={selectedPrompt ? "Customize the prompt..." : "Type your message..."}
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
                disabled={getCurrentProject()?.currentStep === 7}
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
