import { abs } from "../site";
import { COMPANY, founderLd, organizationLd } from "../company";
import { BP_PATHS, type BpPage, type BpText } from "./text";

// Structured data for the Blueprint pages: the operating company (Organization with the brand descriptor), the page,
// and its breadcrumb. No offer, no price, no rating – these pages describe plans and invite individual conversations.
export function bpLd(locale: string, page: BpPage, t: BpText) {
  const url = abs(`/${locale}${BP_PATHS[page]}`);
  const seo = t.seo[page];
  const org = {
    ...organizationLd(abs),
    alternateName: [`${COMPANY.legalName} – ${COMPANY.brand}`, COMPANY.brand],
    areaServed: ["AE", "SA", "KW", "QA", "BH", "OM", "ID", "MY", "TR", "PK", "Worldwide"],
    knowsAbout: ["Quran education", "Islamic education technology", "Tajweed", "Tafsir", "Hifz", "Quran recitation"],
  };
  const crumbs = [
    { name: t.common.breadcrumbHome, path: "" },
    { name: t.nav.label, path: BP_PATHS.overview },
    ...(page === "overview" ? [] : [{ name: t.nav[page], path: BP_PATHS[page] }]),
  ];
  return {
    "@context": "https://schema.org",
    "@graph": [
      org,
      founderLd(abs),
      {
        "@type": page === "partners" ? "ContactPage" : "WebPage",
        "@id": `${url}#page`,
        url,
        name: seo.title,
        description: seo.desc,
        inLanguage: locale,
        isPartOf: { "@type": "WebSite", url: abs("/"), name: "Quran Masterclass" },
        about: { "@id": abs("/#org") },
        publisher: { "@id": abs("/#org") },
        keywords: seo.keywords,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: abs(`/${locale}${c.path}`) })),
      },
    ],
  };
}
