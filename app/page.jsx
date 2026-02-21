/**
 * @project     Spotify Clone - Next.js
 * @author      Hadi (https://github.com/hadikarimi2008)
 * @copyright   Copyright (c) 2026 Hadi. All rights reserved.
 * @license     Proprietary - No unauthorized copying or distribution.
 * @published   February 21, 2026
 */

import HeroSection from "@/components/heroSection";
import YourLibrary from "@/components/yourLibrary";

export default function Home() {
  return (
    <>
      <div className="flex items-center justify-between pb-20 md:pb-0">
        <div className="hidden md:block">
        <YourLibrary />
        </div>
        <HeroSection />
      </div>
    </>
  );
}
