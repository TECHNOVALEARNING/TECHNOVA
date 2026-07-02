export const getEmbedUrl = (url: string, cleanMode: boolean = false) => {
  if (!url) return "";
  try {
    if (url.includes("drive.google.com/file/d/")) {
      const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    if (url.includes("youtube.com/watch")) {
      const urlObj = new URL(url);
      const id = urlObj.searchParams.get("v");
      return cleanMode
        ? `https://www.youtube.com/embed/${id}?autoplay=1&controls=0&mute=0&rel=0&modestbranding=1&iv_load_policy=3`
        : `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("youtu.be")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return cleanMode
        ? `https://www.youtube.com/embed/${id}?autoplay=1&controls=0&mute=0&rel=0&modestbranding=1&iv_load_policy=3`
        : `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("vimeo.com")) {
      const id = url.split("vimeo.com/")[1]?.split("/")[0]?.split("?")[0];
      return cleanMode
        ? `https://player.vimeo.com/video/${id}?autoplay=1&badge=0&byline=0&portrait=0&title=0&controls=0`
        : `https://player.vimeo.com/video/${id}`;
    }
    return url;
  } catch {
    return url;
  }
};

export const getVideoThumbnailUrl = (url: string) => {
  if (!url)
    return "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
  try {
    if (url.includes("youtube.com/watch")) {
      const urlObj = new URL(url);
      const id = urlObj.searchParams.get("v");
      if (id) return `https://img.youtube.com/vi/${id}/sddefault.jpg`;
    }
    if (url.includes("youtu.be")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      if (id) return `https://img.youtube.com/vi/${id}/sddefault.jpg`;
    }
    return "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
  } catch {
    return "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
  }
};

export const isDirectVideo = (url: string) => {
  if (!url) return false;
  try {
    const cleanUrl = url.split("?")[0].split("#")[0].toLowerCase();
    return cleanUrl.endsWith(".mp4") || cleanUrl.endsWith(".webm") || cleanUrl.endsWith(".ogg");
  } catch {
    return false;
  }
};
