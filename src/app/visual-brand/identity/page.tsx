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
  step?: number;
  id?: number;
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
    title: "Brand Aesthetic",
    description: "Define core visual elements and emotions",
    prompts: [
      {
        id: 1,
        title: "Core Emotion",
        content:
          "What is the core emotion or feeling your brand should evoke? Consider: luxurious, edgy, soft, bold, inviting, warm, cool, minimal, maximal, nostalgic, futuristic, aspirational, intimate, powerful, high-end.",
      },
      {
        id: 2,
        title: "Color Palette",
        content:
          "What are your brand's primary colors? Any secondary/accent colors? Should they be muted, pastel, vibrant, rich, or desaturated?",
      },
      {
        id: 3,
        title: "Contrast & Tone",
        content:
          "What level of contrast do you prefer (Low, medium, high)? Do you prefer warm, cool, or neutral undertones?",
      },
    ],
  },
  {
    number: 2,
    title: "Campaign Details",
    description: "Define campaign purpose and context",
    prompts: [
      {
        id: 1,
        title: "Campaign Purpose",
        content:
          "What is the purpose of this specific shoot or visual campaign? (e.g., brand awareness, new product launch, rebranding, seasonal campaign, social media content, website refresh, ad campaign, personal branding, event promotion)",
      },
      {
        id: 2,
        title: "Special Occasions",
        content:
          "Does this campaign tie into a special occasion? (e.g., wedding, anniversary, birthday, engagement, holiday, graduation, maternity, baby shower, corporate event, product release, milestone celebration, editorial spread)",
      },
      {
        id: 3,
        title: "Seasonal Theme",
        content:
          "Is there a seasonal or holiday theme to consider? (Spring, Summer, Fall, Winter, Christmas, Valentine's, Halloween, New Year, etc.)",
      },
      {
        id: 4,
        title: "Key Messages",
        content:
          "Are there any key messages, slogans, or taglines that need to be visually represented?",
      },
      {
        id: 5,
        title: "Usage Context",
        content:
          "Where will these images be used? (Website, social media, print ads, billboards, email marketing, product packaging, online store, PR features)",
      },
    ],
  },
  {
    number: 3,
    title: "Visual Style",
    description: "Define photography and visual approach",
    prompts: [
      {
        id: 1,
        title: "Overall Style",
        content:
          "What overall style best represents this campaign? (e.g., cinematic, documentary, editorial, fine art, high fashion, lifestyle, surreal, futuristic, vintage, grunge, pop art, black & white, hyper-realistic, minimal, boho, moody)",
      },
      {
        id: 2,
        title: "Image Feel",
        content:
          "Should images feel polished and studio-like or raw and natural? Do you prefer a high-saturation, crisp look or a soft, muted aesthetic?",
      },
      {
        id: 3,
        title: "Temporal Style",
        content: "Should images have a modern, timeless, or nostalgic feel?",
      },
    ],
  },
  {
    number: 4,
    title: "Inspiration",
    description: "Reference campaigns and artistic direction",
    prompts: [
      {
        id: 1,
        title: "Brand References",
        content:
          "Any specific past campaigns to reference for inspiration? (e.g., Chanel's soft elegance, Nike's bold and energetic lifestyle, Apple's sleek minimalism, Louis Vuitton's artistic storytelling)",
      },
      {
        id: 2,
        title: "Mood Board",
        content:
          "Please share links or descriptions of images that inspire the desired look and feel for this campaign.",
      },
    ],
  },
  {
    number: 5,
    title: "Business Goals",
    description: "Align visuals with marketing objectives",
    prompts: [
      {
        id: 1,
        title: "Brand Category",
        content:
          "What kind of business/brand is this for? (Luxury, corporate, beauty, fashion, fitness, wellness, photography, real estate, coaching, hospitality, retail, entertainment, lifestyle, tech)",
      },
      {
        id: 2,
        title: "Product Focus",
        content:
          "What product/service are we selling or promoting? (e.g., high-end portraits, digital products, fashion items, personal branding services, wedding photography, online courses)",
      },
      {
        id: 3,
        title: "Brand Values",
        content:
          "What key brand values need to be represented in the imagery? (e.g., empowerment, authenticity, exclusivity, trust, fun, adventure, professionalism, sustainability, innovation)",
      },
      {
        id: 4,
        title: "Target Audience",
        content:
          "Who is the target audience? (e.g., young professionals, luxury clientele, women in business, engaged couples, fitness enthusiasts, high-income earners, new parents, Gen Z creatives)",
      },
    ],
  },
  {
    number: 6,
    title: "Composition & Framing",
    description: "Define photography composition approach",
    prompts: [
      {
        id: 1,
        title: "Focal Length",
        content:
          "What is your preferred focal length or lens style? (Wide-angle, macro, portrait, telephoto, fisheye, soft-focus, tilt-shift, etc.)",
      },
      {
        id: 2,
        title: "Spacing",
        content:
          "How much negative space do you prefer? (Tight, medium, or wide framing?)",
      },
      {
        id: 3,
        title: "Composition Style",
        content:
          "Do you prefer symmetrical compositions, rule of thirds, or dynamic angles?",
      },
      {
        id: 4,
        title: "Movement",
        content:
          "Should images have intentional blurs, movement, or frozen action?",
      },
    ],
  },
  {
    number: 7,
    title: "Lighting & Shadow",
    description: "Define lighting and atmosphere preferences",
    prompts: [
      {
        id: 1,
        title: "Lighting Style",
        content:
          "Should lighting be soft and diffused, moody and dramatic, or bright and even?",
      },
      {
        id: 2,
        title: "Location",
        content: "Indoor or outdoor? (If both, what percentage of each?)",
      },
      {
        id: 3,
        title: "Time of Day",
        content:
          "Preferred time of day for outdoor shoots? (Golden hour, midday, twilight, night-time, artificial studio lighting, etc.)",
      },
      {
        id: 4,
        title: "Shadow Style",
        content:
          "Should shadows be deep and rich, soft and minimal, or high contrast?",
      },
    ],
  },
  {
    number: 8,
    title: "Subject & Models",
    description: "Define model characteristics and expressions",
    prompts: [
      {
        id: 1,
        title: "Demographics",
        content:
          "What age range, gender, and skin tones should the models represent?",
      },
      {
        id: 2,
        title: "Physical Attributes",
        content:
          "Do you want body diversity or specific shapes/sizes? Preferred hair colors and styles?",
      },
      {
        id: 3,
        title: "Expressions",
        content:
          "What expressions should models convey? (Confidence, joy, mystery, elegance, etc.)",
      },
      {
        id: 4,
        title: "Interaction",
        content:
          "Should models be interacting with each other, looking at the camera, or engaged in an activity?",
      },
    ],
  },
  {
    number: 9,
    title: "Styling & Wardrobe",
    description: "Define clothing and accessory preferences",
    prompts: [
      {
        id: 1,
        title: "Clothing Style",
        content:
          "What clothing styles align with your brand? (Casual, formal, avant-garde, minimalistic, etc.)",
      },
      {
        id: 2,
        title: "Fabrics",
        content:
          "Preferred fabric types? (Matte vs. shiny, structured vs. flowy, textures, patterns, etc.)",
      },
      {
        id: 3,
        title: "Accessories",
        content:
          "Any must-have accessories or signature items or in depth descriptions?",
      },
      {
        id: 4,
        title: "Styling Approach",
        content: "Should styling be minimalistic or layered and detailed?",
      },
    ],
  },
  {
    number: 10,
    title: "Scene Setting",
    description: "Define background and environment",
    prompts: [
      {
        id: 1,
        title: "Background Style",
        content:
          "Should backgrounds be clean and simple, natural, or busy and dynamic?",
      },
      {
        id: 2,
        title: "Location",
        content:
          "Preferred locations or set styles? (Urban, studio, nature, historic, futuristic, dreamlike, etc.)",
      },
      {
        id: 3,
        title: "Props",
        content: "Do you want props included? If so, what kind?",
      },
      {
        id: 4,
        title: "Depth of Field",
        content:
          "Should the background be blurred or sharp? (Shallow vs. deep depth of field?)",
      },
    ],
  },
  {
    number: 11,
    title: "Post-Processing",
    description: "Define editing and retouching approach",
    prompts: [
      {
        id: 1,
        title: "Image Look",
        content:
          "Should images have a clean and polished or textured and grainy look?",
      },
      {
        id: 2,
        title: "Retouching Level",
        content:
          "Preferred level of retouching? (None, light, moderate, heavy?)",
      },
      {
        id: 3,
        title: "Skin Treatment",
        content:
          "Should skin be flawless and airbrushed, natural with texture, or somewhere in between?",
      },
      {
        id: 4,
        title: "Color Effects",
        content:
          "Any signature color grading or effects to apply? (Including film grain, soft focus, vintage effects)",
      },
    ],
  },
  {
    number: 12,
    title: "Brand Integration",
    description: "Define visual branding elements",
    prompts: [
      {
        id: 1,
        title: "Text Integration",
        content: "Should visuals include text overlays or remain clean?",
      },
      {
        id: 2,
        title: "Typography",
        content:
          "If text is included, what typefaces and placements do you prefer?",
      },
      {
        id: 3,
        title: "Format Adaptability",
        content:
          "Should the imagery be adaptable for multiple formats? (Website, social media, print, billboards, etc.)",
      },
      {
        id: 4,
        title: "Logo Placement",
        content: "How should logos or watermarks be incorporated (if at all)?",
      },
    ],
  },
];

