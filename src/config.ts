export const SITE = {
  website: "https://proutist.com/", // replace this with your deployed domain
  author: "Proutist",
  profile: "https://github.com/proutist",
  desc: "Блог о социо-духовном движении, направленном на объединение всей Вселенной.",
  title: "Proutist",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: false,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: true,
    text: "Редактировать",
    url: "https://github.com/proutist/blog/blob/main/",
  },
  dynamicOgImage: true,
  dir: "ltr", // "rtl" | "auto"
  lang: "ru", // html lang code. Set this empty and default will be "en"
  timezone: "Asia/Hong_Kong", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;
