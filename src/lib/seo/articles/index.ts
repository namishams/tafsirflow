import type { Article, ArticleKind } from "../types";

export async function loadArticle(locale: string, kind: ArticleKind, slug: string): Promise<Article | null> {
  const get = async (l: string) => ((await import(`./${l}`).catch(() => null))?.default as Record<string, Article> | undefined)?.[`${kind}/${slug}`];
  return (await get(locale)) ?? (await get("en" as string)) ?? null;
}
