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
        title: "Marketing Report",
        content: "Please provide your comprehensive marketing report to ensure campaign alignment."
      },
      {
        id: 2,
        title: "Campaign Details",
        content: "Add any information relevant to: your landing page, your ads, your campaign offer."
      }
    ]
  },
  {
    number: 2,
    title: "Soap Opera Sequence",
    description: "5-day email sequence",
    prompts: [
      {
        id: 1,
        title: "Email Sequence",
        content: `Write a 5 day email sequence inspired by Russell Brunson's follow up "soap opera sequence".

Email one sets the stage and has the hook as the subject line then the story as the body.

Email two has the hook as the subject line, the story as the body, the CTA as the offer. Followed by the website.

Email 3 shares the epiphany you had regarding your core product. The hook is the subject line, the story is the body, there is a CTA then a website to go to.

Email 4 is the hook (subject line). The story is the body. The offer is the CTA followed by the website.

Email 5 adds urgency and scarcity with a strong CTA. It follows the format of the hook being the subject line, the story being the body, the offer being the call to action followed by the website.`
      }
    ]
  },
  {
    number: 3,
    title: "Pre-Call Nurture",
    description: "Prepare booked clients",
    prompts: [
      {
        id: 1,
        title: "Pre-Call Sequence",
        content: "Write a pre-call nurture sequence to educate and prepare clients who booked a call, as well as an engaging text reminder campaign."
      }
    ]
  },
  {
    number: 4,
    title: "No-Book Recovery",
    description: "Re-engage prospects",
    prompts: [
      {
        id: 1,
        title: "Recovery Sequence",
        content: "Write a nurture sequence for email, VM drop, and text message if they did not book a call to try to recapture them on the benefits for them to book a call."
      }
    ]
  },
  {
    number: 5,
    title: "Long-Term Nurture",
    description: "Keep prospects warm",
    prompts: [
      {
        id: 1,
        title: "30-Day Sequence",
        content: "If they didn't convert, write a 30 day nurture sequence to keep them warm."
      }
    ]
  }
];

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
              isCompleted && "bg-red-800 hover:bg-red-900",
              !isCompleted && isAvailable && "bg-red-600 hover:bg-red-700",
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

export default function CustomNurture() {
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
    const savedProjects = localStorage.getItem("customNurtureProjects");
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("customNurtureProjects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [projects, activeProject]);

  const getCurrentProject = () => {
    return projects.find((p) => p.id === activeProject);
  };

  const createNewProject = () => {
    if (!newProjectName.trim()) return;

    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName,
      messages: [
        {
          role: "assistant",
          content: "Welcome! Let's start with your Custom Nurture Campaign. Please provide your marketing report to ensure campaign alignment.",
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

  const deleteProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
    if (activeProject === id) {
      setActiveProject(null);
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
          currentPromptId: 1,
          completedPrompts: [],
          messages: [...p.messages, {
            role: "assistant",
            content: `Moving to ${STEPS[nextStep - 1].title}. ${STEPS[nextStep - 1].description}`,
          }]
        };
      }
      return p;
    }));
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeProject || isLoading) return;

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

    const userMessage: Message = { role: "user", content: input };
    
    setProjects(prev => prev.map(p => {
      if (p.id === activeProject) {
        return {
          ...p,
          messages: [...p.messages, userMessage]
        };
      }
      return p;
    }));
    
    setInput("");
    setSelectedPrompt(null);

    try {
      const response = await fetch("/api/new-campaign/custom-nurture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...getCurrentProject()!.messages, userMessage],
          step: currentProject.currentStep,
          currentPromptId: currentProject.currentPromptId,
          projectContext: currentProject.name,
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

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(5));
              if (data.content) {
                accumulatedContent += data.content;
                setProjects(prev => prev.map(p => {
                  if (p.id === activeProject) {
                    return {
                      ...p,
                      messages: p.messages.map(m => 
                        m.id === tempMessage.id ? { ...m, content: accumulatedContent } : m
                      )
                    };
                  }
                  return p;
                }));
              }
            } catch (e) {
              console.error("Error parsing chunk:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
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

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className={cn(
        "bg-gray-800 transition-all duration-300 border-r border-gray-700",
        isSidebarOpen ? "w-64" : "w-16"
      )}>
        <div className="p-4">
          {isSidebarOpen && (
            <h1 className="text-2xl font-bold text-white mb-6">Custom Nurture</h1>
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
            {isSidebarOpen ? (
              projects.map(project => (
                <div key={project.id} className="flex items-center justify-between">
                  <button
                    onClick={() => setActiveProject(project.id)}
                    className={cn(
                      "text-left truncate flex-1 py-2 px-3 rounded",
                      activeProject === project.id
                        ? "bg-red-700 text-white"
                        : "text-gray-300 hover:bg-gray-700"
                    )}
                  >
                    <FiFolder className="inline mr-2" />
                    {project.name}
                  </button>
                  <Button
                    onClick={() => deleteProject(project.id)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-red-500"
                  >
                    <FiX />
                  </Button>
                </div>
              ))
            ) : (
              projects.map(project => (
                <Button
                  key={project.id}
                  onClick={() => setActiveProject(project.id)}
                  variant="ghost"
                  className={cn(
                    "w-full",
                    activeProject === project.id
                      ? "bg-red-700 text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  )}
                >
                  <FiFolder />
                </Button>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 overflow-hidden flex flex-col">
        {/* Progress Bar */}
        {activeProject && (
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              {STEPS.map(step => (
                <div
                  key={step.number}
                  className={cn(
                    "flex flex-col items-center w-1/5 relative",
                    getCurrentProject()?.currentStep === step.number
                      ? "text-red-500"
                      : (getCurrentProject()?.currentStep ?? 0) > step.number
                      ? "text-green-500"
                      : "text-gray-500"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center mb-2",
                      getCurrentProject()?.currentStep === step.number
                        ? "bg-red-500 text-white"
                        : (getCurrentProject()?.currentStep ?? 0) > step.number
                        ? "bg-green-500 text-white"
                        : "bg-gray-700 text-gray-300"
                    )}
                  >
                    {step.number}
                  </div>
                  {isSidebarOpen && (
                    <div className="text-xs text-center">
                      <div className="font-medium">{step.title}</div>
                      <div className="text-gray-400">{step.description}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="h-1 bg-gray-700 w-full rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{
                  width: `${
                    ((getCurrentProject()?.currentStep || 1) / STEPS.length) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        )}

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
