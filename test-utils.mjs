import { RuleTester } from '@typescript-eslint/rule-tester'
import * as test from 'vitest'
import path from 'path'

RuleTester.describe = function (text, method) {
  return test.describe(text, method)
}

RuleTester.it = function (text, method) {
  test.it(text, method)
}

RuleTester.afterAll = function (method) {
  test.afterAll(method)
}

RuleTester.itOnly = function (text, method) {
  test.it.only(text, method)
}

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: path.join(__dirname, 'fixture'),
    project: './tsconfig.json',
  },
})

/**
 * @type {typeof ruleTester['run']}
 */
export const run = ruleTester.run.bind(ruleTester)
export const it = RuleTester.it
export const describe = RuleTester.describe
