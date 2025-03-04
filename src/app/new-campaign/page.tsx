"use client";

import { Button } from "@/components/ui/button";

interface PlatformButton {
  name: string;
  path: string;
}

const paidPlatforms: PlatformButton[] = [
  { name: "Meta Ads", path: "/new-campaign/meta-ads" },
  { name: "Google Ads", path: "/new-campaign/google-ads" },
  { name: "YouTube Ads", path: "/new-campaign/youtube-ads" },
];

const organicPlatforms: PlatformButton[] = [
  { name: "SEO", path: "/new-campaign/seo" },
  { name: "Google My Business", path: "/new-campaign/gmb" },
  { name: "Main Website", path: "/new-campaign/website" },
  { name: "Instagram", path: "/new-campaign/instagram" },
  { name: "Facebook", path: "/new-campaign/facebook" },
  { name: "Facebook Group", path: "/new-campaign/facebook-group" },
  { name: "YouTube", path: "/new-campaign/youtube" },
  { name: "LinkedIn", path: "/new-campaign/linkedin" },
  { name: "Pinterest", path: "/new-campaign/pinterest" },
];

export default function NewCampaign() {
  const handleClick = (path: string) => {
    window.open(path, "_blank");
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <h1 className="text-2xl text-center text-white my-12">
          Choose the platform with the highest amount of qualified buyers for your campaign.
          Choose where we will be launching the campaign from:
        </h1>

        {/* Paid Platforms Section */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-6">Paid:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {paidPlatforms.map((platform) => (
              <Button
                key={platform.name}
                variant="outline"
                className="w-full py-6 text-lg bg-red-600 hover:bg-red-700 text-white border-red-500 hover:border-red-600 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
                onClick={() => handleClick(platform.path)}
              >
                {platform.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Organic Platforms Section */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-6">Organic:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {organicPlatforms.map((platform) => (
              <Button
                key={platform.name}
                variant="outline"
                className="w-full py-6 text-lg bg-green-600 hover:bg-green-700 text-white border-green-500 hover:border-green-600 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
                onClick={() => handleClick(platform.path)}
              >
                {platform.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
