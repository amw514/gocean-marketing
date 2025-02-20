"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { FiPlus, FiFolder } from "react-icons/fi";
import { STEPS, type ProjectResponse } from "@/lib/project-data";
import { PDFDocument, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';

interface ProjectData {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  currentStep: number;
  currentPrompt: number;
  responses: ProjectResponse[];
}

export default function ProjectPlanner() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [activeProject, setActiveProject] = useState<ProjectData | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createProject = () => {
    if (!newProject.name.trim()) return;
    
    const project: ProjectData = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description,
      createdAt: new Date(),
      currentStep: 1,
      currentPrompt: 1,
      responses: []
    };

    setProjects(prev => [...prev, project]);
    setNewProject({ name: "", description: "" });
    setShowNewProject(false);
  };

  const startProject = (project: ProjectData) => {
    setActiveProject(project);
    
    const firstStep = STEPS.find(s => s.id === 1);
    const firstPrompt = firstStep?.prompts.find(p => p.id === 1);
    
    if (firstPrompt) {
      setMessages([{
        role: 'assistant',
        content: firstPrompt.requiresInput 
          ? `${firstPrompt.text}\n\nPlease provide: ${firstPrompt.inputPlaceholder}`
          : firstPrompt.text
      }]);
    }
  };

  const handlePromptSubmission = async () => {
    if (!activeProject || isLoading) return;

    const currentStepData = STEPS.find(s => s.id === activeProject.currentStep);
    const currentPromptData = currentStepData?.prompts.find(p => p.id === activeProject.currentPrompt);

    if (!currentStepData || !currentPromptData) return null;

    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: input }],
          systemPrompt: currentPromptData.text,
          projectData: activeProject,
        }),
      });

      const data = await response.json();

      // Update messages with AI response
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);

      // Store the response
      setActiveProject(prev => {
        if (!prev) return null;
        return {
          ...prev,
          responses: [...prev.responses, {
            stepId: prev.currentStep,
            promptId: prev.currentPrompt,
            response: data.content,
            userInput: input
          }],
          // Move to next prompt or step
          ...(currentStepData?.prompts.length > prev.currentPrompt 
            ? { currentPrompt: prev.currentPrompt + 1 }
            : STEPS.length > prev.currentStep 
              ? { currentStep: prev.currentStep + 1, currentPrompt: 1 }
              : {})
        };
      });

      // Clear input
      setInput("");

      // If we moved to a new prompt, add the next prompt question
      setTimeout(() => {
        const updatedProject = activeProject;
        const nextStepData = STEPS.find(s => s.id === updatedProject.currentStep);
        const nextPromptData = nextStepData?.prompts.find(p => p.id === updatedProject.currentPrompt);
        
        if (nextPromptData) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: nextPromptData.requiresInput 
              ? `${nextPromptData.text}\n\nPlease provide: ${nextPromptData.inputPlaceholder}`
              : nextPromptData.text
          }]);
        }
      }, 1000);

    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, there was an error processing your request. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToTxt = (messages: { role: 'user' | 'assistant'; content: string }[], projectName: string) => {
    const content = messages
      .map(m => `${m.role.toUpperCase()}: ${m.content}\n`)
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${projectName}-chat.txt`);
  };

  const exportToPdf = async (messages: { role: 'user' | 'assistant'; content: string }[], projectName: string) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { height } = page.getSize();
    let yOffset = height - 50;

    messages.forEach(m => {
      page.drawText(`${m.role.toUpperCase()}: ${m.content}`, {
        x: 50,
        y: yOffset,
        size: 12,
        color: rgb(0, 0, 0),
      });
      yOffset -= 30;
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    saveAs(blob, `${projectName}-chat.pdf`);
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Project Planner</h1>

        {!activeProject ? (
          <div>
            {/* Project List */}
            <div className="grid gap-4 mb-6">
              {projects.map(project => (
                <div 
                  key={project.id}
                  className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => startProject(project)}
                >
                  <div className="flex items-center gap-3">
                    <FiFolder className="h-5 w-5 text-red-400" />
                    <div>
                      <h3 className="text-white font-semibold">{project.name}</h3>
                      <p className="text-gray-400 text-sm">{project.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Create New Project */}
            {showNewProject ? (
              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-xl font-semibold text-white mb-4">Create New Project</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">Project Name</label>
                    <Input
                      value={newProject.name}
                      onChange={e => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter project name"
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">Description</label>
                    <Textarea
                      value={newProject.description}
                      onChange={e => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter project description"
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={createProject}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Create Project
                    </Button>
                    <Button
                      onClick={() => setShowNewProject(false)}
                      className="bg-gray-700 hover:bg-gray-600"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setShowNewProject(true)}
                className="bg-red-600 hover:bg-red-700 w-full"
              >
                <FiPlus className="mr-2" /> Create New Project
              </Button>
            )}
          </div>
        ) : (
          <div>
            {/* Project Chat Interface */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h2 className="text-xl font-semibold text-white mb-2">{activeProject.name}</h2>
              <p className="text-gray-400 text-sm">{activeProject.description}</p>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <div className="h-[500px] overflow-y-auto mb-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      message.role === "user" ? "bg-red-600 ml-auto" : "bg-gray-700"
                    } max-w-[80%]`}
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
                  placeholder="Type your response..."
                  className="bg-gray-800 text-white border-gray-700"
                  disabled={isLoading}
                />
                <Button
                  onClick={handlePromptSubmission}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Send
                </Button>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => setActiveProject(null)}
                className="bg-gray-700 hover:bg-gray-600"
              >
                Back to Projects
              </Button>
              <Button
                onClick={() => exportToTxt(messages, activeProject.name)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Export as TXT
              </Button>
              <Button
                onClick={() => exportToPdf(messages, activeProject.name)}
                className="bg-green-600 hover:bg-green-700"
              >
                Export as PDF
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
