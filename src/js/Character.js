/**
 * Базовый класс, от которого наследуются классы персонажей
 * @property level - уровень персонажа, от 1 до 4
 * @property attack - показатель атаки
 * @property defence - показатель защиты
 * @property health - здоровье персонажа
 * @property type - строка с одним из допустимых значений:
 * swordsman
 * bowman
 * magician
 * daemon
 * undead
 * vampire
 */
export default class Character {
  constructor(level, type = 'generic') {
    if (new.target === Character) {
      throw new Error('Нельзя создавать экземпляр класса Character напрямую');
    }

    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;
    this.attackRange = 0;
    this.moveRange = 0;
  }

  levelUp() {
    const life = this.health;

    this.attack = Math.max(this.attack, Math.round(this.attack * (80 + life) / 100));
    this.defence = Math.max(this.defence, Math.round(this.defence * (80 + life) / 100));

    this.level += 1;
    
    this.health = Math.min(100, this.health + 80);
  }

}
