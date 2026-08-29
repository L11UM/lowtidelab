// Minimal, dependency-free HTML sanitizer for AI-generated markdown output.
// Strips script/style/iframe tags, inline event handlers, and javascript: URLs
// before the rendered HTML is written into static pages.
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<\/?(script|style|iframe|object|embed|form)[^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*("|')/gi, '$1="#"');
}

// Sanitizer for AI-generated interactive Lab experiments. Unlike sanitizeHtml above,
// this MUST preserve inline <script>/<style> since the demo depends on them — the
// primary safety boundary for this content is the sandboxed iframe it's rendered in
// (see ExperimentFrame), not this filter. This just strips avoidable extra risk:
// external script/stylesheet loads, meta-refresh redirects, and <base> tag hijacking.
export function sanitizeExperimentHtml(html: string): string {
  return html
    .replace(/<script\b[^>]*\ssrc\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)[^>]*>\s*<\/script>/gi, "")
    .replace(/<link\b[^>]*\srel\s*=\s*("stylesheet"|'stylesheet')[^>]*>/gi, "")
    .replace(/<meta\b[^>]*http-equiv\s*=\s*("refresh"|'refresh')[^>]*>/gi, "")
    .replace(/<base\b[^>]*>/gi, "");
}
