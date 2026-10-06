import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// scripts/deploy.sh builds into a separate folder (NEXT_DIST_DIR) and swaps it in only after a successful build,
// so the running site never serves pages whose CSS/JS files were already replaced.
export default withNextIntl({ distDir: process.env.NEXT_DIST_DIR || ".next" });
