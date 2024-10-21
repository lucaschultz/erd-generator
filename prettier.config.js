/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
  arrowParens: 'always',
  jsxSingleQuote: true,
  overrides: [{ files: '.nvmrc', options: { parser: 'yaml' } }],
  plugins: ['prettier-plugin-curly', 'prettier-plugin-sh'],
  printWidth: 80,
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
}

export default config
