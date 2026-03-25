import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getPath } from "@/utils/getPath";
import postFilter from "@/utils/postFilter";
import { SITE } from "@/config";

// Путь к raw-файлам на GitHub
// Формат: https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}
const GITHUB_RAW =
  "https://raw.githubusercontent.com/proutist/blog/main/src/data/blog";

export const GET: APIRoute = async ({ site }) => {
  const base = site?.toString().replace(/\/$/, "") ?? "";

  const allPosts = await getCollection("blog");
  const posts = allPosts
    .filter(postFilter)
    .sort(
      (a, b) =>
        new Date(b.data.pubDatetime).getTime() -
        new Date(a.data.pubDatetime).getTime()
    );

  // Извлекаем filename с расширением из filePath для ссылки на raw GitHub
  // filePath выглядит как "/absolute/.../src/data/blog/slug.mdx"
  // p.id — это "slug" (без расширения) после обработки Astro
  // Для правильного raw-URL нам нужен оригинальный filename с расширением
  const getRawUrl = (post: (typeof posts)[number]) => {
    if (post.filePath) {
      // Берём только имя файла (с расширением) из filePath
      const filename = post.filePath.split("/").pop() ?? `${post.id}.mdx`;
      return `${GITHUB_RAW}/${filename}`;
    }
    // fallback: пробуем .mdx (самый распространённый вариант)
    return `${GITHUB_RAW}/${post.id}.mdx`;
  };

  const postLines = posts
    .map(p => {
      const postPath = getPath(p.id, p.filePath) + "/";
      const postUrl = `${base}${postPath}`;
      const rawUrl = getRawUrl(p);
      const desc = p.data.description ? ` ${p.data.description}` : "";
      return `- [${p.data.title}](${postUrl}):${desc} [MDX](${rawUrl})`;
    })
    .join("\n");

  const body = `# ${SITE.title}

> ${SITE.desc}
> Темы: ПРАУТ, Неогуманизм, Ананда Марга, социо-духовная философия, садхана, исследования.

Посты основаны на материалах глубокого исследования (Google Deep Research) и Google NotebookLM, прошедшие вычитку и редактирование человеком с экспертизой в данной теме.
Каждый пост содержит список источников в frontmatter (\`refs\`).
Исходники постов — MDX с чистым Markdown-контентом.

## Посты

${postLines}

## О сайте

- [Главная](${base}/)
- [Об авторе](${base}/about/)

## Optional

- [RSS](${base}/rss.xml)
- [Карта сайта](${base}/sitemap.xml)
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
