import noMissingCollider from './rules/no-missing-collider.js'

const plugin = {
  meta: {
    name: 'eslint-plugin-excalibur',
    version: '1.0.0',
  },
  configs: {},
  rules: {
    'no-missing-collider': noMissingCollider,
  },
}

// assign configs here so we can reference `plugin`
Object.assign(plugin.configs, {
  recommended: [
    {
      plugins: {
        excalibur: plugin,
      },
      rules: {
        'excalibur/no-missing-collider': 'error',
      },
    },
  ],
})

export default plugin
