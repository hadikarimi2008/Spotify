export function getShareUrl(type, id) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  return `${baseUrl}/share/${type}/${id}`;
}

export async function shareContent(type, id, title) {
  const shareUrl = getShareUrl(type, id);
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: title || "Check this out on Spotify",
        text: `Listen to ${title} on Spotify`,
        url: shareUrl,
      });
      return { success: true };
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error sharing:", error);
      }
      return { success: false, error: error.message };
    }
  } else {
    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      return { success: true, copied: true };
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      return { success: false, error: "Failed to copy link" };
    }
  }
}

