import { articleMetadata, articlePage, articleStatic } from "@/components/seo/ArticlePage";

export const generateStaticParams = articleStatic("why");
export const generateMetadata = articleMetadata("why");
export default articlePage("why");
