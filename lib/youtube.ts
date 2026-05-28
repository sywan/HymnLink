export function getYouTubeEmbedUrl(url: string) {
  if (!url) return "";

  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }

    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v") || parsed.pathname.split("/").pop();
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }
  } catch {
    return "";
  }

  return "";
}

export function joinSheetMusicUrl(base: string, file: string) {
  if (!base && !file) return "";
  if (!base) return file;
  if (!file) return base;
  return `${base.replace(/\/$/, "")}/${file.replace(/^\//, "")}`;
}
