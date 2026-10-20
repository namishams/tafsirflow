import { X509Certificate, verify } from "crypto";

// In-App Purchases from the iOS app: the app sends the signed transaction (JWS) that StoreKit 2 gives it.
// Checked here without any call to Apple: the certificate chain must end in Apple's root (embedded below),
// the leaf and intermediate must carry Apple's App Store marker OIDs, and the ES256 signature must match.
export const IOS_BUNDLE_ID = "com.quranmasterclass.app";
/** the first plan (one-time Premium); kept so earlier purchases stay valid */
export const PREMIUM_PRODUCT = "com.quranmasterclass.app.premium";
/** Quran Masterclass Pro: auto-renewable monthly subscription of the app */
export const PRO_SUBSCRIPTION = "com.quranmasterclass.app.pro.monthly";
/** personal duas written with AI: consumables, value = number of duas */
export const DUA_PRODUCTS: Record<string, number> = { "com.quranmasterclass.app.dua": 1, "com.quranmasterclass.app.dua5": 5 };

// Apple Root CA - G3 (https://www.apple.com/certificateauthority/), SHA-256 63:34:3A:BF:…:3E:91:79, valid until 2039
const APPLE_ROOT_G3 = new X509Certificate(`-----BEGIN CERTIFICATE-----
MIICQzCCAcmgAwIBAgIILcX8iNLFS5UwCgYIKoZIzj0EAwMwZzEbMBkGA1UEAwwS
QXBwbGUgUm9vdCBDQSAtIEczMSYwJAYDVQQLDB1BcHBsZSBDZXJ0aWZpY2F0aW9u
IEF1dGhvcml0eTETMBEGA1UECgwKQXBwbGUgSW5jLjELMAkGA1UEBhMCVVMwHhcN
MTQwNDMwMTgxOTA2WhcNMzkwNDMwMTgxOTA2WjBnMRswGQYDVQQDDBJBcHBsZSBS
b290IENBIC0gRzMxJjAkBgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9y
aXR5MRMwEQYDVQQKDApBcHBsZSBJbmMuMQswCQYDVQQGEwJVUzB2MBAGByqGSM49
AgEGBSuBBAAiA2IABJjpLz1AcqTtkyJygRMc3RCV8cWjTnHcFBbZDuWmBSp3ZHtf
TjjTuxxEtX/1H7YyYl3J6YRbTzBPEVoA/VhYDKX1DyxNB0cTddqXl5dvMVztK517
IDvYuVTZXpmkOlEKMaNCMEAwHQYDVR0OBBYEFLuw3qFYM4iapIqZ3r6966/ayySr
MA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQDAgEGMAoGCCqGSM49BAMDA2gA
MGUCMQCD6cHEFl4aXTQY2e3v9GwOAEZLuN+yRhHFD/3meoyhpmvOwgPUnPWTxnS4
at+qIxUCMG1mihDK1A3UT82NQz60imOlM27jbdoXt2QfyFMm+YhidDkLF1vLUagM
6BgD56KyKA==
-----END CERTIFICATE-----`);
// DER-encoded OIDs 1.2.840.113635.100.6.11.1 (App Store signing leaf) and 1.2.840.113635.100.6.2.1 (WWDR intermediate)
const LEAF_OID = Buffer.from([0x06, 0x0a, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x63, 0x64, 0x06, 0x0b, 0x01]);
const MID_OID = Buffer.from([0x06, 0x0a, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x63, 0x64, 0x06, 0x02, 0x01]);

export type AppleTransaction = {
  bundleId: string; productId: string; transactionId: string; originalTransactionId: string;
  purchaseDate: number; environment: string; revocationDate?: number; expiresDate?: number; type?: string;
};

const b64url = (s: string) => Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
const validAt = (c: X509Certificate, at: Date) => at >= new Date(c.validFrom) && at <= new Date(c.validTo);

/** checks a JWS signed by the App Store (chain up to Apple Root CA G3, marker OIDs, ES256) and returns its payload */
export function verifyAppleJws<T = Record<string, unknown>>(jws: string): T | null {
  const parts = jws.split(".");
  if (parts.length !== 3) return null;
  try {
    const header = JSON.parse(b64url(parts[0]).toString("utf8")) as { alg?: string; x5c?: string[] };
    if (header.alg !== "ES256" || !Array.isArray(header.x5c) || header.x5c.length !== 3) return null;
    const [leaf, mid, root] = header.x5c.map((c) => new X509Certificate(Buffer.from(c, "base64")));
    if (root.fingerprint256 !== APPLE_ROOT_G3.fingerprint256) return null;
    if (!mid.verify(APPLE_ROOT_G3.publicKey) || !leaf.verify(mid.publicKey)) return null;
    if (!leaf.raw.includes(LEAF_OID) || !mid.raw.includes(MID_OID)) return null;
    const signed = verify("sha256", Buffer.from(`${parts[0]}.${parts[1]}`), { key: leaf.publicKey, dsaEncoding: "ieee-p1363" }, b64url(parts[2]));
    if (!signed) return null;
    const p = JSON.parse(b64url(parts[1]).toString("utf8"));
    const at = new Date(Number(p.signedDate) || Date.now());
    if (!validAt(leaf, at) || !validAt(mid, at)) return null;
    return p as T;
  } catch {
    return null;
  }
}

export function verifyAppleTransaction(jws: string): AppleTransaction | null {
  const p = verifyAppleJws<Record<string, unknown>>(jws);
  if (!p) return null;
  return {
    bundleId: String(p.bundleId), productId: String(p.productId), transactionId: String(p.transactionId),
    originalTransactionId: String(p.originalTransactionId), purchaseDate: Number(p.purchaseDate),
    environment: String(p.environment), revocationDate: p.revocationDate ? Number(p.revocationDate) : undefined,
    expiresDate: p.expiresDate ? Number(p.expiresDate) : undefined, type: p.type ? String(p.type) : undefined,
  };
}
