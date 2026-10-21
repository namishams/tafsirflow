// iOS app in the App Store (ascAppId in mobile/eas.json). APP_STORE_URL in the server env overrides the link.
export const APP_STORE_ID = "6824934843";
export const appStoreUrl = () => process.env.APP_STORE_URL || `https://apps.apple.com/app/id${APP_STORE_ID}`;
