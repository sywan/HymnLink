export function formatEscapedText(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\\\/g, "\\")
    .trim();
}

export function previewText(value: string, length = 92) {
  return formatEscapedText(value).replace(/\s+/g, " ").slice(0, length);
}
