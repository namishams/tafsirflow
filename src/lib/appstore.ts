// iOS app in the App Store. Until Apple has approved the app (Build 25 in review, 22.10.2026) both values stay null:
// the website then shows "Coming soon on the App Store" instead of a link and sets no Smart App Banner.
// ascAppId in mobile/eas.json is 6824934843 – only put it here once the store page is really live.
//
// >>> TO GO LIVE: set the two lines below, e.g.
//     export const APP_STORE_URL: string | null = "https://apps.apple.com/app/id6824934843";
//     export const APP_STORE_ID: string | null = "6824934843";
// (APP_STORE_URL in the server environment also switches the link on without a code change.)
export const APP_STORE_URL: string | null = null;
export const APP_STORE_ID: string | null = null;

/** the real App Store link, or null while the app is not yet in the store */
export const appStoreLink = (): string | null => process.env.APP_STORE_URL || APP_STORE_URL || null;
/** true once the App Store link is set */
export const appStoreLive = () => appStoreLink() !== null;
/** where "get the app" links go: the App Store once live, until then the website's own app page */
export const appStoreUrl = () => appStoreLink() ?? "/app";
