import { run } from '../test-utils.mjs'
import rule from './no-missing-collider.js'

run('no-missing-collider', rule, {
  valid: [
    {
      name: 'should not report when width and height are set',
      code: `
      class MyActor extends Actor {
        constructor() {
          super({
            name: 'MyActor',
            width: 10,
            height: 10,
            collisionType: CollisionType.Passive,
          })
        }
      }
      `,
    },
    {
      name: 'should not report when collider is set',
      code: `
      class MyActor extends Actor {
        constructor() {
          super({
            name: 'MyActor',
            collisionType: CollisionType.Passive,
            collider: new CircleCollider({
              radius: 10 // 10 pixel radius
            })
          })
        }
      }
      `,
    },
    {
      name: 'should not report when width and height are set in spread',
      code: `
      class MyActor extends Actor {
        constructor() {
          const args = {
            width: 10,
            height: 10
          }
          super({
            ...args,
            name: 'MyActor',
            collisionType: CollisionType.Passive
          })
        }
      }`,
    },
    {
      name: 'should allow spread when it is typed properly',
      code: `
class MyActor extends Actor {
  constructor(args: { width: number, height: number }) {
    super({
      ...args,
      name: 'MyActor',
      collisionType: CollisionType.Passive
    })
  }
}`,
    },
  ],

  invalid: [
    {
      name: 'should report when height/width is missing',
      code: `
class MyActor extends Actor {
  constructor() {
    super({
      name: 'MyActor',
      collisionType: CollisionType.Passive,
    })
  }
}
      `,
      errors: [
        {
          messageId: 'missingColliderInActorArgs',
        },
      ],
    },
    {
      name: 'should suggest to add width, height, or collider',
      code: `
class MyActor extends Actor {
  constructor(args) {
    const bah: {
      foo: string
    } = { foo: 'bar' }
    super({
      ...bah,
      ...args,
      name: 'MyActor',
      collisionType: CollisionType.Passive
    })
  }
}`,
      errors: [
        {
          messageId: 'ambiguousColliderInActorArgs',
        },
      ],
    },
  ],
})
