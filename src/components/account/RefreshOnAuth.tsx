"use client";
import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

// After a sign-in on /account (AccountForm fires "tf-auth"), the server renders the member dashboard instead of the form.
export default function RefreshOnAuth() {
  const router = useRouter();
  useEffect(() => {
    const on = () => router.refresh();
    window.addEventListener("tf-auth", on);
    return () => window.removeEventListener("tf-auth", on);
  }, [router]);
  return null;
}
