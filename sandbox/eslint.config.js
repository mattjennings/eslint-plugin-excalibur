import tseslint from 'typescript-eslint'
import excalibur from '../index.js'

export default tseslint.config(
  ...tseslint.configs.recommended,
  excalibur.configs.recommended,
)
