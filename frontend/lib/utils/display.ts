/** Strip internal DEMO tags from client-facing labels. */
export function displayTitle(title: string | null | undefined): string {
  if (!title) return "";
  return title.replace(/^\[DEMO\]\s*/i, "").trim();
}

export function displayCategory(name: string | null | undefined): string {
  if (!name) return "";
  return name.replace(/^\[DEMO\]\s*/i, "").trim();
}
