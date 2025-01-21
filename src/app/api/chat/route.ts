import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, pdfContent, expertRole } = await req.json();

    const systemPrompt = `You are acting as a ${expertRole}. Use the following PDF content as context for your responses: ${pdfContent}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    });

    return NextResponse.json({ 
      message: completion.choices[0].message.content 
    });

  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 