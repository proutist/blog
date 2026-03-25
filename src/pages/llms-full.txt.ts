import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getPath } from "@/utils/getPath";
import postFilter from "@/utils/postFilter";
import { SITE } from "@/config";

/**
 * Очищаем MDX-исходник для читаемой подачи LLM:
 * 1. Убираем import-строки (шум для LLM)
 * 2. Преобразуем блоки <Korotko> в цитаты с пометкой "Краткий пересказ"
 * 3. Преобразуем компоненты-спойлеры (<BookSpoilerWarning />) в текстовые заметки
 * 4. Удаляем остальные самозакрывающиеся JSX-компоненты
 * 5. Для остальных блочных компонентов оставляем только их содержимое
 * 6. Преобразуем все ссылки на изображения в полные GitHub Raw URL
 * 7. Нормализуем пустые строки
 */
function cleanMdx(body: string): string {
  const GITHUB_RAW_BASE =
    "https://raw.githubusercontent.com/proutist/blog/main/src";

  return body
    // 1. Удаляем import-строки
    .replace(/^import\s+.+$/gm, "")
    // 2. Специальная обработка для Korotko (блочный компонент)
    .replace(/<Korotko[^>]*>([\s\S]*?)<\/Korotko>/gs, (_match, content) => {
      const cleanContent = content.trim().replace(/^> /gm, "").replace(/\n/g, "\n> ");
      return `\n> **КОРОТКО (самое важное!):**\n> ${cleanContent}\n`;
    })
    // 3. Специальная обработка для BookSpoilerWarning (поддерживаем многострочные теги)
    .replace(/<BookSpoilerWarning\s+([^>]*?)\/?>/gs, (_match, attrs) => {
      const getAttr = (name: string) => {
        // Ищем атрибут, поддерживая одинарные, двойные кавычки или их отсутствие
        const regex = new RegExp(`${name}=(?:["'])([^"']*)(?:["'])`);
        const match = attrs.match(regex);
        return match ? match[1] : "";
      };
      const book = getAttr("book");
      const author = getAttr("author");
      const url = getAttr("url");
      const authorStr = author ? ` — ${author}` : "";
      const urlStr = url ? ` (${url})` : "";
      return `\n> **ЗАМЕТКА: СПОЙЛЕРЫ (В этой статье частично пересказывается содержание книги «${book}»${authorStr}).**\n> Рекомендуем почитать оригинал: ${book}${urlStr}\n`;
    })
    // 4. Другие самозакрывающиеся JSX-компоненты — убираем
    .replace(/<[A-Z][A-Za-z]*(?:\s[^>]*)?\s*\/>/gs, "")
    // 5. Блочные JSX-компоненты (кроме тех, что уже обработаны) — оставляем только содержимое
    .replace(/<([A-Z][A-Za-z]*)[^>]*>([\s\S]*?)<\/\1>/gs, "$2")
    // 4. Ссылки на изображения: сохраняем полный alt и меняем @/ на GitHub URL
    .replace(/!\[([^\]]*)\]\(([^)]*)\)/g, (_match, alt, url) => {
      const fullUrl = url.startsWith("@/")
        ? url.replace("@/", `${GITHUB_RAW_BASE}/`)
        : url;
      return `![${alt}](${fullUrl})`;
    })
    // 5. Схлопываем повторяющиеся пустые строки (3+ → 2)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

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

  const sections = await Promise.all(
    posts.map(async p => {
      const postPath = getPath(p.id, p.filePath) + "/";
      const postUrl = `${base}${postPath}`;

      const pubDate = new Date(p.data.pubDatetime).toISOString().slice(0, 10);
      const modDate = p.data.modDatetime
        ? new Date(p.data.modDatetime).toISOString().slice(0, 10)
        : null;

      const tags = p.data.tags?.join(", ") ?? "";

      // p.body — сырой MDX без frontmatter, доступен из коробки
      const cleanBody = cleanMdx(p.body ?? "");

      const meta = [
        `URL: ${postUrl}`,
        `Дата публикации: ${pubDate}`,
        modDate ? `Последнее обновление: ${modDate}` : null,
        tags ? `Теги: ${tags}` : null,
        p.data.author ? `Автор: ${p.data.author}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      return `# ${p.data.title}

${meta}

${p.data.description}

${cleanBody}`;
    })
  );

  const body = `# ${SITE.title} — полный архив

> Намаскар! Этот блог о социо-духовном движении, направленном на объединение всей Вселенной в космическое братство, наполненное блаженством.
> В основе нашего пути лежит философия Ананда Марги («Пути Блаженства»), фундаментальная цель которой — «Самореализация и всеобщее благополучие» (Atmano mokshartham jagat hitaya cha). Мы стремимся к гармоничному физическому, психическому и духовному развитию человека, признавая всё мироздание частью единой космической семьи.
> Садвипра Самадж — это идеал справедливого общества, состоящего из садвипров: духовно и морально совершенных личностей, обладающих глубоким интеллектом и чистым разумом. Это люди, которые бескорыстно трудятся на благо всего человечества, животных и растений в духе всеобъемлющего Неогуманизма.

Этот файл содержит полный текст всех постов блога для использования языковыми моделями.
Каждый пост содержит метаданные (URL, дата, теги) и полный текст в формате Markdown.

---

${sections.join("\n\n---\n\n")}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
