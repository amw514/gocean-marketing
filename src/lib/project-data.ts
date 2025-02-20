export interface Prompt {
  id: number;
  text: string;
  requiresInput?: boolean;
  inputPlaceholder?: string;
}

export interface Step {
  id: number;
  name: string;
  prompts: Prompt[];
}

export interface ProjectResponse {
  stepId: number;
  promptId: number;
  response: string;
  userInput?: string;
}

export const STEPS: Step[] = [
  {
    id: 1,
    name: "Project Analysis",
    prompts: [
      {
        id: 1,
        text: "Let's analyze your project. Please provide a brief overview of your project goals and objectives.",
        requiresInput: true,
        inputPlaceholder: "Project goals and objectives"
      },
      {
        id: 2,
        text: "Based on your goals, what specific challenges do you anticipate?",
        requiresInput: true,
        inputPlaceholder: "Anticipated challenges"
      }
    ]
  },
  {
    id: 2,
    name: "Strategy Development",
    prompts: [
      {
        id: 1,
        text: "Let's develop a strategy based on your project analysis. What resources are currently available to you?",
        requiresInput: true,
        inputPlaceholder: "Available resources"
      }
    ]
  }
];

export interface ProjectStep {
  id: number;
  title: string;
  prompts: Prompt[];
} 