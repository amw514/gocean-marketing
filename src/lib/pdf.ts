import * as pdfjsLib from 'pdfjs-dist';

// Set worker path to CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

export async function extractTextFromPDF(file: File): Promise<string | null> {
  try {
    // First try to get from cache
    const cachedText = localStorage.getItem(`pdf-${file.name}`);
    if (cachedText) return cachedText;

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Verify PDF header magic number
    const pdfHeader = String.fromCharCode(...uint8Array.slice(0, 5));
    if (!pdfHeader.startsWith('%PDF-')) {
      return null; // Not a valid PDF, but don't throw error
    }

    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      cMapUrl: 'https://unpkg.com/pdfjs-dist@latest/cmaps/',
      cMapPacked: true,
    });

    const pdf = await loadingTask.promise;
    let fullText = '';

    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(item => 'str' in item ? item.str : '')
        .join(' ');
      fullText += pageText + '\n';
    }

    // Clean and normalize text
    fullText = fullText.trim();

    if (fullText) {
      // Cache the result
      localStorage.setItem(`pdf-${file.name}`, fullText);
    }
    return fullText || null;

  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return null; // Return null instead of throwing
  }
} 