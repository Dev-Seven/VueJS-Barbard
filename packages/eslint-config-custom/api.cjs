module.exports = {
	root: true,
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"./index.js",
		"prettier",
	],
	env: {
		"jest/globals": true,
		browser: true,
		node: true,
	},
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint", "jest"],
	parserOptions: {
		sourceType: "module",
		ecmaVersion: 2020,
	},
	rules: {
		"jest/no-disabled-tests": "warn",
		"jest/no-focused-tests": "error",
		"jest/no-identical-title": "error",
		"jest/prefer-to-have-length": "warn",
		"jest/valid-expect": "error",
	},
};
