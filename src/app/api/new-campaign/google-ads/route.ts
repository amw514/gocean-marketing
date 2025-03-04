import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function createSystemPrompt(step: number, currentPromptId: number, context: string): string {
  const stepDescriptions = {
    1: "Campaign Seeding - Define campaign fundamentals and target audience",
    2: "Headlines Creation - Craft compelling ad headlines with keywords and USPs",
    3: "Ad Descriptions - Create engaging descriptions with benefits and emotional appeal",
    4: "Callout Extensions - Add compelling extensions highlighting key benefits",
    5: "Negative Keywords - Define campaign exclusions for better targeting",
    6: "Landing Page Wireframe - Design conversion-focused layout",
    7: "Landing Page Draft - Create complete landing page content"
  };

  return `You are a Google Ads expert working on ${context}, ${stepDescriptions[step as keyof typeof stepDescriptions]}.
Provide clear, actionable guidance for step ${step}, prompt ${currentPromptId}.

Guidelines:
1. Keep responses focused and practical
2. Use bullet points for clarity
3. Include specific examples
4. Follow Google Ads best practices
5. Maintain professional tone

Format your response with clear sections and bullet points.`;
}

export const runtime = 'edge';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, step, currentPromptId, projectContext } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages: [
        {
          role: "system",
          content: createSystemPrompt(step, currentPromptId, projectContext),
        },
        ...messages.slice(-10).map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 4096,
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
    console.error('Google Ads API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    );
  }
} 