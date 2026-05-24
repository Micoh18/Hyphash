import { readFileSync, existsSync } from "node:fs";

const files = [
  "lib/i18n/locale.ts",
  "lib/auth/errors.ts",
  "app/login/page.tsx",
  "app/signup/page.tsx",
  "app/forgot-password/page.tsx",
  "app/reset-password/page.tsx",
];

for (const file of files) {
  if (!existsSync(file)) throw new Error(`Missing ${file}`);
}

const errors = readFileSync("lib/auth/errors.ts", "utf8");
for (const locale of ["en", "es", "pt", "ru"]) {
  if (!errors.includes(`${locale}: {`)) throw new Error(`Missing locale ${locale}`);
}
if (!errors.includes("No pudimos iniciar sesión con esas credenciales.")) {
  throw new Error("Missing safe Spanish invalid credentials message");
}

for (const page of ["app/login/page.tsx", "app/signup/page.tsx"]) {
  const content = readFileSync(page, "utf8");
  if (!content.includes("translateAuthError")) throw new Error(`${page} must translate raw auth errors`);
}

const reset = readFileSync("app/reset-password/page.tsx", "utf8");
if (!reset.includes("translatePasswordUpdateError")) throw new Error("reset page must translate password update errors");

console.log("auth error localization contract passed");
