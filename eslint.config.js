const typescriptEslintParser = require("@typescript-eslint/parser");
const typescriptEslintPlugin = require("@typescript-eslint/eslint-plugin");
const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
    js.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            parser: typescriptEslintParser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: "module",
            },
            globals: {
                ...globals.node,
            }
        },
        plugins: {
            "@typescript-eslint": typescriptEslintPlugin,
        },
        rules: {
            ...typescriptEslintPlugin.configs.recommended.rules,
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    "argsIgnorePattern": "^_"
                }
            ]
        },
    },
    {
        ignores: ["dist/", "node_modules/"]
    },
    {
        files: ["test/**/*.ts"],
        languageOptions: {
            parser: typescriptEslintParser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: "module",
            },
            globals: {
                ...globals.node,
                ...globals.jest
            }
        },
        plugins: {
            "@typescript-eslint": typescriptEslintPlugin,
        },
        rules: {
            ...typescriptEslintPlugin.configs.recommended.rules,
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    "argsIgnorePattern": "^_"
                }
            ]
        },
    }
];
