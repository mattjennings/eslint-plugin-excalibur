import * as ex from 'excalibur'

class MyActor extends ex.Actor {
  constructor(args: { width: number; height: number }) {
    super({
      ...args,
      collisionType: ex.CollisionType.Active,
    })
  }
}

const actor = new MyActor({})
