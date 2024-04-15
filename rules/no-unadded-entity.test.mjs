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
    {
      name: 'should not report when actor is instantiated inside scene class',
      code: `
      import * as ex from 'excalibur'

      class MyScene extends ex.Scene {
        onInitialize(): void {
          const player = new ex.Actor()
          this.add(player)
        }  
      }    
      `,
    },
    {
      name: 'should not report when variable is reassigned to entity variable',
      code: `
        import * as ex from 'excalibur'

        const actor = new ex.Actor()
        const scene = new ex.Scene()
        
        const a = actor
        const b = a

        scene.add(b)
      `,
    },
    {
      name: 'should not report when added as a child of another actor',
      code: `
        import * as ex from 'excalibur'

        const actor = new ex.Actor()
        const parent = new ex.Actor()
        parent.addChild(actor)

        const scene = new ex.Scene()
        scene.add(parent)
      `,
    },
    {
      name: 'should not report when added as a child of another actor as a class',
      code: `
        import * as ex from 'excalibur'

        class MyActor extends ex.Actor {
          onInitialize() {
            const child = new ex.Actor()
            this.addChild(child)
          }
        }
      `,
    },
    {
      name: 'should not report when added as a child of another actor as an extended class',
      code: `
        import * as ex from 'excalibur'

        class A extends ex.Actor {}

        class B extends A {
          onInitialize() {
            const child = new A()
            this.addChild(child)
          }
        }
      `,
    },
    {
      name: 'should not report when added to an unresolved type',
      code: `
        import * as ex from 'excalibur'

        const a = new ex.Actor()
        const b: any

        b.addChild(a)        
      `,
    },
    {
      name: 'should not report entities inside an array',
      code: `
        import * as ex from 'excalibur'

        const entities = [new ex.Actor(), new ex.Actor()]      
      `,
    },
    {
      name: 'should not report entities inside an object',
      code: `
        import * as ex from 'excalibur'

        const entities = { a: new ex.Actor() } 
      `,
    },
    {
      name: 'should not report entities returned inside a function',
      code: `
        import * as ex from 'excalibur'

        function createActor() {
          return new ex.Actor()
        }        
      `,
    },
    {
      name: 'should not report entity variable returned inside a function',
      code: `
        import * as ex from 'excalibur'

        function createActor() {
          const a = new ex.Actor()
          
          return a
        }

        scene.add(createActor())
      `,
    },
    {
      name: 'should not report when entity is assigned to scoped variable',
      code: `
      import * as ex from 'excalibur'
      
      let player

      class Player extends ex.Actor {}
      
      class A extends ex.Scene {
        onInitialize(): void {
          player = new Player()
          
          this.add(player)
        }
      }
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
      name: 'should report when entity is not added to a scene',
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
    {
      name: 'should report when variable is reassigned to entity variable but not added',
      code: `
        import * as ex from 'excalibur'

        const actor = new ex.Actor()
        const scene = new ex.Scene()
        
        const a = actor
        const b = a
      `,
      errors: [
        {
          messageId: 'entityNotAdded',
        },
      ],
    },
  ],
})
