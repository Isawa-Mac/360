import path from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts", "tmp/**", "scripts/**"],
  },
  ...compat.extends("eslint-config-next/core-web-vitals", "eslint-config-next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "prefer-const": "off",
    },
  },
];
