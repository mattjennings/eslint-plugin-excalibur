import * as ex from 'excalibur'

class Actor extends ex.Actor {
  constructor(args) {
    super({
      ...args,
      collisionType: ex.CollisionType.Active,
    })
  }
}
