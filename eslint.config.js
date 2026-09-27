const js = require("@eslint/js");

module.exports = [
    {
        files: ["app.js", "test/**/*.js"],
        ...js.configs.recommended,
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "commonjs",
            globals: {
                process: "readonly",
                __dirname: "readonly",
                console: "readonly",
                require: "readonly",
                module: "readonly",
                fetch: "readonly"
            }
        }
    },

    {
        files: ["public/js/**/*.js"],
        ...js.configs.recommended,
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "script",
            globals: {
                document: "readonly",
                fetch: "readonly",
                console: "readonly",
                alert: "readonly",
                confirm: "readonly"
            }
        }
    }
];