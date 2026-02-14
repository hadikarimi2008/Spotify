import HeroSection from "@/components/heroSection";
import SpotifyPlayer from "@/components/spotifyPlayer";
import YourLibrary from "@/components/yourLibrary";
import MobileNavbar from "@/components/mobileNavbar";

export default function Home() {
  return (
    <>
      <div className="flex items-center justify-between pb-20 md:pb-0">
        <div className="hidden md:block">
        <YourLibrary />
        </div>
        <HeroSection />
      </div>
      <SpotifyPlayer />
      <MobileNavbar />
    </>
  );
}
