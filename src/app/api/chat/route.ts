import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function createRolePrompt(role: string): string {
  return `You are ${role}. Your responses should reflect your expertise and professional perspective. 
  Consider the following guidelines:
  1. Use terminology and concepts specific to your field
  2. Draw from industry best practices and current trends
  3. Provide practical, actionable insights
  4. Support your recommendations with professional reasoning
  5. Maintain a tone appropriate for your role

  If analyzing content, examine it through the lens of your expertise.
  If providing advice, ensure it aligns with your professional domain.`;
}

export async function POST(req: Request) {
  try {
    const { messages, pdfContent, expertRole } = await req.json();

    // Create comprehensive system message
    const rolePrompt = createRolePrompt(expertRole);
    const systemMessage = pdfContent 
      ? `${rolePrompt}\n\nAnalyze this content with your expertise: ${pdfContent}`
      : rolePrompt;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemMessage },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content
        }))
      ],
      temperature: 0.7,
    });

    return NextResponse.json({ 
      message: completion.choices[0].message.content 
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 