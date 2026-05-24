import { readFileSync, existsSync } from "node:fs";

const requiredFiles = [
  "app/forgot-password/page.tsx",
  "app/reset-password/page.tsx",
  "lib/auth/redirects.ts",
  "supabase/templates/recovery.html",
];

for (const file of requiredFiles) {
  if (!existsSync(file)) throw new Error(`Missing ${file}`);
}

const forgot = readFileSync("app/forgot-password/page.tsx", "utf8");
const reset = readFileSync("app/reset-password/page.tsx", "utf8");
const redirects = readFileSync("lib/auth/redirects.ts", "utf8");
const login = readFileSync("app/login/page.tsx", "utf8");

if (!forgot.includes("resetPasswordForEmail")) throw new Error("forgot-password must call resetPasswordForEmail");
if (!forgot.includes('getAuthCallbackUrl("/reset-password")')) throw new Error("forgot-password must use reset callback redirect");
if (!reset.includes("updateUser({ password })")) throw new Error("reset-password must update the password");
if (!reset.includes("signOut()")) throw new Error("reset-password should sign out after updating password");
if (!redirects.includes("NEXT_PUBLIC_SITE_URL")) throw new Error("redirect helper must support NEXT_PUBLIC_SITE_URL");
if (!redirects.includes("100.89.94.96")) throw new Error("redirect helper must avoid 0.0.0.0 local preview URLs");
if (!login.includes("/forgot-password")) throw new Error("login must link to forgot-password");

console.log("reset password flow contract passed");
