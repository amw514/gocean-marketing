import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // First try to get from cache
    const cachedText = localStorage.getItem(`pdf-${file.name}`);
    if (cachedText) return cachedText;

    // If not in cache, read the file
    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const result = event.target?.result;
          if (typeof result === 'string') {
            // Cache the result
            localStorage.setItem(`pdf-${file.name}`, result);
            resolve(result);
          } else {
            reject(new Error('Failed to read PDF content'));
          }
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });

    return text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
} 