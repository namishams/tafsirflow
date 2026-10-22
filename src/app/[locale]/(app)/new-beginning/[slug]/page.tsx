import { articleMetadata, articlePage, articleStatic } from "@/components/seo/ArticlePage";

export const generateStaticParams = articleStatic("new-beginning");
export const generateMetadata = articleMetadata("new-beginning");
export default articlePage("new-beginning");
