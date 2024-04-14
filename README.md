# eslint-plugin-excalibur

A [typescript-eslint](https://typescript-eslint.io/getting-started) plugin for [Excalibur](https://excaliburjs.com/).

**`typescript-eslint` is required** and it only runs on Typescript files. This is so that the rules can be aware
of types in order to support some of these rules. This also means that it will **take as much time to lint** as it
will to compile your Typescript files. If you have ideas for how to improve this, please create an issue or PR.

# Usage

First, setup eslint and typescript-eslint if you haven't already:

```bash
# eslint 9.0 is not yet supported by typescript-eslint
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint@8 typescript
```

Install the plugin:

```bash
npm install eslint-plugin-excalibur --save-dev
```

Create an `eslint.config.js` file:

```js
// @ts-check
import eslint from '@eslint/js'
import excalibur from 'eslint-plugin-excalibur'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  excalibur.configs.recommended,
)
```

# Legacy Config

If you are using the `.eslintrc.js` config format, first read the [typescript-eslint docs](https://typescript-eslint.io/getting-started/legacy-eslint-setup#step-1-installation) for setting up with legacy config.

Once you have that setup your `.eslintrc.js` file should look something like this:

```js
/* eslint-env node */
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:excalibur/recommended-legacy',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
  },
  plugins: ['@typescript-eslint', 'excalibur'],
  root: true,
}
```

# Rules

(TODO)

For now, a list of rules can be found in the [rules folder](./rules)

# Troubleshooting

If you get an error that looks like this

```
ESLint was configured to run on `<tsconfigRootDir>/something.ts` using `parserOptions.project`: /path/to/tsconfig.json
```

This is because a file was passed through to eslint that is not part of `includes` in your `tsconfig.json`. To fix this, either add the file to your `includes` in `tsconfig.json` or adjust the eslint config like so:

```js
export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended
  {
    ...excalibur.configs.recommended,
    // e.g. only include your src files
    files: ['src/**/*.ts']
  }
)
```

See [typescript-eslint documentation](https://typescript-eslint.io/getting-started/typed-linting#i-get-errors-telling-me-the-file-must-be-included-in-at-least-one-of-the-projects-provided) for more information.
