import { run } from '../test-utils.mjs'
import rule from './no-unadded-entity.js'

run('no-unadded-entity', rule, {
  valid: [
    {
      name: 'should not report when actor is added to a scene',
      code: `
        import * as ex from 'excalibur'
        const actor = new ex.Actor()

        const scene = new ex.Scene()
        scene.add(actor)
      `,
    },
    {
      name: 'should not report when actor class is added to a scene',
      code: `
        import * as ex from 'excalibur'

        class MyActor extends ex.Actor {}

        const actor = new MyActor()

        const scene = new ex.Scene()
        scene.add(actor)
      `,
    },
    {
      name: 'should not report when actor class is exported',
      code: `
        import * as ex from 'excalibur'

        class MyActor extends ex.Actor {}

        export const actor = new MyActor()
      `,
    },
  ],

  invalid: [
    {
      name: 'should report when actor is not added to a scene',
      code: `      
        import * as ex from 'excalibur'
        const actor = new ex.Actor()
      `,
      errors: [
        {
          messageId: 'entityNotAdded',
        },
      ],
    },
    {
      name: 'should report when eneity is not added to a scene',
      code: `      
        import * as ex from 'excalibur'
        const actor = new ex.Entity()
      `,
      errors: [
        {
          messageId: 'entityNotAdded',
        },
      ],
    },
    {
      name: 'should report when actor class is not added to a scene',
      code: `
        import * as ex from 'excalibur'

        class Actor extends ex.Actor {}

        const actor = new Actor({})
        `,
      errors: [
        {
          messageId: 'entityNotAdded',
        },
      ],
    },
    {
      name: 'should report when actor is instantiated but not assigned',
      code: `
        import * as ex from 'excalibur'
        const a = 
          new ex.Actor({})
        `,
      errors: [
        {
          messageId: 'entityNotAdded',
        },
      ],
    },
  ],
})
