import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import excalibur from '../index.js'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  excalibur.configs.recommended,
)
