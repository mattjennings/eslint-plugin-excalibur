import { run } from '../test-utils.js'
import rule from './no-missing-collider.js'

run('no-missing-collider', rule, {
  valid: [
    `
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
    `
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
    `
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
  ],

  invalid: [
    {
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
      code: `
class MyActor extends Actor {
  constructor(args) {
    super({
      ...args,
      name: 'MyActor',
      collisionType: CollisionType.Passive
    })
  }
}`,
      errors: [
        {
          messageId: 'ambiguousColliderInActorArgs',
          suggestions: [
            {
              desc: 'Explicitly set width, height or collider',
              output: `
class MyActor extends Actor {
  constructor(args) {
    super({
      ...args,
      width: args.width,
      height: args.height,
      collider: args.collider,
      name: 'MyActor',
      collisionType: CollisionType.Passive
    })
  }
}`,
            },
          ],
        },
      ],
    },
  ],
})
