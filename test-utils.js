import test from 'node:test'
import { RuleTester as RuleTester } from 'eslint'

RuleTester.describe = function (text, method) {
  return test.describe(text, method)
}

RuleTester.it = function (text, method) {
  test.it(text, method)
}

const ruleTester = new RuleTester()

export const only = RuleTester.only

/**
 * @type {typeof ruleTester['run']}
 */
export const run = ruleTester.run.bind(ruleTester)
export const it = RuleTester.it
export const describe = RuleTester.describe
