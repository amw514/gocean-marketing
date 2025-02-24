import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function createSystemPrompt(): string {
  return `You are a document improvement specialist. Your task is to:
  1. Maintain context of the entire conversation
  2. If there's a document, update it based on new information
  3. If no document is provided, work with the context from previous messages
  4. Provide clear, structured responses
  5. Track and incorporate all updates progressively
  
  Always reference previous changes when making new modifications.
  Keep the conversation flow coherent and maintain document history.`;
}

export async function POST(req: Request) {
  try {
    const { pdfContent, newInformation, previousMessages } = await req.json();

    const messages = [
      {
        role: "system",
        content: createSystemPrompt()
      },
      // Add previous context if it exists
      ...(previousMessages?.length ? previousMessages : []),
      {
        role: "user",
        content: `${pdfContent ? `Original Document:\n${pdfContent}\n\n` : ''}
${newInformation ? `New Information/Updates:\n${newInformation}` : ''}

Please ${pdfContent ? 'update the document' : 'continue'} based on this information, maintaining context from our previous discussion.`
      }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages,
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