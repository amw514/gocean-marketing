import { PDFDocument, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function wrapText(text: string, maxWidth: number): string[] {
  const words = text.replace(/\*\*/g, '').split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= maxWidth) {
      currentLine += (currentLine.length === 0 ? '' : ' ') + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function sanitizeText(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emojis
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
    .replace(/[\uD800-\uDFFF]/g, '') // Remove surrogate pairs
    .trim();
}

export async function exportToPdf(messages: Message[], title: string) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  let page = pdfDoc.addPage([595, 842]); // A4
  const { height } = page.getSize();
  let y = height - 50;
  const maxWidth = 78; // Characters per line
  
  // Title
  page.drawText(sanitizeText(title), {
    x: 50,
    y,
    font: boldFont,
    size: 14,
  });
  y -= 30;

  // Messages
  for (const msg of messages) {
    if (y < 100) {
      page = pdfDoc.addPage([595, 842]);
      y = height - 50;
    }

    // Role header
    page.drawText(sanitizeText(msg.role.toUpperCase() + ':'), {
      x: 50,
      y,
      font: boldFont,
      size: 11,
    });
    y -= 20;

    // Message content
    const paragraphs = msg.content.split('\n');
    for (const paragraph of paragraphs) {
      const lines = wrapText(paragraph, maxWidth);
      for (const line of lines) {
        if (y < 50) {
          page = pdfDoc.addPage([595, 842]);
          y = height - 50;
        }

        // Handle bold text
        if (line.includes('**')) {
          page.drawText(sanitizeText(line.replace(/\*\*/g, '')), {
            x: 50,
            y,
            font: boldFont,
            size: 10,
          });
        } else {
          page.drawText(sanitizeText(line), {
            x: 50,
            y,
            font,
            size: 10,
          });
        }
        y -= 15;
      }
      y -= 10; // Extra space between paragraphs
    }
    y -= 20; // Space between messages
  }

  const pdfBytes = await pdfDoc.save();
  saveAs(new Blob([pdfBytes]), `${title}.pdf`);
}

export function exportToTxt(messages: Message[], title: string) {
  const content = messages
    .map(m => `${m.role.toUpperCase()}:\n${m.content}\n\n`)
    .join('---\n\n');
    
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${title}.txt`);
} 