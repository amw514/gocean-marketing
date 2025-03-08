import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function createSystemPrompt(step: number, currentPromptId: number, context: string): string {
  const stepDescriptions = {
    1: "Campaign Seeding - Review and analyze the brand report",
    2: "Campaign Details - Gather specific campaign information",
    3: "Campaign Objective - Help select and optimize the campaign objective",
    4: "Ad Copywriting - Create compelling ad copy variations",
    5: "Landing Page Wireframe - Design comprehensive landing page structure",
    6: "Lead Qualification - Create effective qualifying questions",
    7: "Messenger Campaign - Design engaging conversation flow",
    8: "Survey Experience - Create interactive survey journey"
  };

  let promptGuidance = "";
  
  if (step === 1) {
    promptGuidance = "Analyze the brand report and provide key insights that will be relevant for the Meta Ads campaign.";
  } else if (step === 2) {
    promptGuidance = "Help define detailed campaign parameters including target audience, campaign goals, and pain points.";
  } else if (step === 3) {
    promptGuidance = "Based on the campaign details, recommend the most suitable campaign objective and explain why.";
  } else if (step === 4) {
    promptGuidance = "Create compelling ad copy variations based on the campaign details and selected objective. Follow the templates provided while maintaining brand voice and focusing on key benefits and pain points.";
  } else if (step === 5) {
    promptGuidance = "Create a detailed landing page wireframe based on the campaign details and ad copy. Follow the provided section structure while maintaining brand voice and optimizing for conversions.";
  } else if (step === 6) {
    promptGuidance = "Create 3 strategic qualifying questions that will effectively identify ideal prospects while maintaining engagement.";
  } else if (step === 7) {
    promptGuidance = "Design a conversational Messenger campaign that builds rapport while qualifying and guiding prospects to take action.";
  } else if (step === 8) {
    promptGuidance = "Create an engaging survey experience that qualifies prospects while educating them about your offer.";
  }

  return `You are a Meta Ads expert working on ${context}, ${stepDescriptions[step as keyof typeof stepDescriptions]}.
${promptGuidance}

Guidelines:
1. Keep responses focused and practical
2. Use bullet points for clarity
3. Include specific examples
4. Follow Meta Ads best practices
5. Maintain professional tone

When responding to campaign objective selection:
- Acknowledge the chosen objective
- Explain why it's suitable for their goals
- Provide specific recommendations for that objective
- Suggest best practices for implementation

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
    console.error('Meta Ads API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    );
  }
} 