export default function Identity() {
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
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
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
          content:
            "Welcome to your Visual Brand Identity creation! Let's start with your brand aesthetic. What is the core emotion or feeling your brand should evoke? (e.g., luxurious, edgy, soft, bold, inviting, warm, cool, minimal, maximal, nostalgic, futuristic, aspirational, intimate, powerful, high-end, etc.)",
          step: 1,
        },
      ],
      currentStep: 1,
      currentPromptId: 1,
    };

    setProjects((prev) => [...prev, newProject]);
    setActiveProject(newProject.id);
    setNewProjectName("");
    setShowNewProjectInput(false);
  };

  const getCurrentProject = () => {
    return projects.find((p) => p.id === activeProject);
  };

  const getNextPrompt = (
    step: number,
    promptId: number
  ): { step: number; promptId: number } | null => {
    const currentStep = STEPS[step - 1];
    if (!currentStep) return null;

    // If there are more prompts in current step
    if (promptId < currentStep.prompts.length) {
      return { step, promptId: promptId + 1 };
    }

    // If there's a next step
    if (step < STEPS.length) {
      return { step: step + 1, promptId: 1 };
    }

    return null;
  };

  const sendMessage = async (generateReport: boolean = false) => {
    if ((!input.trim() && !generateReport) || isLoading) return;

    setIsLoading(true);
    const currentProject = getCurrentProject();
    if (!currentProject) return;

    const newMessage = generateReport
      ? {
          role: "user" as const,
          content:
            "Please generate a comprehensive visual brand identity report based on our discussion.",
        }
      : { role: "user" as const, content: input };

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
      const response = await fetch("/api/visual-brand/identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...(getCurrentProject()?.messages || []), newMessage],
          step: currentProject.currentStep,
          currentPromptId: currentProject.currentPromptId,
          projectContext: currentProject.name,
          generateReport,
        }),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

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

        // Convert the chunk to text
        const text = new TextDecoder().decode(value);
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(5));
              if (data.content) {
                accumulatedContent += data.content;
                // Update the streaming message
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

      // After response is complete, advance to next prompt if not generating report
      if (!generateReport) {
        const nextPrompt = getNextPrompt(
          currentProject.currentStep,
          currentProject.currentPromptId
        );
        if (nextPrompt) {
          setProjects((prev) =>
            prev.map((p) => {
              if (p.id === activeProject) {
                return {
                  ...p,
                  currentStep: nextPrompt.step,
                  currentPromptId: nextPrompt.promptId,
                  messages: [
                    ...p.messages,
                    {
                      role: "assistant",
                      content:
                        STEPS[nextPrompt.step - 1].prompts[
                          nextPrompt.promptId - 1
                        ].content,
                      step: nextPrompt.step,
                    },
                  ],
                };
              }
              return p;
            })
          );
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
                  content:
                    "I apologize, but I encountered an error. Please try again.",
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

  const moveToNextStep = () => {
    const currentProject = getCurrentProject();
    if (!currentProject || currentProject.currentStep >= 12) return;

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === activeProject) {
          const nextStep = p.currentStep + 1;
          return {
            ...p,
            currentStep: nextStep,
            currentPromptId: 1, // Reset prompt ID for new step
            messages: [
              ...p.messages,
              {
                role: "assistant",
                content: `Moving to ${STEPS[nextStep - 1].title}. ${
                  STEPS[nextStep - 1].description
                }`,
                step: nextStep,
              },
            ],
          };
        }
        return p;
      })
    );
  };

  const deleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (activeProject === projectId) {
      setActiveProject(null);
    }
  };

  function ProgressIndicator({
    currentStep,
    currentPrompt,
    totalSteps,
    totalPrompts,
  }: {
    currentStep: number;
    currentPrompt: number;
    totalSteps: number;
    totalPrompts: number;
  }) {
    const progress =
      ((currentStep - 1) * 100) / totalSteps +
      (currentPrompt * 100) / (totalSteps * totalPrompts);

    return (
      <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
        <div
          className="bg-green-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  }

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
              Brand Visual Identity
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
                        <div className="opacity-75 text-[10px]">
                          {step.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add this before the chat interface */}
            {activeProject && (
              <ProgressIndicator
                currentStep={getCurrentProject()?.currentStep || 1}
                currentPrompt={getCurrentProject()?.currentPromptId || 1}
                totalSteps={STEPS.length}
                totalPrompts={STEPS[0].prompts.length}
              />
            )}

            {/* Chat Interface */}
            <div className="bg-gray-800 rounded-lg p-4 h-[650px] flex flex-col border border-gray-700">
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto space-y-4 mb-4"
              >
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
                      sendMessage(false);
                    }
                  }}
                />
                <Button
                  onClick={() => sendMessage(false)}
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
                <Button
                  onClick={() => sendMessage(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={isLoading}
                >
                  Generate Report
                </Button>
              </div>
              <Button
                onClick={moveToNextStep}
                disabled={getCurrentProject()?.currentStep === 12}
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
