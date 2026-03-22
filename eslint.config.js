import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: ["**/node_modules/**", "**/.next/**", "**/out/**"],
  },
  {
    files: [
      "app/**/*.{js,jsx,ts,tsx}",
      "components/**/*.{js,jsx,ts,tsx}",
      "lib/**/*.{js,jsx,ts,tsx}",
      "hooks/**/*.{js,jsx,ts,tsx}",
      "styles/**/*.{js,jsx,ts,tsx}",
    ],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {},
  },
];
