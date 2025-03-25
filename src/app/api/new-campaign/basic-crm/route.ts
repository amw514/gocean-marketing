import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function createSystemPrompt(step: number, currentPromptId: number, context: string): string {
  const stepDescriptions = {
    1: "Campaign Seeding - Define campaign fundamentals and target audience",
    2: "Soap Opera Sequence - Create a 5-day email nurture sequence",
    3: "Pre-Call Nurture - Design sequences for clients who booked calls",
    4: "No-Book Recovery - Create sequences to re-engage prospects who didn't book",
    5: "Long-Term Nurture - Design a 30-day sequence to keep prospects warm"
  };

  return `You are a CRM and email marketing expert working on ${context}, ${stepDescriptions[step as keyof typeof stepDescriptions]}.
Provide clear, actionable content for step ${step}, prompt ${currentPromptId}.

Guidelines:
1. Create compelling, conversion-focused content
2. Use clear formatting with subject lines, body text, and CTAs clearly labeled
3. Include specific examples and templates
4. Follow email marketing best practices
5. Maintain brand voice consistency
6. For multi-channel sequences (email, SMS, VM), clearly label each channel

Format your response with clear sections, proper email formatting, and include all necessary components (subject lines, body text, CTAs).`;
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
    console.error('Basic CRM API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    );
  }
} 