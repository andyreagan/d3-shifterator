// Flat config (ESLint 9+). Mirrors the previous .eslintrc.js behavior:
// parse src as ES2020 modules with no rules enabled (parse-only lint).
export default [
    {
        files: ['src/**/*.js'],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
        },
        rules: {},
    },
];
