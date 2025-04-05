"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FiPlus, FiDownload, FiChevronRight, FiChevronLeft, FiFolder, FiX, FiImage } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { exportToPdf, exportToTxt } from "@/lib/export";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";
import Image from "next/image";

interface Project {
  id: string;
  name: string;
  messages: Message[];
  images: ImageResult[];
}

interface ImageResult {
  id: string;
  prompt: string;
  url: string;
  timestamp: number;
}

export default function ImageGeneration() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedProjects = localStorage.getItem("imageGenerationProjects");
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("imageGenerationProjects", JSON.stringify(projects));
  }, [projects]);

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
          content: "Welcome to Image Generation! Describe the image you'd like to create in detail.",
        }
      ],
      images: []
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

  const sendMessage = async () => {
    if (!input.trim() || !activeProject || isLoading) return;

    setIsLoading(true);
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

    try {
      // Add a loading message
      const loadingMessage: Message = { 
        role: "assistant", 
        content: "Generating image... This may take a moment." 
      };
      
      setProjects(prev => prev.map(p => {
        if (p.id === activeProject) {
          return {
            ...p,
            messages: [...p.messages, loadingMessage]
          };
        }
        return p;
      }));

      // Call the API to generate the image
      const response = await fetch("/api/visual-brand/image-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMessage.content,
          projectName: getCurrentProject()?.name
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      // Remove the loading message
      setProjects(prev => prev.map(p => {
        if (p.id === activeProject) {
          // Filter out the loading message
          const messagesWithoutLoading = p.messages.filter(
            m => m.content !== "Generating image... This may take a moment."
          );
          
          // Add the success message with the image
          const successMessage: Message = {
            role: "assistant",
            content: `Image generated successfully! You can download it or continue generating more images.`,
          };
          
          // Add the image to the project's images array
          const newImage: ImageResult = {
            id: Date.now().toString(),
            prompt: userMessage.content,
            url: data.imageUrl,
            timestamp: Date.now()
          };
          
          return {
            ...p,
            messages: [...messagesWithoutLoading, successMessage],
            images: [...p.images, newImage]
          };
        }
        return p;
      }));
    } catch (error) {
      console.error("Error generating image:", error);
      
      // Remove the loading message and add an error message
      setProjects(prev => prev.map(p => {
        if (p.id === activeProject) {
          const messagesWithoutLoading = p.messages.filter(
            m => m.content !== "Generating image... This may take a moment."
          );
          
          return {
            ...p,
            messages: [
              ...messagesWithoutLoading, 
              {
                role: "assistant",
                content: "I apologize, but I encountered an error generating your image. Please try again with a different description."
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

  const downloadImage = async (imageUrl: string, imageName: string) => {
    try {
      // Use our proxy endpoint instead of fetching directly
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${imageName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading image:", error);
      alert("Failed to download the image. Please try again.");
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
            <h1 className="text-2xl font-bold text-white mb-6">Image Generation</h1>
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
              className="w-full mb-4 bg-green-600 hover:bg-green-700"
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
                        ? "bg-green-700 text-white"
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
                      ? "bg-green-700 text-white"
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
                      message.role === "user" ? "bg-green-600 ml-auto" : "bg-gray-700",
                      "max-w-[80%]"
                    )}
                  >
                    <ReactMarkdown className="text-white prose prose-invert prose-sm max-w-none">
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ))}
                
                {/* Display generated images */}
                {getCurrentProject()?.images.map((image) => (
                  <div key={image.id} className="p-3 rounded-lg bg-gray-700 max-w-[80%]">
                    <div className="mb-2 text-white text-sm">Generated from: &quot;{image.prompt}&quot;</div>
                    <div className="relative w-full aspect-square max-w-md mx-auto rounded-lg overflow-hidden">
                      <Image 
                        src={`/api/proxy-image?url=${encodeURIComponent(image.url)}`} 
                        alt={image.prompt}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="mt-2 flex justify-end">
                      <Button
                        onClick={() => downloadImage(image.url, getCurrentProject()?.name || 'image')}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <FiDownload className="mr-1" /> Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe the image you want to generate..."
                  className="bg-gray-700 text-white border-gray-600 focus:border-green-500"
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
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLoading ? "Generating..." : "Generate"}
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
            </div>
          </>
        ) : (
          <div className="text-center text-gray-400 mt-20">
            <div className="flex justify-center mb-4">
              <FiImage className="h-16 w-16" />
            </div>
            <p className="text-xl">Select or create a project to start generating images</p>
            <p className="mt-2">Create detailed prompts to get the best results</p>
          </div>
        )}
      </div>
    </div>
  );
}
