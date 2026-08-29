import { marked } from "marked";

/** Strips dangerous tags/attributes from LLM-generated markdown before rendering as HTML. */
function sanitize(html: string): string {
  return html
    .replace(/<(script|style|iframe|object|embed|form)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|style|iframe|object|embed|form)[^>]*\/?>(?!<\/\1>)/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

export function MarkdownView({ markdown }: { markdown: string }) {
  const html = sanitize(marked.parse(markdown || "_No content._", { async: false }) as string);
  return <div className="markdown-body text-sm text-white/85" dangerouslySetInnerHTML={{ __html: html }} />;
}
