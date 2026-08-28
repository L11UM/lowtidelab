// Minimal, dependency-free HTML sanitizer for AI-generated markdown output.
// Strips script/style/iframe tags, inline event handlers, and javascript: URLs
// before the rendered HTML is written into static pages.
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<\/?(script|style|iframe|object|embed|form)[^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*("|')/gi, '$1="#"');
}
