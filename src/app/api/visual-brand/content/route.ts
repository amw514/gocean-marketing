import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function createSystemPrompt(report: string): string {
  return `You are a visual branding expert. Based on the following brand identity report:

${report}

Your task is to create a concise, detailed prompt for generating marketing images. The prompt should be formatted as a clear paragraph, optimized for image generation, and under 600 characters. Focus on visual elements, style, mood, and technical specifications while maintaining brand consistency.`;
}

export const runtime = 'edge';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, report } = await req.json();
    const lastMessage = messages[messages.length - 1];

    // If this is a prompt generation request
    const isPromptRequest = lastMessage.content.includes("Create a detailed prompt that is below 6,000 characters");

    const systemPrompt = isPromptRequest 
      ? createSystemPrompt(report)
      : "You are a visual branding expert. Please acknowledge receipt of the brand identity report and confirm when ready to generate prompts.";

    const completion = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messages.slice(-3).map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 1000,
      stream: true,
    });

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
    console.error('Visual Brand Content API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    );
  }
} 