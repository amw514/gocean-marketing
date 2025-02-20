"use client";

import { Button } from "@/components/ui/button";
import SignOutButton from "../SignOutButton";

const greenButtons = [
  {
    text: "Data Center",
    link: "https://drive.google.com/drive/folders/1n2hbQ0dWZiIj-PsbsAv2pWbk0BilOdKg?usp=drive_link&pli=1",
  },
  { text: "Full Service", link: "/full-service" },
  { text: "Refine/Remodel", link: "/refine-remodel" },
  { text: "Visual Brand", link: "/visual-brand" },
];

const redButtons = [
  { text: "New Campaign", link: "/new-campaign" },
  { text: "Update Campaign", link: "/update-campaign" },
  { text: "Ask Pro", link: "/ask-pro" },
];

export default function Dashboard() {
  const handleClick = (link: string) => {
    window.open(link, "_blank");
  };

  return (
    <div className="min-h-screen  p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <SignOutButton />
        </div>

        {/* Green Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {greenButtons.map((button, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full py-6 text-lg bg-green-600 hover:bg-green-700 text-white border-green-500 hover:border-green-600 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
              onClick={() => handleClick(button.link)}
            >
              {button.text}
            </Button>
          ))}
        </div>

        {/* Red Buttons (Restrictions) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {redButtons.map((button, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full py-6 text-lg bg-red-600 hover:bg-red-700 text-white border-red-500 hover:border-red-600 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
              onClick={() => handleClick(button.link)}
            >
              {button.text}
            </Button>
          ))}
        </div>

        {/* SignOut Button */}
      </div>
    </div>
  );
}
