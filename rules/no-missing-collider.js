/**
 * @type {import('eslint').Rule.RuleModule}
 */
export default {
  meta: {
    hasSuggestions: true,
    messages: {
      missingColliderInActorArgs:
        'Actor has a collisionType but is missing width, height, or a collider',

      // when args is spread from the constructor, we can't determine if the collider is missing
      ambiguousColliderInActorArgs:
        'Actor has a collisionType but it is ambiguous if width, height, or a collider will exist in `{{ spreadVariableName }}`.',
    },
  },
  create(context) {
    return {
      ClassDeclaration(node) {
        const classNames = ['Actor', 'ex.Actor']

        if (node.superClass) {
          const extendsActor = classNames.includes(node.superClass.name)
          const extendsExActor = classNames.includes(
            node.superClass.property?.name,
          )

          if (!extendsActor && !extendsExActor) {
            return
          }

          const constructor = node.body.body.find(
            (node) => node.kind === 'constructor',
          )

          if (!constructor) {
            return
          }

          /** @type {import('estree').ExpressionStatement | undefined} **/
          const superCall = constructor.value.body.body.find(
            (node) =>
              node.type === 'ExpressionStatement' &&
              node.expression.type === 'CallExpression' &&
              node.expression.callee.type === 'Super',
          )

          if (!superCall) {
            return
          }

          /**
           * @type {import('estree').ObjectExpression | undefined}
           */
          const actorArgs =
            superCall.expression.arguments[0]?.type === 'ObjectExpression' &&
            superCall.expression.arguments[0]

          if (!actorArgs) {
            return
          }

          const properties = actorArgs.properties

          if (!properties) {
            return
          }

          const collisionType = properties.find(
            (node) => node.key?.name === 'collisionType',
          )

          if (!collisionType) {
            return
          }

          const flattenedProperties = populateSpreadInProperties(
            context,
            properties,
          )

          if (!hasColliderArgs(flattenedProperties)) {
            const unflattened = flattenedProperties.find(
              (node) => node.type === 'SpreadElement',
            )

            // we were unable to resolve a spread (e.g. it's a param in the constructor)
            if (unflattened) {
              context.report({
                node: collisionType,
                messageId: 'ambiguousColliderInActorArgs',
                data: {
                  spreadVariableName: unflattened.argument?.name,
                },
                suggest: [
                  {
                    desc: 'Explicitly set width, height or collider',
                    fix: function (fixer) {
                      const indents = ' '.repeat(unflattened.loc.start.column)

                      return fixer.insertTextAfter(
                        unflattened,
                        `,\n${indents}width: ${unflattened.argument.name}.width,\n${indents}height: ${unflattened.argument.name}.height,\n${indents}collider: ${unflattened.argument.name}.collider`,
                      )
                    },
                  },
                ],
              })
            }
            // properties are missing width and height or a collider
            else {
              context.report({
                node: collisionType,
                messageId: 'missingColliderInActorArgs',
              })
            }
          }
        }
      },
    }
  },
}

/**
 * Iterate over the properties of an object and replace
 * spread elements with their properties
 * @param {import('eslint').Rule.RuleContext} context
 * @type {Array<import('estree').Property | import('estree').SpreadElement>}
 * @returns {Array<import('estree').Property | import('estree').SpreadElement>>}
 */
function populateSpreadInProperties(context, properties) {
  const spread = properties.find((node) => node.type === 'SpreadElement')

  return properties.flatMap((node) => {
    if (node.type === 'SpreadElement') {
      const declarator = getSpreadVariableDeclarator(spread)

      if (declarator?.init?.properties) {
        return populateSpreadInProperties(context, declarator.init.properties)
      }
    }

    return node
  })
}

/**
 * Return the variable declarator for a spread element
 * @type {import('estree').SpreadElement>}
 */
function getSpreadVariableDeclarator(spread) {
  const variableName = spread.argument?.name

  if (!variableName) {
    return
  }

  let parent = spread.parent

  while (parent) {
    if (parent.type === 'BlockStatement') {
      const variableDeclarator = parent.body
        .find((node) => node.type === 'VariableDeclaration')
        ?.declarations.find(
          (node) =>
            node.type === 'VariableDeclarator' && node.id.name === variableName,
        )

      if (variableDeclarator) {
        return variableDeclarator
      }
    }

    parent = parent.parent
  }
}

/**
 * Check if properties contain width and height or a collider
 */
function hasColliderArgs(properties) {
  const width = properties.find((node) => node.key?.name === 'width')
  const height = properties.find((node) => node.key?.name === 'height')
  const collider = properties.find((node) => node.key?.name === 'collider')

  return Boolean(width && height) || !!collider
}
