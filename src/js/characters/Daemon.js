import Character from '../Character';

export default class Daemon extends Character {
  constructor(level) {
    super(level, 'daemon');
    this.attack = 10;
    this.defence = 10;
    this.attackRange = 1;
    this.moveRange = 4;
  }
}
