import type { APIRoute } from "astro";

const getRobotsTxt = (sitemapURL: URL, llmsURL: URL) => `
# Намаскар

User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: ChatGPT-User
Allow: /

Sitemap: ${sitemapURL.href}
LLMs: ${llmsURL.href}
LLMs-full: ${llmsURL.origin}/llms-full.txt
`;

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL("sitemap.xml", site);
  const llmsURL = new URL("llms.txt", site);
  return new Response(getRobotsTxt(sitemapURL, llmsURL));
};
