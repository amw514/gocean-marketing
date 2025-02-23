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
    title: "Market Research",
    description: "Analyze market trends, competitors and opportunities",
    prompts: [
      {
        id: 1,
        title: "Uncovering Current Trends",
        content: "I'm creating a business/service/offering/online course for [your niche]. What are the current trends for this niche, particularly high-interest trends that can be solved with a step-by-step course, service, or business offering?"
      },
      {
        id: 2,
        title: "Uncovering Current Opportunities",
        content: "Based on the trends identified above, where do you see the best opportunity for a new online course, service offering, or business opportunity in the market? Consider the popularity of the trend and the ability for a course to monetize effectively."
      },
      {
        id: 3,
        title: "Total Addressable Market (TAM) & Segmentation",
        content: "Create a chart and make sure it has reputable sources. List segmentations and their total addressable market globally. Then calculate the total addressable market within the US only for each segmentation."
      },
      {
        id: 4,
        title: "Pain Points",
        content: "What are the pain points of this market, and why? Which pain points are most pressing for customers?"
      },
      {
        id: 5,
        title: "Spending Habits",
        content: "Which of the top total addressable markets or segmentations has the most disposable income to spend and the highest pain points?"
      },
      {
        id: 6,
        title: "Reach",
        content: "Name the top segmentations that would be the easiest to reach. List the top 3 channels and strategies where these audiences exist. Provide actual numbers and reputable sources for your answer."
      },
      {
        id: 7,
        title: "Competitor Research",
        content: "What are three competing products, services, or courses in [your chosen opportunity]? Provide the pros and cons of each."
      },
      {
        id: 8,
        title: "SWOT Analysis",
        content: "Create a SWOT analysis for the competitors identified above. How can I position my brand as the top choice in this niche?"
      },
      {
        id: 9,
        title: "Differentiation",
        content: "Identify potential differentiating factors that make my product/service stand out drastically from the competition."
      }
    ]
  },
  {
    number: 2,
    title: "Niche Development",
    description: "Define and validate your specific market position",
    prompts: [
      {
        id: 1,
        title: "Core Niche Identification",
        content: "What is the core niche of this business, and how does it address fundamental human needs (e.g., health, wealth, relationships)?"
      },
      {
        id: 2,
        title: "Niche Equation",
        content: "Break down the niche using the niche equation: demographics, problems, methodology, and desired outcomes."
      },
      {
        id: 3,
        title: "Niche Evaluation",
        content: "Evaluate the niche using the Rule of Four: abundance in numbers, ease of reach, willingness to pay, and growing market. Quote and cite reputable sources on this data."
      },
      {
        id: 4,
        title: "Hidden Needs and Desires",
        content: "What hidden problems and desires does my ideal customer have? Dive deep into their challenges, pain points, frustrations, and objections."
      },
      {
        id: 5,
        title: "Engagement and Platforms",
        content: "How does this audience typically engage with similar products or services, and what platforms are most effective for reaching them?"
      }
    ]
  },
  {
    number: 3,
    title: "Avatar Research",
    description: "Create detailed ideal customer profiles and personas",
    prompts: [ {
      id: 6,
      title: "Audience Overview",
      content: "Who are the individuals most interested in [your niche]? What challenges do they face, and what are their ultimate goals? What hobbies, passions, or interests intersect with this niche?"
    },
    {
      id: 7,
      title: "Audience Queries and Gaps",
      content: "What questions or misconceptions does my audience have about this niche? What knowledge gaps need to be addressed for them to succeed?"
    },
    {
      id: 8,
      title: "Ideal Profiles",
      content: "Create three detailed profiles of ideal customers who are willing to invest in high-ticket courses. For each profile, describe their background, goals, challenges, and why they need my program."
    },
    {
      id: 9,
      title: "Demographic and Psychographic Table",
      content: "Combine the demographic, psychographic, and behavioral patterns of the three profiles into a detailed column table, including values, hobbies, fears, joys, their dislikes, their fears, their objections, and behaviors."
    },
    {
      id: 10,
      title: "Success and Challenges",
      content: "For each profile, describe the 3 types of people who would succeed with the program/benefitting from the service or business offering and the type who would not. Present the findings in a two-column table."
    },
    {
      id: 11,
      title: "Detailed Avatar",
      content: "Let's create a detailed avatar for my ideal customer/student. Based on all 3 avatar profiles above, list the following demographics: age, where they live, gender, income level, marital status, children or no, occupation, upcoming life events, employment status, employment field, and any other relevant details you may find important."
    },
    {
      id: 12,
      title: "Comprehensive Summary",
      content: "Combine all of the above information into a detailed and informative columned table that will help me make better marketing, business, and sales decisions."
    }]
  },
  {
    number: 4,
    title: "Offer Creation",
    description: "Design compelling products or services for your audience",
    prompts: []
  },
  {
    number: 5,
    title: "Execution & Growth",
    description: "Launch, monitor and scale your business strategy",
    prompts: []
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
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        setProjects(prev => prev.map(p => {
          if (p.id === activeProject) {
            return {
              ...p,
              messages: [
                ...p.messages,
                {
                  role: "assistant",
                  content: "I apologize, but I encountered an error. Please try again with a shorter message or break your request into smaller parts."
                }
              ]
            };
          }
          return p;
        }));
        return;
      }

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
      setProjects(prev => prev.map(p => {
        if (p.id === activeProject) {
          return {
            ...p,
            messages: [
              ...p.messages,
              {
                role: "assistant",
                content: "The request timed out. Please try again with a shorter message or break your request into smaller parts."
              }
            ]
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

  function PromptSuggestions({ prompts, onSelect }: { prompts: Prompt[], onSelect: (prompt: Prompt) => void }) {
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {prompts.map((prompt) => (
          <button
            key={prompt.id}
            onClick={() => onSelect(prompt)}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-full text-sm text-white transition-colors"
          >
            {prompt.title}
          </button>
        ))}
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
            <h1 className="text-2xl font-bold text-white mb-6">Full Service</h1>
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
                        "flex flex-col items-center w-1/5 relative",
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
                {isLoading && (
                  <div className="bg-gray-700 p-3 rounded-lg max-w-[80%]">
                    <p className="text-white">Processing...</p>
                  </div>
                )}
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
