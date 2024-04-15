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

        const isInArray = node.parent?.type === 'ArrayExpression'
        const isInObject = node.parent?.type === 'Property'
        const isInReturnStatement = getParentOfType(node, 'ReturnStatement')

        if (
          isNewExpressionWithoutAssignment(node) &&
          !isInArray &&
          !isInObject &&
          !isInReturnStatement &&
          isExcaliburClass(type, ['Entity'])
        ) {
          context.report({
            node,
            messageId: 'entityNotAdded',
            data: {
              entityName: type.symbol.name,
            },
          })
        }
      },

      // find created entities
      VariableDeclarator(node) {
        const type = services.getTypeAtLocation(node.init)

        if (isExcaliburClass(type, ['Entity'])) {
          // if an actor is exported we can't know when it's added to a scene
          const isExportedVariable =
            node.parent.parent.type === 'ExportNamedDeclaration'

          if (!isExportedVariable) {
            const initSymbol = services.getSymbolAtLocation(node.init)

            if (initSymbol) {
              // entitiesAdded.set(initSymbol.valueDeclaration?.symbol, false)
            } else {
              const nodeSymbol = services.getSymbolAtLocation(node.id)
              entitiesAdded.set(nodeSymbol, false)
            }
          }
        }
      },

      // if entity is returned from a function, mark it as added because we can't know when it's added to a scene
      ReturnStatement(node) {
        const type = services.getTypeAtLocation(node.argument)

        if (isExcaliburClass(type, ['Entity'])) {
          entitiesAdded.set(services.getSymbolAtLocation(node.argument), true)
        }
      },

      // mark any entities passed into .add() or .addChild() functions as added
      'CallExpression > MemberExpression[property.name="add"], CallExpression > MemberExpression[property.name="addChild"]'(
        node,
      ) {
        /**
         * @type {import('@typescript-eslint/utils').TSESTree.CallExpression}
         */
        let caller = getParentOfType(node, 'CallExpression')

        if (caller.arguments[0].type === 'Identifier') {
          const argType = services.getTypeAtLocation(caller.arguments[0])

          if (isExcaliburClass(argType, ['Entity'])) {
            const symbol = services.getSymbolAtLocation(caller.arguments[0])
            const declaration = findInitialDeclaration(services, symbol)

            if (declaration?.symbol) {
              entitiesAdded.set(declaration.symbol, true)
            }
          }
        }
      },

      // evaluate for report
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
 * @param {string[]} classNames
 * @param {object} options
 * @param {boolean} options.includeAny
 */
function isExcaliburClass(type, classNames, options = {}) {
  const { includeAny = false } = options

  /**
   * @type {ts.Type}
   */
  const resolvedBaseConstructorType = type.resolvedBaseConstructorType

  const symbol =
    resolvedBaseConstructorType?.symbol ||
    type.symbol?.valueDeclaration?.symbol ||
    type.symbol

  const flags = type.getFlags()
  const isAny = flags & ts.TypeFlags.Any

  if (includeAny && isAny) {
    return true
  }

  if (symbol?.name && classNames.includes(symbol?.name)) {
    const { valueDeclaration } = symbol
    if (
      valueDeclaration
        .getSourceFile()
        .fileName.includes('node_modules/excalibur/')
    ) {
      return true
    }
  }

  const baseTypes = type.getBaseTypes()
  if (baseTypes) {
    for (const baseType of baseTypes) {
      if (isExcaliburClass(baseType, classNames, options)) {
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
    node.parent.type !== 'VariableDeclarator' &&
    node.parent.type !== 'AssignmentExpression'
  )
}

function getParentOfType(node, type) {
  let parent = node.parent

  while (parent && parent.type !== type) {
    parent = parent.parent
  }

  return parent
}

function findInitialDeclaration(services, symbol) {
  const typeChecker = services.program.getTypeChecker()
  const declarations = symbol.getDeclarations()

  if (!declarations) {
    return undefined
  }

  let currentDeclaration = declarations[0]
  let currentSymbol = symbol

  // Walk back through variable assignments
  while (currentDeclaration) {
    if (ts.isVariableDeclaration(currentDeclaration)) {
      const initializer = currentDeclaration.initializer
      if (initializer && ts.isIdentifier(initializer)) {
        const nextSymbol = typeChecker.getSymbolAtLocation(initializer)
        if (nextSymbol && nextSymbol !== currentSymbol) {
          currentSymbol = nextSymbol
          currentDeclaration = nextSymbol.valueDeclaration
          continue
        }
      }
    }

    break
  }

  if (currentDeclaration && ts.isVariableDeclaration(currentDeclaration)) {
    return currentDeclaration
  }

  return undefined
}
