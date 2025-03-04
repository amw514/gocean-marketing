export interface Message {
  role: "user" | "assistant";
  content: string;
  step?: number;
  id?: number;
} 