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
  report?: string;
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
    description: "Define brand fundamentals",
    prompts: [
      {
        id: 1,
        title: "Brand Report",
        content: "Please provide your Full Brand Report to ensure campaign alignment with your brand identity."
      }
    ]
  },
  {
    number: 2,
    title: "Campaign Details",
    description: "Define campaign specifics",
    prompts: [
      {
        id: 1,
        title: "Campaign Information",
        content: "Please put in as many details about this specific campaign as possible (demographic, psychographic, name of campaign, what it does, who it is for, what are their pain points):"
      },
      {
        id: 2,
        title: "Territory Boundaries",
        content: "If there are territory boundaries to your location please list them now:"
      },
      {
        id: 3,
        title: "Location Targeting",
        content: "Based on your territory boundaries, let's identify location names, organizations, and facilities where your ideal client would be at so that we can target them more effectively for meta ads."
      },
      {
        id: 4,
        title: "Audience Targeting",
        content: "Based on your specific campaign, let's create a list of demographics, interests, and behaviors that you can target for your business within this specific campaign. We'll ensure the pain points for this audience are high."
      }
    ]
  },
  {
    number: 3,
    title: "Campaign Objective",
    description: "Choose your primary goal",
    prompts: [
      {
        id: 1,
        title: "Awareness",
        content: "Show your ads to people who are most likely to remember them.\n\nGood for:\n- Reach\n- Brand awareness\n- Video views\n- Store location awareness"
      },
      {
        id: 2,
        title: "Traffic",
        content: "Send people to a destination, like your website, app, Instagram profile or Facebook event.\n\nGood for:\n- Link clicks\n- Landing page views\n- Instagram profile visits\n- Messenger, Instagram and WhatsApp\n- Calls"
      },
      {
        id: 3,
        title: "Engagement",
        content: "Get more messages, purchases through messaging, video views, post engagement, Page likes or event responses.\n\nGood for:\n- Messenger, Instagram and WhatsApp\n- Video views\n- Post engagement\n- Conversions\n- Calls"
      },
      {
        id: 4,
        title: "Leads",
        content: "Collect leads for your business or brand.\n\nGood for:\n- Instant forms\n- Messenger, Instagram and WhatsApp\n- Conversions\n- Calls"
      },
      {
        id: 5,
        title: "App Promotion",
        content: "Find new people to install your app and continue using it.\n\nGood for:\n- App installs\n- App events"
      },
      {
        id: 6,
        title: "Sales",
        content: "Find people likely to purchase your product or service.\n\nGood for:\n- Conversions\n- Catalog sales\n- Messenger, Instagram and WhatsApp\n- Calls"
      }
    ]
  },
  {
    number: 4,
    title: "Ad Copywriting",
    description: "Create compelling ad copy",
    prompts: [
      {
        id: 1,
        title: "Primary Text",
        content: `Write 5 different high converting meta Primary Text Variations. Alternate between long and short form copy. Keep copy direct, emotional, and focused on benefits. Use urgency & scarcity in at least one ad variation. You can only write 125 characters max. Write it like you are sitting next to a friend in an informal tone. Use minimal emoji's. Use the following as a template:

1️⃣ "Tired of [pain point]? [Product/service] makes it easy to [achieve goal]. Get started today – click below!"
2️⃣ "'[Customer Quote]' – Ready to get [desired result]? We're offering [limited offer] for a short time. Grab yours now!"
3️⃣ "What if [solution] was easier than you thought? [Product/service] helps you [achieve goal] in just [timeframe]. Try it today!"
4️⃣ "🚨 Last chance! [Offer] ends at midnight. Don't wait – click now to claim your [discount/bonus]!"
5️⃣ "Want to [achieve goal] without the hassle? Download our FREE [guide/demo] now and see how easy it can be!"`
      },
      {
        id: 2,
        title: "Headlines",
        content: `Write 5 different high converting meta ad headline variations. Keep copy direct, emotional, and focused on benefits. Use urgency & scarcity in at least one ad variation. You can only write 40 characters max. Write it like you are sitting next to a friend in informal tone. Use minimal emoji's. Use the following as a template:

1️⃣ "Struggling with [problem]? Fix it!"
2️⃣ "'[Customer Quote]' – See How!"
3️⃣ "Save [X]% Today – Limited Offer!"
4️⃣ "Fast & Easy [Service/Product]!"
5️⃣ "Get [Result] in [Timeframe]!"`
      },
      {
        id: 3,
        title: "Descriptions",
        content: `Write 5 different high converting meta ad description variations according to my specific campaign. Keep copy direct, emotional, and focused on benefits. Use urgency & scarcity in at least one ad variation. You can only write 30 characters max. Write it like you are sitting next to a friend in informal tone. Use minimal emoji's. Use this as a template:

1️⃣ "Download your FREE [guide]!"
2️⃣ "Get started in seconds!"
3️⃣ "Hurry, offer ends soon!"
4️⃣ "Book your free consult now!"
5️⃣ "Try it 100% risk-free!"`
      }
    ]
  },
  {
    number: 5,
    title: "Landing Page Wireframe",
    description: "Design conversion-focused layout",
    prompts: [
      {
        id: 1,
        title: "Landing Page Structure",
        content: `Based on the campaign details and ad copy above, let's create a detailed landing page wireframe. Follow this specific structure:

Section 1: Hero Section
- Enticing Offer
- Target Audience Identification
- Clear Invitation
- Primary Benefit Statement
- Initial CTA

Section 2: Unique Value Proposition
- Special Feature Highlight
- Unique Differentiator
- Secondary CTA

Section 3: Pricing Structure
- Clear Cost Breakdown
- Value Justification
- Payment Options
- Early Bird/Special Offer

Section 4: Package Details
- Comprehensive List of Inclusions
- Key Features
- Embedded CTA Form

Section 5: Urgency & Exclusivity
- Limited Time Offer
- Exclusive Benefits
- Scarcity Elements
- Countdown Timer Placement

Section 6: Authority Building
- About Me/Business Section
- Credentials
- Experience Highlights
- Trust Indicators

Section 7: Benefits Expansion
- Detailed Benefits List
- Pain Points Addressed
- Success Metrics
- Mid-page CTA

Section 8: Offer Deep Dive
- Detailed Offer Explanation
- Use Cases
- Implementation Timeline
- FAQ Section

Section 9: Primary CTA Section
- Strong Call to Action
- Value Reinforcement
- Risk Reversal
- Action Button

Section 10: Comprehensive Overview
- Detailed Paragraph
- Full Package Description
- Support Details
- Guarantee Statement

Section 11: Simple Process
- 3-Step Implementation Plan
- Timeline
- Expected Outcomes
- Quick-action CTA

Section 12: Deliverables Showcase
- Portfolio/Past Work
- Results Gallery
- Deliverables Preview
- Success Stories

Section 13: Social Proof
- Client Reviews
- Testimonials
- Case Studies
- Trust Badges

Section 14: Extended Social Proof
- Additional Success Stories
- Industry Recognition
- Media Mentions
- Final CTA

Please provide specific recommendations for each section based on our campaign details, including:
- Suggested headlines
- Key messaging points
- CTA placements and variations
- Visual element recommendations
- Content structure
- Mobile optimization notes`
      }
    ]
  },
  {
    number: 6,
    title: "Lead Qualification",
    description: "Create qualifying questions",
    prompts: [
      {
        id: 1,
        title: "Form Questions",
        content: "Let's create 3 powerful qualifying questions for a Facebook form submission that will help identify ideal prospects for this campaign."
      }
    ]
  },
  {
    number: 7,
    title: "Messenger Campaign",
    description: "Design conversation flow",
    prompts: [
      {
        id: 1,
        title: "Chat Flow",
        content: `Let's create a Messenger campaign that builds rapport and guides prospects to your CTA. Include:

- Initial greeting and hook
- Key qualifying questions
- Value-building responses
- Natural conversation transitions
- Strategic CTA placement (specify your CTA: "buy now" or "book a call")
- Follow-up handling

Focus on creating a conversational tone while qualifying and educating prospects.`
      }
    ]
  },
  {
    number: 8,
    title: "Survey Experience",
    description: "Create engaging survey flow",
    prompts: [
      {
        id: 1,
        title: "Survey Questions",
        content: `Let's create a 6-8 question survey that both engages and qualifies prospects. The survey should:

- Be fun and interactive
- Qualify prospects effectively
- Educate about your offer
- Build interest and desire
- Lead naturally to your CTA

Please provide:
- Engaging questions
- Multiple choice options
- Logic for question flow
- Educational elements
- Final CTA integration`
      }
    ]
  }
];

export default function MetaAds() {
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
          content: "Welcome! Let's start with your Meta Ads campaign. Please provide your Full Brand Report to ensure campaign alignment.",
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

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (activeProject === projectId) {
      setActiveProject(null);
    }
  };

  const moveToNextStep = () => {
    const currentProject = getCurrentProject();
    if (!currentProject || currentProject.currentStep >= 8) return;

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
      const response = await fetch("/api/new-campaign/meta-ads", {
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
              console.error("Error parsing chunk:", e);
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
      setSelectedPrompt(null);
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
            <h1 className="text-2xl font-bold text-white mb-6">Meta Ads Campaign</h1>
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
                        "flex flex-col items-center w-1/8 relative",
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
                disabled={getCurrentProject()?.currentStep === 8}
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
