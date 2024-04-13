import pluginJs from '@eslint/js'
import plugin from './plugin.js'

/**
 * @type {import("eslint").Linter.Config}
 */

export default [pluginJs.configs.recommended, ...plugin.configs.recommended]
