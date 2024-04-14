/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
const { ESLintUtils } = require('@typescript-eslint/utils')
const ts = require('typescript')

module.exports = ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      entityNotAdded: '{{ entityName }} was not added to a scene',
    },
  },
  defaultOptions: [],
  create(context) {
    const services = ESLintUtils.getParserServices(context)

    const entitiesAdded = new Map()

    return {
      // instantiated but not assigned entities
      NewExpression(node) {
        const type = services.getTypeAtLocation(node)

        if (isNewExpressionWithoutAssignment(node) && isExcaliburEntity(type)) {
          context.report({
            node,
            messageId: 'entityNotAdded',
            data: {
              entityName: type.symbol.name,
            },
          })
        }
      },

      VariableDeclarator(node) {
        const type = services.getTypeAtLocation(node)

        if (isExcaliburEntity(type)) {
          const isExportedVariable =
            node.parent.parent.type === 'ExportNamedDeclaration'

          // if an actor is exported we can't know when it's added to a scene
          if (!isExportedVariable) {
            entitiesAdded.set(services.getSymbolAtLocation(node.id), false)
          }
        }
      },
      'CallExpression > MemberExpression[property.name="add"]'(node) {
        /**
         * @type {import('@typescript-eslint/utils').TSESTree.CallExpression}
         */
        let caller = node.parent

        while (caller && caller.type !== 'CallExpression') {
          caller = caller.parent
        }

        const type = services.getTypeAtLocation(caller.callee.object)
        if (isExcaliburScene(type)) {
          entitiesAdded.set(
            services.getSymbolAtLocation(caller.arguments[0]),
            true,
          )
        }
      },

      'Program:exit'() {
        const unaddedEntities = Array.from(entitiesAdded.entries()).filter(
          ([, added]) => !added,
        )

        for (const [symbol] of unaddedEntities) {
          const declaration = symbol.declarations[0]
          const node = services.tsNodeToESTreeNodeMap.get(declaration)

          context.report({
            node,
            messageId: 'entityNotAdded',
            data: {
              entityName: node.id.name,
            },
          })
        }
      },
    }
  },
})

/**
 * @param {ts.Type} type
 */
function isExcaliburEntity(type) {
  if (type.symbol?.name === 'Entity') {
    const { declarations } = type.symbol
    for (const declaration of declarations) {
      if (
        declaration.getSourceFile().fileName.includes('node_modules/excalibur/')
      ) {
        return true
      }
    }
  }

  const baseTypes = type.getBaseTypes()
  if (baseTypes) {
    for (const baseType of baseTypes) {
      if (isExcaliburEntity(baseType)) {
        return true
      }
    }
  }

  return false
}

function isExcaliburScene(type) {
  if (type.symbol?.name === 'Scene') {
    const { declarations } = type.symbol
    for (const declaration of declarations) {
      if (
        declaration.getSourceFile().fileName.includes('node_modules/excalibur/')
      ) {
        return true
      }
    }
  }

  const baseTypes = type.getBaseTypes()
  if (baseTypes) {
    for (const baseType of baseTypes) {
      if (isExcaliburScene(baseType)) {
        return true
      }
    }
  }

  return false
}

function isNewExpressionWithoutAssignment(node) {
  return (
    node.type === 'NewExpression' &&
    node.parent &&
    node.parent.type !== 'VariableDeclarator'
  )
}
