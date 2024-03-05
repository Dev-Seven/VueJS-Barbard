module.exports = {
  extends: [
    "eslint:recommended",
    "turbo",
    "prettier",
    "plugin:@typescript-eslint/recommended",
  ],
  rules: {
    "turbo/no-undeclared-env-vars": "error",
  },
};
