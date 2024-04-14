/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
const { ESLintUtils } = require('@typescript-eslint/utils')

module.exports = ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      missingColliderInActorArgs:
        'Actor has a collisionType but is missing width, height, or a collider',
      // when args is spread from the constructor, we can't determine if the collider is missing
      ambiguousColliderInActorArgs:
        'Actor has a collisionType but it is uncertain if width, height, or a collider will exist in `{{ spreadVariableName }}`.',
    },
  },
  defaultOptions: [],
  create(context) {
    const services = ESLintUtils.getParserServices(context)

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

          /** @type {import('@typescript-eslint/utils').TSESTree.ExpressionStatement | undefined} **/
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
           * @type {import('@typescript-eslint/utils').TSESTree.ObjectExpression | undefined}
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

          const providedActorArgsType = services.getTypeAtLocation(actorArgs)

          if (!hasColliderTypes(providedActorArgsType.getProperties())) {
            const untypedSpreadElements = properties.filter((node) => {
              if (node.type === 'SpreadElement') {
                const type = services.getTypeAtLocation(node.argument)
                return !type || type.getProperties().length === 0
              }
              return false
            })

            if (untypedSpreadElements.length > 0) {
              context.report({
                node: collisionType,
                messageId: 'ambiguousColliderInActorArgs',
                data: {
                  spreadVariableName: untypedSpreadElements[0].argument?.name,
                },
              })
            } else {
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
})

/**
 * @param {import('typescript').Symbol[]} properties
 */
function hasColliderTypes(properties) {
  const width = properties.find((node) => node.escapedName === 'width')
  const height = properties.find((node) => node.escapedName === 'height')
  const collider = properties.find((node) => node.escapedName === 'collider')

  return Boolean(width && height) || !!collider
}
