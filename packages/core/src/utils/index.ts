export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toISOString(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toISOString();
}

export function toUnixSeconds(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date;
  return Math.floor(d.getTime() / 1000);
}

export function nowUnix(): number {
  return Math.floor(Date.now() / 1000);
}
