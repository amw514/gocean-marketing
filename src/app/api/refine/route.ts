import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { pdfContent, newInformation } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a document improvement specialist. Update the document based on new information while maintaining its structure and style."
        },
        {
          role: "user",
          content: `Original Document: ${pdfContent}\n\nNew Information: ${newInformation}\n\nPlease rewrite and update the document incorporating this new information.`
        }
      ],
      temperature: 0.7,
    });

    return NextResponse.json({ 
      updatedContent: completion.choices[0].message.content 
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}