import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getPath } from "@/utils/getPath";
import postFilter from "@/utils/postFilter";
import { SITE } from "@/config";

const fmt = (d: Date) => d.toISOString().split("T")[0];

const STATIC_PAGES = [
  { path: "/about/" },
  { path: "/posts/" },
  { path: "/search/" },
  { path: "/tags/" },
];

export const GET: APIRoute = async ({ site }) => {
  const base = site?.toString().replace(/\/$/, "") ?? "";

  const allPosts = await getCollection("blog");
  // Фильтруем черновики (так же, как и везде в проекте)
  const posts = allPosts.filter(postFilter);

  // Дата «свежести» каждого поста: modDatetime ?? pubDatetime
  const postDate = (p: (typeof posts)[number]) =>
    new Date(p.data.modDatetime ?? p.data.pubDatetime);

  // Дата последнего поста — прокси для главной страницы
  const latestDate =
    posts
      .map(postDate)
      .sort((a, b) => b.getTime() - a.getTime())[0] ?? new Date();

  // Все уникальные теги
  const tags = [
    ...new Set(posts.flatMap(p => p.data.tags ?? [])),
  ];

  const urlEntry = (path: string, lastmod?: string) =>
    [
      "  <url>",
      `    <loc>${base}${path}</loc>`,
      lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
      "  </url>",
    ]
      .filter(Boolean)
      .join("\n");

  // Архив — показываем только если разрешено в конфиге
  const archiveEntry = SITE.showArchives ? urlEntry("/archives/") : "";

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',

    // Главная — дата последнего поста
    urlEntry("/", fmt(latestDate)),

    // Статические страницы без lastmod
    ...STATIC_PAGES.map(({ path }) => urlEntry(path)),

    // LLMs файлы — дата последнего поста
    urlEntry("/llms.txt", fmt(latestDate)),
    urlEntry("/llms-full.txt", fmt(latestDate)),

    // Архив (опционально)
    archiveEntry,

    // Посты — modDatetime ?? pubDatetime
    ...posts.map(p =>
      urlEntry(getPath(p.id, p.filePath) + "/", fmt(postDate(p)))
    ),

    // Теги — дата самого свежего поста с данным тегом
    ...tags.map(tag => {
      const taggedDates = posts
        .filter(p => p.data.tags?.includes(tag))
        .map(postDate)
        .sort((a, b) => b.getTime() - a.getTime());
      return urlEntry(
        `/tags/${tag}/`,
        taggedDates[0] ? fmt(taggedDates[0]) : undefined
      );
    }),

    "</urlset>",
  ]
    .filter(s => s !== "")
    .join("\n");

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
