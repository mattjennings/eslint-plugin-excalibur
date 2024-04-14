import * as ex from 'excalibur'

class Actor extends ex.Actor {
  constructor(args: { width: number; heightt: number }) {
    super({
      ...args,
      collisionType: ex.CollisionType.Active,
    })
  }
}
