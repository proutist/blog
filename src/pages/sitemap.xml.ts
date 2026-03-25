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

  type Route = { path: string; lastmod?: Date };
  const routes: Route[] = [];

  // Главная — дата последнего поста
  routes.push({ path: "/", lastmod: latestDate });

  // Статические страницы без lastmod
  STATIC_PAGES.forEach(({ path }) => routes.push({ path }));

  // LLMs файлы — дата последнего поста
  routes.push({ path: "/llms.txt", lastmod: latestDate });
  routes.push({ path: "/llms-full.txt", lastmod: latestDate });

  // Архив (опционально)
  if (SITE.showArchives) {
    routes.push({ path: "/archives/" });
  }

  // Посты — modDatetime ?? pubDatetime
  posts.forEach(p => {
    routes.push({
      path: getPath(p.id, p.filePath) + "/",
      lastmod: postDate(p),
    });
  });

  // Теги — дата самого свежего поста с данным тегом
  tags.forEach(tag => {
    const taggedDates = posts
      .filter(p => p.data.tags?.includes(tag))
      .map(postDate)
      .sort((a, b) => b.getTime() - a.getTime());
    routes.push({
      path: `/tags/${tag}/`,
      lastmod: taggedDates[0],
    });
  });

  // Сортируем: сначала новые (по lastmod), страницы без lastmod (статика) — в конце
  routes.sort((a, b) => {
    const timeA = a.lastmod ? a.lastmod.getTime() : 0;
    const timeB = b.lastmod ? b.lastmod.getTime() : 0;
    return timeB - timeA;
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...routes.map(r =>
      urlEntry(r.path, r.lastmod ? fmt(r.lastmod) : undefined)
    ),
    "</urlset>",
  ]
    .filter(s => s !== "")
    .join("\n");

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
