"use client";

import { Button } from "@/components/ui/button";

export default function VisualBrand() {
  const handleClick = (path: string) => {
    window.open(path, "_blank");
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-white mb-8">Visual Brand</h1>

        {/* Navigation Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Button
            variant="outline"
            className="w-full py-6 text-lg bg-green-600 hover:bg-green-700 text-white border-green-500 hover:border-green-600 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
            onClick={() => handleClick('/visual-brand/identity')}
          >
            Brand Visual Identity (do once)
          </Button>

          <Button
            variant="outline"
            className="w-full py-6 text-lg bg-green-600 hover:bg-green-700 text-white border-green-500 hover:border-green-600 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
            onClick={() => handleClick('/visual-brand/content')}
          >
            Generate Content
          </Button>
        </div>
      </div>
    </div>
  );
}

