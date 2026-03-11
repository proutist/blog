import type { Props } from "astro";
import IconGitHub from "@/assets/icons/IconGitHub.svg";
import IconYoutube from "@/assets/icons/IconYoutube.svg";
import IconWorld from "@/assets/icons/IconWorld.svg";
import IconMusic from "@/assets/icons/IconMusic.svg";
import IconBrandX from "@/assets/icons/IconBrandX.svg";
import IconLinkedin from "@/assets/icons/IconLinkedin.svg";
import IconWhatsapp from "@/assets/icons/IconWhatsapp.svg";
import IconFacebook from "@/assets/icons/IconFacebook.svg";
import IconTelegram from "@/assets/icons/IconTelegram.svg";
import IconPinterest from "@/assets/icons/IconPinterest.svg";
import IconMail from "@/assets/icons/IconMail.svg";
import IconThreads from "@/assets/icons/IconThreads.svg";
import { SITE } from "@/config";

interface Social {
  name: string;
  href: string;
  linkTitle: string;
  icon: (_props: Props) => Element;
}

export const SOCIALS: Social[] = [
  {
    name: "GitHub",
    href: "https://github.com/proutist",
    linkTitle: `${SITE.title} на GitHub`,
    icon: IconGitHub,
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@ananda_marga_vmtr",
    linkTitle: `Канал Ananda Marga на YouTube`,
    icon: IconYoutube,
  },
  {
    name: "Website",
    href: "https://anandamarga.ru",
    linkTitle: `Сайт Anandamarga.ru`,
    icon: IconWorld,
  },
  {
    name: "Prabhat Samgiita",
    href: "https://www.prabhatasamgiita.net",
    linkTitle: `Сайт Prabhatasamgiita.net`,
    icon: IconMusic,
  },
] as const;

export const SHARE_LINKS: Social[] = [
  {
    name: "Telegram",
    href: "https://t.me/share/url?url=",
    linkTitle: `Поделиться статьёй через Telegram`,
    icon: IconTelegram,
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/?text=",
    linkTitle: `Поделиться статьёй через WhatsApp`,
    icon: IconWhatsapp,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/sharer.php?u=",
    linkTitle: `Поделиться статьёй в Facebook`,
    icon: IconFacebook,
  },
  {
    name: "X",
    href: "https://x.com/intent/post?url=",
    linkTitle: `Поделиться статьёй в X`,
    icon: IconBrandX,
  },
  {
    name: "Threads",
    href: "https://www.threads.net/intent/post?text=",
    linkTitle: `Поделиться статьёй в Threads`,
    icon: IconThreads,
  },
] as const;
