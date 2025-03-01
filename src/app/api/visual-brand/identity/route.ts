import { OpenAI } from "openai";
import { NextResponse } from "next/server";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Type definitions
type Message = {
  role: "user" | "assistant";
  content: string;
}

// Step descriptions mapping
const STEP_DESCRIPTIONS = {
  1: "Brand Aesthetic - Define core visual elements and emotions",
  2: "Campaign Details - Define campaign purpose and context",
  3: "Visual Style - Define photography and visual approach",
  4: "Inspiration - Reference campaigns and artistic direction",
  5: "Business Goals - Align visuals with marketing objectives",
  6: "Composition & Framing - Define photography composition approach",
  7: "Lighting & Shadow - Define lighting and atmosphere preferences",
  8: "Subject & Models - Define model characteristics and expressions",
  9: "Styling & Wardrobe - Define clothing and accessory preferences",
  10: "Scene Setting - Define background and environment",
  11: "Post-Processing - Define editing and retouching approach",
  12: "Brand Integration - Define visual branding elements"
} as const;

/**
 * Creates a system prompt for the AI based on the current step and context
 */
function createSystemPrompt(step: number, currentPromptId: number, context: string): string {
  return `You are a visual branding expert working on ${context}, ${STEP_DESCRIPTIONS[step as keyof typeof STEP_DESCRIPTIONS]}, prompt ${currentPromptId}.
Provide a brief, focused response to the user's answer about their visual brand.

Guidelines:
1. Keep responses very brief (max 100 words)
2. Acknowledge their answer
3. Provide 1-2 quick suggestions or confirmations
4. End with a transition to the next question
5. Focus on visual design aspects specific to the current step

Format your response in 2-3 short bullet points.`;
}

/**
 * Creates a comprehensive report prompt based on all previous messages
 */
function createReportPrompt(messages: Message[], projectName: string): string {
  return `As a visual branding expert, analyze all previous responses and create a comprehensive visual brand identity report for ${projectName}.

Create a structured report with these sections:

1. Executive Summary (Brief overview of brand identity)
2. Core Visual Elements
   - Color Palette (with hex codes)
   - Typography Recommendations
   - Design Elements
3. Brand Aesthetic Guidelines
   - Photography Style
   - Composition Preferences
   - Lighting and Mood
4. Implementation Guide
   - Digital Applications
   - Print Applications
   - Social Media Guidelines
5. Technical Specifications
   - Color Codes
   - Font Specifications
   - Spacing Rules

Format each section with clear headings and bullet points. Include specific, actionable recommendations.
Keep the tone professional but accessible.`;
}

// API Configuration
export const runtime = 'edge';
export const maxDuration = 60;

/**
 * POST handler for visual brand identity API
 */
export async function POST(req: Request) {
  try {
    const { messages, step, currentPromptId, projectContext, generateReport } = await req.json();

    // Select appropriate prompt based on request type
    const systemPrompt = generateReport 
      ? createReportPrompt(messages, projectContext)
      : createSystemPrompt(step, currentPromptId, projectContext);

    // Create OpenAI chat completion
    const completion = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages: [
        { 
          role: "system", 
          content: systemPrompt
        },
        ...messages.slice(-10).map((m: Message) => ({
          role: m.role,
          content: m.content,
        }))
      ],
      temperature: 0.7,
      max_tokens: 4096,
      stream: true,
    });

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Visual Brand Identity API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    );
  }
} 