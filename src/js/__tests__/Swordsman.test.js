import Swordsman from '../characters/Swordsman';

test('создание Swordsman', () => {
  const unit = new Swordsman(1);

  expect(unit).toEqual({
    level: 1,
    type: 'swordsman',
    health: 50,
    attack: 40,
    defence: 10,
    attackRange: 4,
    moveRange: 1
  });
});
