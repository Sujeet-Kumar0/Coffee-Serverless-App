import globals from "globals";
import tseslint from "typescript-eslint";


/** @type {import('eslint').Linter.Config[]} */
export default [
    {files: ["**/*.{js,mjs,cjs,ts}"]},
    {languageOptions: {globals: globals.node}},
    ...tseslint.configs.recommended,
    {
        files: ["**/*.ts"],
        rules: {
            // Downgrade no-explicit-any from error to warning
            "@typescript-eslint/no-explicit-any": "warn",
        }
    },
];
