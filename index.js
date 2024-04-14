const plugin = {
  meta: {
    name: 'eslint-plugin-excalibur',
    version: '1.0.0',
  },
  configs: {},
  rules: {
    'no-missing-collider': require('./rules/no-missing-collider.js'),
  },
}

const rules = {
  'excalibur/no-missing-collider': 'error',
}

Object.assign(plugin.configs, {
  recommended: {
    files: ['*.ts'],
    plugins: {
      excalibur: plugin,
    },
    rules,
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
  },
  'recommended-legacy': {
    plugins: ['excalibur'],
    rules,
  },
})

module.exports = plugin